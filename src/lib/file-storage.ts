import { supabase } from "@/integrations/supabase/client";

export const APPLICATION_DOCUMENTS_BUCKET = "application-documents";
export const MAX_APPLICATION_FILE_SIZE = 15 * 1024 * 1024;
export const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;

const MIME_BY_EXTENSION: Record<string, string> = {
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  heic: "image/heic",
  heif: "image/heif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  pdf: "application/pdf",
  png: "image/png",
  webp: "image/webp",
};

const APPLICATION_FILE_EXTENSIONS = new Set(Object.keys(MIME_BY_EXTENSION));
const IMAGE_FILE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);

export type UploadedFile = {
  path: string;
  contentType: string;
  fileName: string;
};

const extensionFromName = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase().trim() || "";
  return extension.replace(/[^a-z0-9]/g, "");
};

export const getFileExtension = (fileName: string) => extensionFromName(fileName);

export const getFileContentType = (file: File) => {
  const extension = extensionFromName(file.name);
  return file.type || MIME_BY_EXTENSION[extension] || "application/octet-stream";
};

export const getDocumentKind = (fileName: string): "image" | "pdf" | "office" | "unknown" => {
  const extension = extensionFromName(fileName);
  if (["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(extension)) return "image";
  if (extension === "pdf") return "pdf";
  if (["doc", "docx"].includes(extension)) return "office";
  return "unknown";
};

export const validateUpload = (file: File, maxSize = MAX_APPLICATION_FILE_SIZE) => {
  if (!file || file.size === 0) {
    throw new Error("Please choose a file that is not empty.");
  }

  if (file.size > maxSize) {
    throw new Error(`File must be smaller than ${Math.round(maxSize / 1024 / 1024)}MB.`);
  }

  const extension = extensionFromName(file.name);
  if (!APPLICATION_FILE_EXTENSIONS.has(extension)) {
    throw new Error("Use PDF, DOC, DOCX, JPG, PNG, WEBP, or HEIC files.");
  }
};

export const validateImageUpload = (file: File, maxSize = MAX_AVATAR_FILE_SIZE) => {
  validateUpload(file, maxSize);
  if (!IMAGE_FILE_EXTENSIONS.has(extensionFromName(file.name))) {
    throw new Error("Use a JPG, PNG, WEBP, or HEIC image.");
  }
};

const createUniqueId = () => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const uploadUserFile = async (
  userId: string,
  file: File,
  folder: string,
  maxSize = MAX_APPLICATION_FILE_SIZE,
): Promise<UploadedFile> => {
  validateUpload(file, maxSize);

  const extension = extensionFromName(file.name);
  const path = `${userId}/${folder}/${createUniqueId()}.${extension}`;
  const contentType = getFileContentType(file);
  const { error } = await supabase.storage
    .from(APPLICATION_DOCUMENTS_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      contentType,
      upsert: false,
    });

  if (error) throw error;
  return { path, contentType, fileName: file.name };
};
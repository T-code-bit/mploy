import { supabase } from "@/integrations/supabase/client";

export const APPLICATION_DOCUMENTS_BUCKET = "application-documents";
export const MAX_APPLICATION_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;

const MIME_BY_EXTENSION: Record<string, string> = {
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  heic: "image/heic",
  heif: "image/heif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  pdf: "application/pdf",
  png: "image/png",
  odt: "application/vnd.oasis.opendocument.text",
  rtf: "application/rtf",
  txt: "text/plain",
  webp: "image/webp",
};

const EXTENSION_BY_MIME: Record<string, string> = {
  "application/msword": "doc",
  "application/pdf": "pdf",
  "application/rtf": "rtf",
  "application/vnd.oasis.opendocument.text": "odt",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "text/plain": "txt",
};

const APPLICATION_FILE_EXTENSIONS = new Set(Object.keys(MIME_BY_EXTENSION));
const IMAGE_FILE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);

export type UploadedFile = {
  path: string;
  contentType: string;
  fileName: string;
};

const extensionFromName = (fileName: string) => {
  const cleanName = fileName.split(/[?#]/, 1)[0];
  const lastDot = cleanName.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === cleanName.length - 1) return "";
  const extension = cleanName.slice(lastDot + 1).toLowerCase().trim();
  return extension.replace(/[^a-z0-9]/g, "");
};

export const getFileExtension = (fileName: string) => extensionFromName(fileName);

export const getUploadFileExtension = (file: File) =>
  extensionFromName(file.name) || EXTENSION_BY_MIME[file.type.toLowerCase()] || "";

export const getFileContentType = (file: File) => {
  const extension = getUploadFileExtension(file);
  const reportedType = file.type.toLowerCase();
  return reportedType && reportedType !== "application/octet-stream"
    ? reportedType
    : MIME_BY_EXTENSION[extension] || "application/octet-stream";
};

export const getDocumentKind = (fileName: string): "image" | "pdf" | "office" | "unknown" => {
  const extension = extensionFromName(fileName);
  if (["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(extension)) return "image";
  if (extension === "pdf") return "pdf";
  if (["doc", "docx", "odt", "rtf", "txt"].includes(extension)) return "office";
  return "unknown";
};

export const validateUpload = (file: File, maxSize = MAX_APPLICATION_FILE_SIZE) => {
  if (!file || file.size === 0) {
    throw new Error("Please choose a file that is not empty.");
  }

  if (file.size > maxSize) {
    throw new Error(`File must be ${Math.round(maxSize / 1024 / 1024)}MB or smaller.`);
  }

  const extension = getUploadFileExtension(file);
  if (!APPLICATION_FILE_EXTENSIONS.has(extension)) {
    throw new Error("Use PDF, DOC, DOCX, ODT, RTF, TXT, JPG, PNG, WEBP, or HEIC files.");
  }
};

export const validateImageUpload = (file: File, maxSize = MAX_AVATAR_FILE_SIZE) => {
  validateUpload(file, maxSize);
  if (!IMAGE_FILE_EXTENSIONS.has(getUploadFileExtension(file))) {
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

  const extension = getUploadFileExtension(file);
  const path = `${userId}/${folder}/${createUniqueId()}.${extension}`;
  const contentType = getFileContentType(file);

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { error } = await supabase.storage
      .from(APPLICATION_DOCUMENTS_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        contentType,
        upsert: true,
      });

    if (!error) {
      return { path, contentType, fileName: file.name };
    }

    lastError = error;
    if (attempt < 2) {
      await new Promise((resolve) => window.setTimeout(resolve, 600 * (attempt + 1)));
    }
  }

  throw lastError || new Error("The file upload failed. Check your connection and try again.");
};
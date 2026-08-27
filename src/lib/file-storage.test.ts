import { describe, expect, it } from "vitest";
import {
  getDocumentKind,
  getFileContentType,
  validateImageUpload,
  validateUpload,
} from "@/lib/file-storage";

describe("file storage helpers", () => {
  it("recognizes previewable and download-only document types", () => {
    expect(getDocumentKind("candidate/cv/abc.pdf")).toBe("pdf");
    expect(getDocumentKind("candidate/id/abc.PNG")).toBe("image");
    expect(getDocumentKind("candidate/cv/abc.docx")).toBe("office");
    expect(getDocumentKind("candidate/file/abc.zip")).toBe("unknown");
  });

  it("uses a compatible content type when a mobile browser omits it", () => {
    const file = new File(["resume"], "CV.DOCX", { type: "" });
    expect(getFileContentType(file)).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
  });

  it("infers an extension when a mobile provider returns a generic file name", () => {
    const file = new File(["resume"], "document", { type: "application/pdf" });
    expect(() => validateUpload(file)).not.toThrow();
    expect(getFileContentType(file)).toBe("application/pdf");
  });

  it("accepts supported application files and rejects unsupported uploads", () => {
    expect(() => validateUpload(new File(["cv"], "cv.pdf", { type: "application/pdf" }))).not.toThrow();
    expect(() => validateUpload(new File(["file"], "archive.zip", { type: "application/zip" }))).toThrow(
      "Use PDF, DOC, DOCX, ODT, RTF, TXT, JPG, PNG, WEBP, or HEIC files.",
    );
  });

  it("only accepts images for profile photos", () => {
    expect(() => validateImageUpload(new File(["image"], "avatar.webp", { type: "image/webp" }))).not.toThrow();
    expect(() => validateImageUpload(new File(["document"], "cv.pdf", { type: "application/pdf" }))).toThrow(
      "Use a JPG, PNG, WEBP, or HEIC image.",
    );
  });
});
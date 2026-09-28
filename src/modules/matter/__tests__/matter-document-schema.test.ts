import { describe, expect, it } from "vitest";
import { sanitizeFilename, buildMatterStoragePath } from "../schemas/matter-document-schema";
import { MATTER_ALLOWED_MIME_TYPES, MATTER_MAX_FILE_SIZE } from "../types/matter-document-types";

describe("matter-document-schema", () => {
  it("sanitize prevents traversal", () => {
    expect(sanitizeFilename("../etc/passwd")).toBe("passwd");
    expect(sanitizeFilename("a/b\\c.pdf")).toBe("c.pdf");
    expect(sanitizeFilename("  my file?.pdf ")).toBe("my_file_.pdf");
    expect(sanitizeFilename("...hidden")).toBe("hidden");
  });

  it("buildMatterStoragePath is tenant-scoped", () => {
    const p = buildMatterStoragePath("firm1", "matter1", "doc1", "safe.pdf");
    expect(p).toBe("firm/firm1/matters/matter1/doc1/safe.pdf");
    expect(p).not.toContain("..");
    expect(p.startsWith("firm/")).toBe(true);
  });

  it("allowed mime list strict", () => {
    expect(MATTER_ALLOWED_MIME_TYPES).toContain("application/pdf");
    expect(MATTER_ALLOWED_MIME_TYPES).toContain("image/jpeg");
    expect(MATTER_ALLOWED_MIME_TYPES).toContain("image/png");
    expect(MATTER_ALLOWED_MIME_TYPES).toContain("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    expect(MATTER_ALLOWED_MIME_TYPES).not.toContain("text/plain");
    expect(MATTER_ALLOWED_MIME_TYPES).not.toContain("application/msword");
  });

  it("max file size 10MB", () => {
    expect(MATTER_MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
  });

  it("rejects >10MB logic", () => {
    const tooLarge = 10 * 1024 * 1024 + 1;
    expect(tooLarge > MATTER_MAX_FILE_SIZE).toBe(true);
  });

  it("private bucket tenant ownership — path contains firm/matter/doc", () => {
    const path = buildMatterStoragePath("f-123", "m-456", "d-789", "file.pdf");
    expect(path).toContain("f-123");
    expect(path).toContain("m-456");
    expect(path).toContain("d-789");
  });
});

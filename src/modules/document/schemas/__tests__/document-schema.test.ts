import { describe, expect, it } from "vitest";
import { buildStoragePath, sanitizeFilename } from "../document-schema";
import { ALLOWED_MIME_TYPES } from "../../types/document-types";

describe("document-schema", () => {
  it("sanitize prevents traversal", () => {
    expect(sanitizeFilename("../etc/passwd")).toBe("passwd");
    expect(sanitizeFilename("a/b\\c.pdf")).toBe("c.pdf");
    expect(sanitizeFilename("  my file?.pdf ")).toBe("my_file_.pdf");
  });

  it("buildStoragePath is tenant-scoped", () => {
    const p = buildStoragePath("firm1", "notice1", "doc1", "safe.pdf");
    expect(p).toBe("firm/firm1/notices/notice1/doc1/safe.pdf");
    expect(p).not.toContain("..");
  });

  it("allowed mime list", () => {
    expect(ALLOWED_MIME_TYPES).toContain("application/pdf");
    expect(ALLOWED_MIME_TYPES).toContain("image/jpeg");
    expect(ALLOWED_MIME_TYPES).not.toContain("text/plain");
  });
});

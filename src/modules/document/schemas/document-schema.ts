import { z } from "zod";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "../types/document-types";

export const uploadDocumentSchema = z.object({
  noticeId: z.string().uuid(),
  fileName: z.string().trim().min(1, "Filename required").max(255),
  mimeType: z.enum(ALLOWED_MIME_TYPES as unknown as [string, ...string[]], { message: "Unsupported file type" }),
  fileSize: z.number().int().positive().max(MAX_FILE_SIZE, "File too large (max 10 MB)"),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

export function sanitizeFilename(name: string): string {
  const base = name.trim().split(/[/\\]/).pop() ?? "file";
  // keep alphanum, dot, dash, underscore; replace rest
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100) || "file";
  // prevent hidden files
  return safe.replace(/^\.+/, "") || "file";
}

export function buildStoragePath(firmId: string, noticeId: string, documentId: string, safeName: string): string {
  return `firm/${firmId}/notices/${noticeId}/${documentId}/${safeName}`;
}

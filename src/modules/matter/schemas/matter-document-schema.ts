import { z } from "zod";
import { MATTER_ALLOWED_MIME_TYPES, MATTER_MAX_FILE_SIZE } from "../types/matter-document-types";

export const uploadMatterDocumentSchema = z.object({
  matterId: z.string().uuid(),
  checklistItemId: z.string().uuid().optional().nullable(),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.enum(MATTER_ALLOWED_MIME_TYPES as unknown as [string, ...string[]], {
    message: "Unsupported file type",
  }),
  fileSize: z.number().int().positive().max(MATTER_MAX_FILE_SIZE, "File too large (max 10 MB)"),
});

export function sanitizeFilename(name: string): string {
  const base = name.trim().split(/[/\\]/).pop() ?? "file";
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100) || "file";
  return safe.replace(/^\.+/, "") || "file";
}

export function buildMatterStoragePath(
  firmId: string,
  matterId: string,
  documentId: string,
  safeName: string,
): string {
  return `firm/${firmId}/matters/${matterId}/${documentId}/${safeName}`;
}

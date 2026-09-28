import { z } from "zod";

export const createMatterNoteSchema = z.object({
  matterId: z.string().uuid(),
  content: z.string().trim().min(1, "Note required").max(5000, "Max 5000 characters"),
});

export const updateMatterNoteSchema = z.object({
  noteId: z.string().uuid(),
  content: z.string().trim().min(1, "Note required").max(5000, "Max 5000 characters"),
});

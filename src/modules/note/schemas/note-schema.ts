import { z } from "zod";

export const createNoteSchema = z.object({
  noticeId: z.string().uuid(),
  content: z.string().trim().min(1, "Content required").max(5000, "Too long (max 5000)"),
});

export const updateNoteSchema = z.object({
  id: z.string().uuid(),
  content: z.string().trim().min(1, "Content required").max(5000),
});

export const deleteNoteSchema = z.object({
  id: z.string().uuid(),
});

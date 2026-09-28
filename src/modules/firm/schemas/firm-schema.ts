import { z } from "zod";

export const createFirmSchema = z.object({
  name: z.string().trim().min(2, "Firm name must be at least 2 characters").max(200),
});

export type CreateFirmInput = z.infer<typeof createFirmSchema>;

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "firm";
}

import { z } from "zod";
import { MATTER_TYPES } from "../constants/matter-constants";

export const createMatterSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title required")
    .max(200, "Title max 200"),
  matter_type: z.enum(MATTER_TYPES as unknown as [string, ...string[]], {
    message: "Invalid matter type",
  }),
  client_id: z.string().uuid("Invalid client"),
  assigned_to: z.string().uuid().optional().or(z.literal("")).or(z.null()),
  next_action: z
    .string()
    .trim()
    .max(500, "Next action max 500")
    .optional()
    .or(z.literal("")),
  next_action_date: z.string().optional().or(z.literal("")).or(z.null()),
  deadline: z.string().optional().or(z.literal("")).or(z.null()),
});

export const updateMatterSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  assigned_to: z.string().uuid().optional().or(z.literal("")).or(z.null()),
  next_action: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),
  next_action_date: z.string().optional().or(z.literal("")).or(z.null()),
  deadline: z.string().optional().or(z.literal("")).or(z.null()),
});

export type CreateMatterInput = z.infer<typeof createMatterSchema>;
export type UpdateMatterInput = z.infer<typeof updateMatterSchema>;

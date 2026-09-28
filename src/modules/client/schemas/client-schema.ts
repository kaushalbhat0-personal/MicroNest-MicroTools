import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().trim().min(7, "Phone too short").max(30).optional().or(z.literal("")),
  address: z
    .object({
      line1: z.string().trim().max(200).optional(),
      city: z.string().trim().max(100).optional(),
      state: z.string().trim().max(100).optional(),
      postalCode: z.string().trim().max(20).optional(),
    })
    .partial()
    .optional(),
});

export const updateClientSchema = createClientSchema.extend({
  id: z.string().uuid(),
});

export const archiveClientSchema = z.object({
  id: z.string().uuid(),
  is_archived: z.boolean(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

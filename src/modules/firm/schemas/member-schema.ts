import { z } from "zod";

export const updateMemberRoleSchema = z.object({
  memberId: z.string().uuid("Invalid member"),
  role: z.enum(["member", "admin"], { message: "Role must be member or admin" }),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

import { z } from "zod";

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, "Usuario requerido"),
  role: z.enum([
    "SUPER_ADMIN",
    "OWNER",
    "MANAGER",
    "CASHIER",
    "BAR",
    "SECURITY",
  ]),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
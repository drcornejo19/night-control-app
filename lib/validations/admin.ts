import { z } from "zod";
import { appRoles } from "@/lib/constants/roles";

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, "Usuario requerido"),
  role: z.enum(appRoles),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

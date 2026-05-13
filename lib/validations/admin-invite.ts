import { z } from "zod";
import { appRoles } from "@/lib/constants/roles";

export const inviteUserSchema = z.object({
  email: z.string().email("Email invÃ¡lido"),
  venueId: z.string().min(1, "Boliche requerido"),
  role: z.enum(appRoles),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;

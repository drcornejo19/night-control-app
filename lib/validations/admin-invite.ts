import { z } from "zod";

export const inviteUserSchema = z.object({
  email: z.string().email("Email inválido"),
  venueId: z.string().min(1, "Boliche requerido"),
  role: z.enum([
    "SUPER_ADMIN",
    "OWNER",
    "MANAGER",
    "CASHIER",
    "BAR",
    "SECURITY",
  ]),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
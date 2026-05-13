import { z } from "zod";
import { appRoles } from "@/lib/constants/roles";

export const createMembershipSchema = z.object({
  userId: z.string().min(1, "Usuario requerido"),
  venueId: z.string().min(1, "Boliche requerido"),
  role: z.enum(appRoles),
});

export const deleteMembershipSchema = z.object({
  membershipId: z.string().min(1, "Membership requerido"),
});

export type CreateMembershipInput = z.infer<typeof createMembershipSchema>;
export type DeleteMembershipInput = z.infer<typeof deleteMembershipSchema>;

"use server";

import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import {
  inviteUserSchema,
  type InviteUserInput,
} from "@/lib/validations/admin-invite";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function inviteUser(
  input: InviteUserInput
): Promise<ActionState> {
  await requireRole(permissions.manageUsers);

  const parsed = inviteUserSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { email, venueId, role } = parsed.data;

  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { id: true, name: true },
  });

  if (!venue) {
    return { ok: false, message: "El boliche no existe" };
  }

  try {
    const client = await clerkClient();

    await client.invitations.createInvitation({
      emailAddress: email,
      ignoreExisting: true,
      publicMetadata: {
        invitedVenueId: venueId,
        invitedRole: role,
        invitedByApp: "night-control",
      },
    });

    revalidatePath("/admin/users");

    return {
      ok: true,
      message: `Invitación enviada a ${email} para ${venue.name}`,
    };
  } catch (error) {
    console.error("inviteUser error", error);
    return {
      ok: false,
      message: "No se pudo enviar la invitación",
    };
  }
}
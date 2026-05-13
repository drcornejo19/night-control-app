"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import {
  createMembershipSchema,
  type CreateMembershipInput,
} from "@/lib/validations/memberships";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function createMembership(
  input: CreateMembershipInput
): Promise<ActionState> {
  await requireRole(permissions.manageUsers);

  const parsed = createMembershipSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos invÃ¡lidos",
    };
  }

  const { userId, venueId, role } = parsed.data;

  const [user, venue, existing] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    }),
    prisma.venue.findUnique({
      where: { id: venueId },
      select: { id: true, name: true, companyId: true },
    }),
    prisma.membership.findUnique({
      where: {
        userId_venueId: {
          userId,
          venueId,
        },
      },
      select: { id: true },
    }),
  ]);

  if (!user) {
    return { ok: false, message: "El usuario no existe" };
  }

  if (!venue) {
    return { ok: false, message: "El boliche no existe" };
  }

  if (existing) {
    return {
      ok: false,
      message: "Ese usuario ya tiene acceso a este boliche",
    };
  }

  await prisma.membership.create({
    data: {
      userId,
      venueId,
      role,
    },
  });

  if (venue.companyId) {
    await prisma.user.update({
      where: { id: userId },
      data: { companyId: venue.companyId },
    });
  }

  revalidatePath("/admin/users");

  return {
    ok: true,
    message: `Membership creado para ${user.name} en ${venue.name}`,
  };
}

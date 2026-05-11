"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import {
  deleteMembershipSchema,
  type DeleteMembershipInput,
} from "@/lib/validations/memberships";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function deleteMembership(
  input: DeleteMembershipInput
): Promise<ActionState> {
  await requireRole(permissions.manageUsers);

  const parsed = deleteMembershipSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { membershipId } = parsed.data;

  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: {
      user: true,
      venue: true,
    },
  });

  if (!membership) {
    return { ok: false, message: "La relación no existe" };
  }

  await prisma.membership.delete({
    where: { id: membershipId },
  });

  revalidatePath("/admin/users");

  return {
    ok: true,
    message: `Membership eliminado para ${membership.user.name} en ${membership.venue.name}`,
  };
}
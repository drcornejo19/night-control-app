"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import {
  updateUserRoleSchema,
  type UpdateUserRoleInput,
} from "@/lib/validations/admin";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function updateUserRole(
  input: UpdateUserRoleInput
): Promise<ActionState> {
  await requireRole(permissions.manageUsers);

  const parsed = updateUserRoleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { userId, role } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
    },
  });

  if (!existingUser) {
    return {
      ok: false,
      message: "El usuario no existe",
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");

  return {
    ok: true,
    message: `Rol actualizado para ${existingUser.name}`,
  };
}
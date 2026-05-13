"use server";

import { revalidatePath } from "next/cache";
import { MovementType, PaymentMethod } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getCurrentAppUser, requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import {
  createCashMovementSchema,
  type CreateCashMovementInput,
} from "@/lib/validations/cash";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function createCashMovement(
  input: CreateCashMovementInput
): Promise<ActionState> {
  await requireRole(permissions.cashOpenClose);

  const parsed = createCashMovementSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos invalidos",
    };
  }

  const { cashBoxId, type, category, amount, method, note } = parsed.data;

  const cashBox = await prisma.cashBox.findUnique({
    where: { id: cashBoxId },
    select: {
      id: true,
      status: true,
      nightId: true,
    },
  });

  if (!cashBox) {
    return { ok: false, message: "Caja no encontrada" };
  }

  if (cashBox.status !== "OPEN") {
    return { ok: false, message: "La caja esta cerrada" };
  }

  const currentUser = await getCurrentAppUser();
  const dbUser = currentUser
    ? await prisma.user.findUnique({
        where: { clerkUserId: currentUser.clerkUserId },
        select: { id: true },
      })
    : null;

  await prisma.cashMovement.create({
    data: {
      cashBoxId,
      userId: dbUser?.id ?? null,
      type: type as MovementType,
      category,
      amount,
      method: method ? (method as PaymentMethod) : null,
      note: note || null,
    },
  });

  revalidatePath("/cash");
  revalidatePath(`/nights/${cashBox.nightId}`);
  revalidatePath("/dashboard");

  return { ok: true, message: "Movimiento registrado correctamente" };
}

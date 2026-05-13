"use server";

import { revalidatePath } from "next/cache";
import { CashBoxStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getCurrentAppUser, requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import { closeCashSchema } from "@/lib/validations/cash";

export async function closeCash(input: unknown) {
  await requireRole(permissions.cashOpenClose);

  const parsed = closeCashSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const { cashBoxId, closing } = parsed.data;
  const currentUser = await getCurrentAppUser();

  const cashBox = await prisma.cashBox.findUnique({
    where: { id: cashBoxId },
    include: { movements: true },
  });

  if (!cashBox) {
    return { ok: false, message: "Caja no encontrada" };
  }

  if (cashBox.status === "CLOSED") {
    return { ok: false, message: "La caja ya esta cerrada" };
  }

  const income = cashBox.movements
    .filter((movement) => movement.type === "INCOME")
    .reduce((acc, movement) => acc + movement.amount, 0);

  const expense = cashBox.movements
    .filter((movement) => movement.type === "EXPENSE")
    .reduce((acc, movement) => acc + movement.amount, 0);

  const adjustments = cashBox.movements
    .filter((movement) => movement.type === "ADJUSTMENT")
    .reduce((acc, movement) => acc + movement.amount, 0);

  const expected = cashBox.opening + income - expense + adjustments;
  const difference = closing - expected;

  const dbUser = currentUser
    ? await prisma.user.findUnique({
        where: { clerkUserId: currentUser.clerkUserId },
        select: { id: true },
      })
    : null;

  await prisma.cashBox.update({
    where: { id: cashBoxId },
    data: {
      closing,
      expected,
      difference,
      status: CashBoxStatus.CLOSED,
      closedById: dbUser?.id ?? null,
      closedAt: new Date(),
    },
  });

  revalidatePath("/cash");
  revalidatePath("/nights");
  revalidatePath("/dashboard");

  return { ok: true, message: "Caja cerrada correctamente" };
}

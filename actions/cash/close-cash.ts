"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { closeCashSchema } from "@/lib/validations/cash";
import { CashBoxStatus } from "@prisma/client";

export async function closeCash(input: unknown) {
  const parsed = closeCashSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const { cashBoxId, closing } = parsed.data;

  const cashBox = await prisma.cashBox.findUnique({
    where: { id: cashBoxId },
    include: { movements: true },
  });

  if (!cashBox) {
    return { ok: false, message: "Caja no encontrada" };
  }

  const income = cashBox.movements
    .filter((m) => m.type === "INCOME")
    .reduce((acc, m) => acc + m.amount, 0);

  const expense = cashBox.movements
    .filter((m) => m.type === "EXPENSE")
    .reduce((acc, m) => acc + m.amount, 0);

  const expected = cashBox.opening + income - expense;
  const difference = closing - expected;

  await prisma.cashBox.update({
    where: { id: cashBoxId },
    data: {
      closing,
      expected,
      difference,
      status: CashBoxStatus.CLOSED,
      closedAt: new Date(),
    },
  });

  revalidatePath("/cash");
  revalidatePath("/dashboard");

  return { ok: true, message: "Caja cerrada correctamente" };
}

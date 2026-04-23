"use server";

import { revalidatePath } from "next/cache";
import { MovementType, PaymentMethod } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  createExpenseSchema,
  type CreateExpenseInput,
} from "@/lib/validations/expenses";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function createExpense(
  input: CreateExpenseInput
): Promise<ActionState> {
  const parsed = createExpenseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { nightId, category, amount, note, paymentMethod } = parsed.data;

  const night = await prisma.night.findUnique({
    where: { id: nightId },
    include: { cashBox: true },
  });

  if (!night) {
    return { ok: false, message: "La noche no existe" };
  }

  await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        nightId,
        category,
        amount,
        note,
      },
    });

    if (night.cashBox) {
      await tx.cashMovement.create({
        data: {
          cashBoxId: night.cashBox.id,
          type: MovementType.EXPENSE,
          amount,
          method: paymentMethod as PaymentMethod,
          note: `Egreso ${expense.category}${note ? ` - ${note}` : ""}`,
        },
      });
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/cash");

  return {
    ok: true,
    message: "Gasto registrado correctamente",
  };
}
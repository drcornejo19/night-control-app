"use server";

import { revalidatePath } from "next/cache";
import { MovementType, PaymentMethod, type ExpenseCategory } from "@prisma/client";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
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
  const currentUser = await requireRole(permissions.expensesCreate);

  const parsed = createExpenseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos invalidos",
    };
  }

  const {
    venueId: inputVenueId,
    nightId,
    expenseCategoryId,
    category,
    amount,
    note,
    paymentMethod,
  } = parsed.data;

  const [night, venue, expenseCategory, dbUser] = await Promise.all([
    nightId
      ? prisma.night.findUnique({
          where: { id: nightId },
          include: { cashBox: true },
        })
      : Promise.resolve(null),
    inputVenueId
      ? prisma.venue.findUnique({
          where: { id: inputVenueId },
          select: { id: true },
        })
      : Promise.resolve(null),
    expenseCategoryId
      ? prisma.expenseCategoryConfig.findUnique({
          where: { id: expenseCategoryId },
        })
      : Promise.resolve(null),
    prisma.user.findUnique({
      where: { clerkUserId: currentUser.clerkUserId },
      select: { id: true },
    }),
  ]);

  if (nightId && !night) {
    return { ok: false, message: "La jornada no existe" };
  }

  if (inputVenueId && !venue) {
    return { ok: false, message: "La sede no existe" };
  }

  const venueId = night?.venueId ?? inputVenueId;

  if (!venueId) {
    return { ok: false, message: "Selecciona una sede o jornada" };
  }

  if (expenseCategoryId && !expenseCategory) {
    return { ok: false, message: "La categoria no existe" };
  }

  if (expenseCategory && expenseCategory.venueId !== venueId) {
    return {
      ok: false,
      message: "La categoria no pertenece a la sede seleccionada",
    };
  }

  await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        venueId,
        nightId: night?.id ?? null,
        userId: dbUser?.id ?? null,
        expenseCategoryId: expenseCategory?.id ?? null,
        category: category as ExpenseCategory,
        amount,
        description: note || expenseCategory?.name || category,
        note: note || null,
        paymentMethod: paymentMethod as PaymentMethod,
      },
    });

    if (night?.cashBox?.status === "OPEN") {
      await tx.cashMovement.create({
        data: {
          cashBoxId: night.cashBox.id,
          userId: dbUser?.id ?? null,
          type: MovementType.EXPENSE,
          category: expenseCategory?.name ?? category,
          amount,
          method: paymentMethod as PaymentMethod,
          note: `Egreso ${expenseCategory?.name ?? expense.category}${
            note ? ` - ${note}` : ""
          }`,
        },
      });
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/expenses/new");
  revalidatePath("/cash");
  if (night?.id) {
    revalidatePath(`/nights/${night.id}`);
  }

  return {
    ok: true,
    message: "Gasto registrado correctamente",
  };
}

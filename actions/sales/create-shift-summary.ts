"use server";

import { revalidatePath } from "next/cache";
import { MovementType, PaymentMethod } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getCurrentAppUser, requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import {
  createShiftSummarySchema,
  type CreateShiftSummaryInput,
} from "@/lib/validations/sales";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

const paymentEntries = [
  { key: "cashSales", method: PaymentMethod.CASH, label: "Efectivo" },
  {
    key: "transferSales",
    method: PaymentMethod.TRANSFER,
    label: "Transferencia",
  },
  { key: "cardSales", method: PaymentMethod.CARD, label: "Tarjeta" },
  { key: "qrSales", method: PaymentMethod.QR, label: "QR" },
] as const;

export async function createShiftSummary(
  input: CreateShiftSummaryInput
): Promise<ActionState> {
  await requireRole(permissions.salesCreate);

  const parsed = createShiftSummarySchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos invalidos",
    };
  }

  const {
    nightId,
    sector,
    cashSales,
    transferSales,
    cardSales,
    qrSales,
    observations,
  } = parsed.data;

  const night = await prisma.night.findUnique({
    where: { id: nightId },
    include: { cashBox: true },
  });

  if (!night) {
    return { ok: false, message: "La jornada no existe" };
  }

  if (night.status !== "OPEN") {
    return {
      ok: false,
      message: "Solo se pueden cargar cierres en jornadas abiertas",
    };
  }

  const currentUser = await getCurrentAppUser();
  const dbUser = currentUser
    ? await prisma.user.findUnique({
        where: { clerkUserId: currentUser.clerkUserId },
        select: { id: true },
      })
    : null;

  const totalSales = cashSales + transferSales + cardSales + qrSales;

  await prisma.$transaction(async (tx) => {
    const summary = await tx.shiftSummary.create({
      data: {
        nightId,
        sector,
        cashSales,
        transferSales,
        cardSales,
        qrSales,
        totalSales,
        observations: observations || null,
      },
    });

    if (night.cashBox?.status === "OPEN") {
      for (const entry of paymentEntries) {
        const amount = parsed.data[entry.key];

        if (amount <= 0) continue;

        await tx.cashMovement.create({
          data: {
            cashBoxId: night.cashBox.id,
            userId: dbUser?.id ?? null,
            type: MovementType.INCOME,
            category: `Resumen ${sector}`,
            amount,
            method: entry.method,
            note: `${entry.label} - cierre resumido ${summary.id}`,
          },
        });
      }
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/sales");
  revalidatePath("/cash");
  revalidatePath(`/nights/${nightId}`);

  return { ok: true, message: "Resumen por sector registrado" };
}

"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { openCashSchema } from "@/lib/validations/cash";

export async function openCash(input: any) {
  const parsed = openCashSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const { nightId, opening } = parsed.data;

  const existing = await prisma.cashBox.findUnique({
    where: { nightId },
  });

  if (existing) {
    return { ok: false, message: "La caja ya está abierta para esta noche" };
  }

  await prisma.cashBox.create({
    data: {
      nightId,
      opening,
    },
  });

  revalidatePath("/cash");
  revalidatePath("/dashboard");

  return { ok: true, message: "Caja abierta correctamente" };
}
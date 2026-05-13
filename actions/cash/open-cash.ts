"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getCurrentAppUser, requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import { openCashSchema } from "@/lib/validations/cash";

export async function openCash(input: unknown) {
  await requireRole(permissions.cashOpenClose);

  const parsed = openCashSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const { nightId, opening } = parsed.data;
  const currentUser = await getCurrentAppUser();

  const night = await prisma.night.findUnique({
    where: { id: nightId },
    include: { cashBox: true },
  });

  if (!night) {
    return { ok: false, message: "La jornada no existe" };
  }

  if (night.cashBox) {
    return { ok: false, message: "La caja ya esta creada para esta jornada" };
  }

  if (["CLOSED", "AUDITED", "CANCELLED"].includes(night.status)) {
    return {
      ok: false,
      message: "No se puede abrir caja en una jornada cerrada o cancelada",
    };
  }

  const dbUser = currentUser
    ? await prisma.user.findUnique({
        where: { clerkUserId: currentUser.clerkUserId },
        select: { id: true },
      })
    : null;

  await prisma.$transaction(async (tx) => {
    await tx.cashBox.create({
      data: {
        nightId,
        opening,
        expected: opening,
        openedById: dbUser?.id ?? null,
      },
    });

    if (night.status === "PLANNED") {
      await tx.night.update({
        where: { id: nightId },
        data: {
          status: "OPEN",
          openedAt: night.openedAt ?? new Date(),
          closedAt: null,
        },
      });
    }
  });

  revalidatePath("/cash");
  revalidatePath("/nights");
  revalidatePath("/dashboard");

  return { ok: true, message: "Caja abierta correctamente" };
}

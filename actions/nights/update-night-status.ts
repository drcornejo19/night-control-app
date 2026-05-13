"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import {
  updateNightStatusSchema,
  type UpdateNightStatusInput,
} from "@/lib/validations/nights";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function updateNightStatus(
  input: UpdateNightStatusInput
): Promise<ActionState> {
  await requireRole(permissions.manageNights);

  const parsed = updateNightStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { nightId, status } = parsed.data;

  const night = await prisma.night.findUnique({
    where: { id: nightId },
    include: {
      cashBox: true,
    },
  });

  if (!night) {
    return {
      ok: false,
      message: "La noche no existe",
    };
  }

  if (night.status === "AUDITED" && status !== "AUDITED") {
    return {
      ok: false,
      message: "La jornada auditada no se puede modificar desde este flujo",
    };
  }

  if (status === "AUDITED" && night.status !== "CLOSED") {
    return {
      ok: false,
      message: "Solo se puede auditar una jornada cerrada",
    };
  }

  if (status === "CLOSED" && night.cashBox?.status === "OPEN") {
    return {
      ok: false,
      message: "Cerrá la caja antes de cerrar la jornada",
    };
  }

  const now = new Date();

  await prisma.night.update({
    where: { id: nightId },
    data: {
      status: status as Prisma.NightUpdateInput["status"],
      openedAt:
        status === "OPEN" && !night.openedAt
          ? now
          : status === "PLANNED"
            ? null
            : night.openedAt,
      closedAt:
        status === "CLOSED" || status === "AUDITED"
          ? night.closedAt ?? now
          : status === "OPEN" || status === "PLANNED"
            ? null
            : night.closedAt,
    },
  });

  revalidatePath("/nights");
  revalidatePath("/dashboard");
  revalidatePath("/cash");
  revalidatePath("/sales");
  revalidatePath("/expenses");
  revalidatePath("/purchases");
  revalidatePath("/pos");

  return {
    ok: true,
    message: "Estado de la jornada actualizado correctamente",
  };
}

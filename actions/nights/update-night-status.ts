"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
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
  });

  if (!night) {
    return {
      ok: false,
      message: "La noche no existe",
    };
  }

  await prisma.night.update({
    where: { id: nightId },
    data: {
      status,
      closedAt: status === "CLOSED" ? new Date() : night.closedAt,
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
    message: "Estado de la noche actualizado correctamente",
  };
}
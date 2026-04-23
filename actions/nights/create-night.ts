"use server";

import { revalidatePath } from "next/cache";
import { NightStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  createNightSchema,
  type CreateNightInput,
} from "@/lib/validations/nights";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function createNight(
  input: CreateNightInput
): Promise<ActionState> {
  const parsed = createNightSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { venueId, name, date, openedAt } = parsed.data;

  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
  });

  if (!venue) {
    return {
      ok: false,
      message: "El boliche no existe",
    };
  }

  await prisma.night.create({
    data: {
      venueId,
      name,
      date: new Date(date),
      openedAt: openedAt ? new Date(openedAt) : null,
      status: NightStatus.OPEN,
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
    message: "Noche creada correctamente",
  };
}
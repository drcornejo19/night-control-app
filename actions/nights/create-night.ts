"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getCurrentAppUser, requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
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
  await requireRole(permissions.manageNights);

  const parsed = createNightSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { venueId, name, date, responsibleUserId, openedAt, openNow, observations } =
    parsed.data;
  const currentUser = await getCurrentAppUser();

  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { id: true },
  });

  if (!venue) {
    return {
      ok: false,
      message: "El boliche no existe",
    };
  }

  const responsibleUser = responsibleUserId
    ? await prisma.user.findUnique({
        where: { id: responsibleUserId },
        select: { id: true },
      })
    : currentUser
      ? await prisma.user.findUnique({
          where: { clerkUserId: currentUser.clerkUserId },
          select: { id: true },
        })
      : null;

  await prisma.night.create({
    data: {
      venueId,
      responsibleUserId: responsibleUser?.id ?? null,
      name,
      date: new Date(date),
      openedAt: openNow ? (openedAt ? new Date(openedAt) : new Date()) : null,
      status: (openNow
        ? "OPEN"
        : "PLANNED") as Prisma.NightCreateInput["status"],
      observations: observations || null,
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
    message: openNow
      ? "Jornada creada y abierta correctamente"
      : "Jornada planificada correctamente",
  };
}

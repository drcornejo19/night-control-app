"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import { calculateBreakEven } from "@/lib/finance/break-even";
import {
  createBreakEvenScenarioSchema,
  type CreateBreakEvenScenarioInput,
} from "@/lib/validations/break-even";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function createBreakEvenScenario(
  input: CreateBreakEvenScenarioInput
): Promise<ActionState> {
  await requireRole(permissions.manageBreakEven);

  const parsed = createBreakEvenScenarioSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos invalidos",
    };
  }

  const {
    venueId,
    nightId,
    name,
    fixedCosts,
    variableCosts,
    expectedAverageTicket,
    expectedAttendees,
  } = parsed.data;

  const [venue, night] = await Promise.all([
    prisma.venue.findUnique({
      where: { id: venueId },
      select: { id: true },
    }),
    nightId
      ? prisma.night.findUnique({
          where: { id: nightId },
          select: { id: true, venueId: true },
        })
      : Promise.resolve(null),
  ]);

  if (!venue) {
    return { ok: false, message: "La sede no existe" };
  }

  if (nightId && !night) {
    return { ok: false, message: "La jornada no existe" };
  }

  if (night && night.venueId !== venueId) {
    return { ok: false, message: "La jornada no pertenece a la sede" };
  }

  const expectedRevenue = expectedAverageTicket * expectedAttendees;
  const result = calculateBreakEven({
    revenue: expectedRevenue,
    fixedCosts,
    variableCosts,
    averageTicket: expectedAverageTicket,
    attendees: expectedAttendees,
  });

  await prisma.breakEvenScenario.create({
    data: {
      venueId,
      nightId: night?.id ?? null,
      name,
      fixedCosts,
      variableCosts,
      expectedAverageTicket,
      expectedAttendees,
      expectedRevenue,
      contributionMargin: result.contributionMargin,
      breakEvenRevenue: result.breakEvenRevenue,
      breakEvenAttendees: result.breakEvenAttendees,
    },
  });

  revalidatePath("/break-even");
  revalidatePath("/dashboard");
  if (night?.id) {
    revalidatePath(`/nights/${night.id}`);
  }

  return { ok: true, message: "Escenario guardado correctamente" };
}

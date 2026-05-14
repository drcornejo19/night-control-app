"use server";

import { revalidatePath } from "next/cache";
import {
  ExpenseCategoryType,
  FixedCostPeriodicity,
  VariableCostRelationType,
} from "@prisma/client";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import {
  createExpenseCategoryConfigSchema,
  createFixedCostSchema,
  createVariableCostSchema,
  type CreateExpenseCategoryConfigInput,
  type CreateFixedCostInput,
  type CreateVariableCostInput,
} from "@/lib/validations/expenses";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

async function assertVenueExists(venueId: string) {
  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { id: true },
  });

  return Boolean(venue);
}

export async function createExpenseCategoryConfig(
  input: CreateExpenseCategoryConfigInput
): Promise<ActionState> {
  await requireRole(permissions.manageCosts);

  const parsed = createExpenseCategoryConfigSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos invalidos",
    };
  }

  const { venueId, name, type } = parsed.data;

  if (!(await assertVenueExists(venueId))) {
    return { ok: false, message: "La sede no existe" };
  }

  const existing = await prisma.expenseCategoryConfig.findFirst({
    where: {
      venueId,
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    return { ok: false, message: "Ya existe una categoria con ese nombre" };
  }

  await prisma.expenseCategoryConfig.create({
    data: {
      venueId,
      name,
      type: type as ExpenseCategoryType,
    },
  });

  revalidatePath("/expenses");
  revalidatePath("/expenses/new");

  return { ok: true, message: "Categoria creada" };
}

export async function createFixedCost(
  input: CreateFixedCostInput
): Promise<ActionState> {
  await requireRole(permissions.manageCosts);

  const parsed = createFixedCostSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos invalidos",
    };
  }

  const { venueId, name, amount, periodicity, active } = parsed.data;

  if (!(await assertVenueExists(venueId))) {
    return { ok: false, message: "La sede no existe" };
  }

  await prisma.fixedCost.create({
    data: {
      venueId,
      name,
      amount,
      periodicity: periodicity as FixedCostPeriodicity,
      active,
    },
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");

  return { ok: true, message: "Costo fijo creado" };
}

export async function createVariableCost(
  input: CreateVariableCostInput
): Promise<ActionState> {
  await requireRole(permissions.manageCosts);

  const parsed = createVariableCostSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos invalidos",
    };
  }

  const { venueId, nightId, name, amount, relationType, active } = parsed.data;

  const [venueExists, night] = await Promise.all([
    assertVenueExists(venueId),
    nightId
      ? prisma.night.findUnique({
          where: { id: nightId },
          select: { id: true, venueId: true },
        })
      : Promise.resolve(null),
  ]);

  if (!venueExists) {
    return { ok: false, message: "La sede no existe" };
  }

  if (nightId && !night) {
    return { ok: false, message: "La jornada no existe" };
  }

  if (night && night.venueId !== venueId) {
    return { ok: false, message: "La jornada no pertenece a la sede" };
  }

  await prisma.variableCost.create({
    data: {
      venueId,
      nightId: night?.id ?? null,
      name,
      amount,
      relationType: relationType as VariableCostRelationType,
      active,
    },
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  if (night?.id) {
    revalidatePath(`/nights/${night.id}`);
  }

  return { ok: true, message: "Costo variable creado" };
}

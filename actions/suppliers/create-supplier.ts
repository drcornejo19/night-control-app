"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createSupplierSchema,
  type CreateSupplierInput,
} from "@/lib/validations/suppliers";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function createSupplier(
  input: CreateSupplierInput
): Promise<ActionState> {
  const parsed = createSupplierSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { venueId, name } = parsed.data;

  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
  });

  if (!venue) {
    return {
      ok: false,
      message: "El boliche no existe",
    };
  }

  const existing = await prisma.supplier.findFirst({
    where: {
      venueId,
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    return {
      ok: false,
      message: "Ya existe un proveedor con ese nombre en este boliche",
    };
  }

  await prisma.supplier.create({
    data: {
      venueId,
      name,
    },
  });

  revalidatePath("/suppliers");
  revalidatePath("/purchases");

  return {
    ok: true,
    message: "Proveedor creado correctamente",
  };
}
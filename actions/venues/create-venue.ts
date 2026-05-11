"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createVenueSchema,
  type CreateVenueInput,
} from "@/lib/validations/venues";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function createVenue(
  input: CreateVenueInput
): Promise<ActionState> {
  const parsed = createVenueSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { name, city } = parsed.data;

  const existing = await prisma.venue.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
    },
  });

  if (existing) {
    return { ok: false, message: "Ya existe un boliche con ese nombre" };
  }

  await prisma.venue.create({
    data: { name, city: city || null },
  });

  revalidatePath("/venues");
  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/suppliers");
  revalidatePath("/nights");

  return { ok: true, message: "Boliche creado correctamente" };
}
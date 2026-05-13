"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentAppUser } from "@/lib/auth";
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
      message: parsed.error.issues[0]?.message ?? "Datos invÃ¡lidos",
    };
  }

  const { name, address, city, capacity, businessType, timezone } = parsed.data;
  const currentUser = await getCurrentAppUser();

  const dbUser = currentUser
    ? await prisma.user.findUnique({
        where: { clerkUserId: currentUser.clerkUserId },
        select: { companyId: true },
      })
    : null;

  const fallbackCompany = await prisma.company.upsert({
    where: { slug: "night-control-demo" },
    update: {},
    create: {
      slug: "night-control-demo",
      commercialName: "Night Control Demo",
    },
  });

  const companyId = currentUser?.companyId ?? dbUser?.companyId ?? fallbackCompany.id;

  const existing = await prisma.venue.findFirst({
    where: {
      companyId,
      name: { equals: name, mode: "insensitive" },
    },
  });

  if (existing) {
    return { ok: false, message: "Ya existe un local con ese nombre" };
  }

  await prisma.venue.create({
    data: {
      companyId,
      name,
      address: address || null,
      city: city || null,
      capacity: capacity ?? null,
      businessType,
      timezone,
    },
  });

  revalidatePath("/venues");
  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/suppliers");
  revalidatePath("/nights");

  return { ok: true, message: "Boliche creado correctamente" };
}

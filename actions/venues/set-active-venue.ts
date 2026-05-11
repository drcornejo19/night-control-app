"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function setActiveVenue(venueId: string): Promise<ActionState> {
  if (!venueId) {
    return { ok: false, message: "Boliche inválido" };
  }

  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { id: true },
  });

  if (!venue) {
    return { ok: false, message: "El boliche no existe" };
  }

  const cookieStore = await cookies();

  cookieStore.set("activeVenueId", venueId, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/suppliers");
  revalidatePath("/nights");
  revalidatePath("/purchases");
  revalidatePath("/pos");
  revalidatePath("/sales");
  revalidatePath("/expenses");
  revalidatePath("/cash");

  return { ok: true, message: "Boliche activo actualizado" };
}
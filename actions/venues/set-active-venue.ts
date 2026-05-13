"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentAppUser } from "@/lib/auth";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function setActiveVenue(venueId: string): Promise<ActionState> {
  if (!venueId) {
    return { ok: false, message: "Boliche invÃ¡lido" };
  }

  const currentUser = await getCurrentAppUser();

  if (!currentUser) {
    return { ok: false, message: "No autorizado" };
  }

  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { id: true },
  });

  if (!venue) {
    return { ok: false, message: "El boliche no existe" };
  }

  if (currentUser.role !== "SUPER_ADMIN") {
    const membership = await prisma.membership.findFirst({
      where: {
        venueId,
        user: {
          clerkUserId: currentUser.clerkUserId,
        },
      },
      select: { id: true },
    });

    if (!membership) {
      return { ok: false, message: "No tenÃ©s acceso a este boliche" };
    }
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

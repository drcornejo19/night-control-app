"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function deleteVenue(venueId: string) {
  // cuidado: hay FK (nights, products, suppliers). En prod conviene soft-delete.
  await prisma.venue.delete({
    where: { id: venueId },
  });

  revalidatePath("/venues");
  revalidatePath("/dashboard");
}
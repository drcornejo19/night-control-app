import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getCurrentAppUser } from "@/lib/auth";

export async function getActiveVenueId() {
  const cookieStore = await cookies();
  const cookieVenueId = cookieStore.get("activeVenueId")?.value;

  const currentUser = await getCurrentAppUser();

  if (currentUser?.clerkUserId) {
    const dbUser = await prisma.user.findUnique({
      where: {
        clerkUserId: currentUser.clerkUserId,
      },
      include: {
        memberships: true,
      },
    });

    if (dbUser && dbUser.memberships.length > 0) {
      if (cookieVenueId) {
        const cookieMembership = dbUser.memberships.find(
          (membership) => membership.venueId === cookieVenueId
        );

        if (cookieMembership) {
          return cookieVenueId;
        }
      }

      return dbUser.memberships[0]?.venueId ?? null;
    }
  }

  if (cookieVenueId) {
    const exists = await prisma.venue.findUnique({
      where: { id: cookieVenueId },
      select: { id: true },
    });

    if (exists) {
      return cookieVenueId;
    }
  }

  if (currentUser?.venueId) {
    const exists = await prisma.venue.findUnique({
      where: { id: currentUser.venueId },
      select: { id: true },
    });

    if (exists) {
      return currentUser.venueId;
    }
  }

  const firstVenue = await prisma.venue.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  return firstVenue?.id ?? null;
}

export async function getActiveVenue() {
  const activeVenueId = await getActiveVenueId();

  if (!activeVenueId) return null;

  return prisma.venue.findUnique({
    where: { id: activeVenueId },
  });
}
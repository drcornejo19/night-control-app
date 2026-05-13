"use server";

import { clerkClient } from "@clerk/nextjs/server";

import { prisma } from "@/lib/db";
import { getCurrentAppUser } from "@/lib/auth";

export async function syncCurrentUser() {
  const user = await getCurrentAppUser();

  if (!user) {
    return { ok: false, message: "No autenticado" };
  }

  const fallbackCompany = await prisma.company.upsert({
    where: { slug: "night-control-demo" },
    update: {},
    create: {
      slug: "night-control-demo",
      commercialName: "Night Control Demo",
    },
  });

  const dbUser = await prisma.user.upsert({
    where: {
      clerkUserId: user.clerkUserId,
    },
    update: {
      companyId: user.companyId ?? fallbackCompany.id,
      name: user.fullName || user.email,
      email: user.email,
      role: user.role,
      lastLoginAt: new Date(),
    },
    create: {
      companyId: user.companyId ?? fallbackCompany.id,
      clerkUserId: user.clerkUserId,
      name: user.fullName || user.email,
      email: user.email,
      role: user.role,
      lastLoginAt: new Date(),
    },
  });

  const invitedVenueId = user.invitedVenueId ?? null;
  const invitedRole = user.invitedRole ?? null;

  if (invitedVenueId && invitedRole) {
    await prisma.membership.upsert({
      where: {
        userId_venueId: {
          userId: dbUser.id,
          venueId: invitedVenueId,
        },
      },
      update: {
        role: invitedRole,
      },
      create: {
        userId: dbUser.id,
        venueId: invitedVenueId,
        role: invitedRole,
      },
    });

    const client = await clerkClient();

    await client.users.updateUserMetadata(user.clerkUserId, {
      publicMetadata: {
        invitedVenueId: null,
        invitedRole: null,
        invitedByApp: null,
      },
    });
  }

  return { ok: true, message: "Usuario sincronizado" };
}

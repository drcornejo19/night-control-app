import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getActiveVenueId } from "@/lib/venues/active-venue";
import { isAppRole, type AppRole } from "@/lib/constants/roles";

export async function requireUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("No autorizado");
  }

  return userId;
}

export async function getCurrentAppUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();

  if (!user) {
    return null;
  }

  const metadataRole = user.publicMetadata?.role;
  const globalRole = isAppRole(metadataRole) ? metadataRole : "CASHIER";

  const companyId =
    (user.publicMetadata?.companyId as string | undefined) ?? null;

  const venueId =
    (user.publicMetadata?.venueId as string | undefined) ?? null;

  const invitedVenueId =
    (user.publicMetadata?.invitedVenueId as string | undefined) ?? null;

  const invitedRole =
    (user.publicMetadata?.invitedRole as AppRole | undefined) ?? null;

  return {
    clerkUserId: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? "",
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    fullName: [user.firstName, user.lastName].filter(Boolean).join(" "),
    role: globalRole,
    companyId,
    venueId,
    invitedVenueId,
    invitedRole,
  };
}

export function hasRole(userRole: AppRole, allowedRoles: AppRole[]) {
  return allowedRoles.includes(userRole);
}

export async function getEffectiveRoleForActiveVenue(): Promise<AppRole | null> {
  const currentUser = await getCurrentAppUser();

  if (!currentUser) {
    return null;
  }

  if (currentUser.role === "SUPER_ADMIN") {
    return "SUPER_ADMIN";
  }

  const activeVenueId = await getActiveVenueId();

  if (!activeVenueId) {
    return currentUser.role;
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      clerkUserId: currentUser.clerkUserId,
    },
    include: {
      memberships: true,
    },
  });

  if (!dbUser) {
    return currentUser.role;
  }

  const membership = dbUser.memberships.find(
    (item) => item.venueId === activeVenueId
  );

  if (membership) {
    return membership.role as AppRole;
  }

  return currentUser.role;
}

export async function requireRole(allowedRoles: AppRole[]) {
  const currentUser = await getCurrentAppUser();

  if (!currentUser) {
    throw new Error("No autorizado");
  }

  const effectiveRole = await getEffectiveRoleForActiveVenue();

  if (!effectiveRole) {
    throw new Error("No autorizado");
  }

  if (!hasRole(effectiveRole, allowedRoles)) {
    throw new Error("Sin permisos suficientes");
  }

  return {
    ...currentUser,
    effectiveRole,
  };
}

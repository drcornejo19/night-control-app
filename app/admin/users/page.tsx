import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { CreateMembershipForm } from "@/components/admin/create-membership-form";
import { DeleteMembershipButton } from "@/components/admin/delete-membership-button";

type UserRow = Prisma.UserGetPayload<{
  include: {
    memberships: {
      include: {
        venue: true;
      };
    };
  };
}>;

export default async function AdminUsersPage() {
  await requireRole(permissions.manageUsers);

  const [usersRaw, venues] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        memberships: {
          include: {
            venue: true,
          },
        },
      },
    }),
    prisma.venue.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  const users = usersRaw as UserRow[];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
            Admin
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-white">
            Usuarios y roles
          </h1>
          <p className="mt-2 text-zinc-400">
            Administrá roles globales y accesos por boliche.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Usuarios totales</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {users.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Memberships totales</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {users.reduce((acc, user) => acc + user.memberships.length, 0)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Boliches disponibles</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {venues.length}
            </p>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5 md:p-6">
          <div className="grid gap-4">
            {users.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-zinc-400">
                No hay usuarios sincronizados todavía.
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-semibold text-white">
                          {user.name}
                        </p>

                        <p className="mt-1 truncate text-sm text-zinc-400">
                          {user.email}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300">
                            Rol global: {user.role}
                          </span>

                          <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300">
                            Alta: {new Date(user.createdAt).toLocaleString("es-AR")}
                          </span>
                        </div>
                      </div>

                      <div className="flex min-w-[220px] flex-col gap-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          Cambiar rol global
                        </p>
                        <UserRoleSelect
                          userId={user.id}
                          currentRole={user.role}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Memberships por boliche
                      </p>

                      {user.memberships.length === 0 ? (
                        <div className="mb-4 rounded-xl border border-red-500/10 bg-red-500/5 px-3 py-3 text-sm text-red-300">
                          Este usuario no tiene accesos asignados a boliches.
                        </div>
                      ) : (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {user.memberships.map((membership) => (
                            <div
                              key={membership.id}
                              className="flex items-center gap-2 rounded-full bg-[#D4AF37]/10 px-3 py-2 text-xs text-[#D4AF37]"
                            >
                              <span>
                                {membership.venue.name} · {membership.role}
                              </span>
                              <DeleteMembershipButton
                                membershipId={membership.id}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <CreateMembershipForm
                        userId={user.id}
                        venues={venues}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
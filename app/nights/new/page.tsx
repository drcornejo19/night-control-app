import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { NewNightForm } from "@/components/nights/new-night-form";
import { getActiveVenueId } from "@/lib/venues/active-venue";

export default async function NewNightPage() {
  const activeVenueId = await getActiveVenueId();

  const [venues, users] = await Promise.all([
    prisma.venue.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.user.findMany({
      where: activeVenueId
        ? {
            memberships: {
              some: {
                venueId: activeVenueId,
              },
            },
          }
        : undefined,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
  ]);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
            Noches
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-white">
            Nueva noche
          </h1>
          <p className="mt-2 text-zinc-400">
            Crea jornadas/eventos reales para operar ventas, gastos, compras y caja.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#131313] to-[#090909] p-6">
          <NewNightForm
            venues={venues}
            users={users}
            activeVenueId={activeVenueId}
          />
        </div>
      </div>
    </AppShell>
  );
}

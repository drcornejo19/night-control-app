import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { NewSupplierForm } from "@/components/suppliers/new-supplier-form";
import { getActiveVenueId } from "@/lib/venues/active-venue";
import { VenueSwitcher } from "@/components/venues/venue-switcher";

export default async function NewSupplierPage() {
  const activeVenueId = await getActiveVenueId();

  const venues = await prisma.venue.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  const defaultVenues = activeVenueId
    ? [
        ...venues.filter((venue) => venue.id === activeVenueId),
        ...venues.filter((venue) => venue.id !== activeVenueId),
      ]
    : venues;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Proveedores
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Nuevo proveedor
            </h1>
            <p className="mt-2 text-zinc-400">
              Cargá un proveedor para el boliche activo.
            </p>
          </div>

          <VenueSwitcher venues={venues} activeVenueId={activeVenueId} />
        </div>

        <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#131313] to-[#090909] p-6">
          <NewSupplierForm venues={defaultVenues} />
        </div>
      </div>
    </AppShell>
  );
}
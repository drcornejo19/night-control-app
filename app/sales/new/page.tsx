import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { NewSaleForm } from "@/components/sales/new-sale-form";
import { getActiveVenueId } from "@/lib/venues/active-venue";
import { VenueSwitcher } from "@/components/venues/venue-switcher";

export default async function NewSalePage() {
  const activeVenueId = await getActiveVenueId();

  const [venues, nights, products] = await Promise.all([
    prisma.venue.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.night.findMany({
      where: {
        venueId: activeVenueId ?? undefined,
        status: "OPEN",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.product.findMany({
      where: {
        venueId: activeVenueId ?? undefined,
      },
      include: {
        stock: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  type ProductWithStock = (typeof products)[number];

  const productOptions = products.map((product: ProductWithStock) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock?.quantity ?? 0,
  }));

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Ventas
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Nueva venta
            </h1>
            <p className="mt-2 text-zinc-400">
              Registrá una venta para el boliche activo.
            </p>
          </div>

          <VenueSwitcher venues={venues} activeVenueId={activeVenueId} />
        </div>

        <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#131313] to-[#090909] p-6">
          <NewSaleForm nights={nights} products={productOptions} />
        </div>
      </div>
    </AppShell>
  );
}
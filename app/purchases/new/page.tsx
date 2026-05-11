import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { NewPurchaseForm } from "@/components/purchases/new-purchase-form";
import { getActiveVenueId } from "@/lib/venues/active-venue";
import { VenueSwitcher } from "@/components/venues/venue-switcher";

export default async function NewPurchasePage() {
  const activeVenueId = await getActiveVenueId();

  const [venues, suppliers, products, nights] = await Promise.all([
    prisma.venue.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.supplier.findMany({
      where: {
        venueId: activeVenueId ?? undefined,
      },
      orderBy: { name: "asc" },
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
  ]);

  const productOptions = products.map((product) => ({
    id: product.id,
    name: product.name,
    cost: product.cost,
    stock: product.stock?.quantity ?? 0,
  }));

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Compras
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Nueva compra
            </h1>
            <p className="mt-2 text-zinc-400">
              Registrá una compra para el boliche activo y actualizá stock.
            </p>
          </div>

          <VenueSwitcher venues={venues} activeVenueId={activeVenueId} />
        </div>

        <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#131313] to-[#090909] p-6">
          <NewPurchaseForm
            suppliers={suppliers}
            products={productOptions}
            nights={nights}
          />
        </div>
      </div>
    </AppShell>
  );
}
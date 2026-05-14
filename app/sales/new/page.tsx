import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        venue: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.product.findMany({
      where: {
        venueId: activeVenueId ?? undefined,
        active: true,
      },
      include: {
        stock: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const productOptions = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.salePrice ?? product.price,
    stock: product.stock?.quantity ?? 0,
  }));

  const nightOptions = nights.map((night) => ({
    id: night.id,
    name: night.name,
    venueName: night.venue.name,
  }));

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/sales"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a ventas
            </Link>
            <p className="mt-5 text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Ventas
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Nueva venta detallada
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Carga producto por producto, descuenta stock y suma el ingreso a
              caja si la jornada tiene caja abierta.
            </p>
          </div>

          <VenueSwitcher venues={venues} activeVenueId={activeVenueId} />
        </div>

        <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#131313] to-[#090909] p-5 md:p-6">
          <NewSaleForm nights={nightOptions} products={productOptions} />
        </div>
      </div>
    </AppShell>
  );
}

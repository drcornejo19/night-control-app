import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { formatCurrency } from "@/lib/utils";

type PurchaseWithRelations = Prisma.PurchaseGetPayload<{
  include: {
    supplier: true;
    night: true;
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

export default async function PurchasesPage() {
  const purchasesRaw = await prisma.purchase.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      supplier: true,
      night: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const purchases = purchasesRaw as PurchaseWithRelations[];

  const total = purchases.reduce(
    (acc: number, purchase: PurchaseWithRelations) => acc + purchase.total,
    0
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Compras
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Compras registradas
            </h1>
            <p className="mt-2 text-zinc-400">
              Ingresos de mercadería y reposición de stock.
            </p>
          </div>

          <Link
            href="/purchases/new"
            className="rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Nueva compra
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Cantidad de compras</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {purchases.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Total comprado</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {formatCurrency(total)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Última actualización</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {purchases[0]
                ? new Date(purchases[0].createdAt).toLocaleString("es-AR")
                : "Sin compras"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {purchases.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-zinc-400">
              No hay compras registradas todavía.
            </div>
          ) : (
            purchases.map((purchase: PurchaseWithRelations) => (
              <div
                key={purchase.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {purchase.supplier.name}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Noche: {purchase.night?.name ?? "Sin noche"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {purchase.items.map((item) => (
                        <span
                          key={item.id}
                          className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300"
                        >
                          {item.product.name} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-semibold text-white">
                      {formatCurrency(purchase.total)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(purchase.createdAt).toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
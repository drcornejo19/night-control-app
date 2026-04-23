import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { formatCurrency } from "@/lib/utils";

type SaleWithRelations = Prisma.SaleGetPayload<{
  include: {
    night: true;
    payments: true;
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

export default async function SalesPage() {
  const salesRaw = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      night: true,
      payments: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const sales = salesRaw as SaleWithRelations[];

  const total = sales.reduce(
    (acc: number, sale: SaleWithRelations) => acc + sale.total,
    0
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Ventas
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Ventas registradas
            </h1>
            <p className="mt-2 text-zinc-400">
              Últimas operaciones cargadas en el sistema.
            </p>
          </div>

          <Link
            href="/sales/new"
            className="rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Nueva venta
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Cantidad de ventas</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {sales.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Total vendido</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {formatCurrency(total)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Última actualización</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {sales[0]
                ? new Date(sales[0].createdAt).toLocaleString("es-AR")
                : "Sin ventas"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {sales.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-zinc-400">
              No hay ventas registradas todavía.
            </div>
          ) : (
            sales.map((sale: SaleWithRelations) => (
              <div
                key={sale.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      Venta {sale.type}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Noche: {sale.night?.name ?? "Sin noche"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {sale.items.map(
                        (item: SaleWithRelations["items"][number]) => (
                          <span
                            key={item.id}
                            className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300"
                          >
                            {item.product.name} x{item.quantity}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-semibold text-white">
                      {formatCurrency(sale.total)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(sale.createdAt).toLocaleString("es-AR")}
                    </p>

                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                      {sale.payments.map(
                        (payment: SaleWithRelations["payments"][number]) => (
                          <span
                            key={payment.id}
                            className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-zinc-300"
                          >
                            {payment.method}: {formatCurrency(payment.amount)}
                          </span>
                        )
                      )}
                    </div>
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
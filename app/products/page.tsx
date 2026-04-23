import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { formatCurrency, formatNumber } from "@/lib/utils";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    venue: true;
    stock: true;
  };
}>;

export default async function ProductsPage() {
  const productsRaw = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      venue: true,
      stock: true,
    },
  });

  const products = productsRaw as ProductWithRelations[];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Productos
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Productos cargados
            </h1>
            <p className="mt-2 text-zinc-400">
              Catálogo disponible para ventas y control de stock.
            </p>
          </div>

          <Link
            href="/products/new"
            className="rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Nuevo producto
          </Link>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5 md:p-6">
          <div className="grid gap-4">
            {products.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-zinc-400">
                No hay productos cargados todavía.
              </div>
            ) : (
              products.map((product: ProductWithRelations) => {
                const stockQuantity = product.stock?.quantity ?? 0;
                const minStock = product.stock?.minStock ?? 0;
                const isLowStock = stockQuantity <= minStock;

                return (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {product.name}
                        </p>
                        <p className="mt-1 text-sm text-zinc-400">
                          Boliche: {product.venue.name}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300">
                            Precio: {formatCurrency(product.price)}
                          </span>

                          <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300">
                            Costo: {formatCurrency(product.cost ?? 0)}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs ${
                              isLowStock
                                ? "bg-red-500/15 text-red-400"
                                : "bg-emerald-500/15 text-emerald-400"
                            }`}
                          >
                            Stock: {formatNumber(stockQuantity)}
                          </span>

                          <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300">
                            Mínimo: {formatNumber(minStock)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-zinc-400">Estado</p>
                        <p
                          className={`mt-2 text-sm font-semibold ${
                            isLowStock ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          {isLowStock ? "Stock bajo" : "Disponible"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
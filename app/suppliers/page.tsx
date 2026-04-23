import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";

type SupplierWithVenue = Prisma.SupplierGetPayload<{
  include: {
    venue: true;
  };
}>;

export default async function SuppliersPage() {
  const suppliersRaw = await prisma.supplier.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      venue: true,
    },
  });

  const suppliers = suppliersRaw as SupplierWithVenue[];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Proveedores
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Proveedores cargados
            </h1>
            <p className="mt-2 text-zinc-400">
              Lista de proveedores disponibles para compras.
            </p>
          </div>

          <Link
            href="/suppliers/new"
            className="rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Nuevo proveedor
          </Link>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5 md:p-6">
          <div className="grid gap-4">
            {suppliers.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-zinc-400">
                No hay proveedores cargados todavía.
              </div>
            ) : (
              suppliers.map((supplier: SupplierWithVenue) => (
                <div
                  key={supplier.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {supplier.name}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        Boliche: {supplier.venue.name}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-zinc-500">
                        {new Date(supplier.createdAt).toLocaleString("es-AR")}
                      </p>
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
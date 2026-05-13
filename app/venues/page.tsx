import Link from "next/link";
import type { Venue } from "@prisma/client";

import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";

export default async function VenuesPage() {
  const venues = (await prisma.venue.findMany({
    orderBy: { createdAt: "desc" },
  })) as Venue[];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Boliches
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Boliches cargados
            </h1>
          </div>

          <Link
            href="/venues/new"
            className="rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black"
          >
            Nuevo boliche
          </Link>
        </div>

        <div className="grid gap-4">
          {venues.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-zinc-400">
              No hay boliches creados.
            </div>
          ) : (
            venues.map((v) => (
              <div
                key={v.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <p className="text-lg font-semibold text-white">{v.name}</p>
                <p className="text-sm text-zinc-400">
                  {v.city ?? "Sin ciudad"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}

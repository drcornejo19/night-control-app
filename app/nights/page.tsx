import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { NightStatusButton } from "@/components/nights/night-status-button";

type NightWithVenue = Prisma.NightGetPayload<{
  include: {
    venue: true;
  };
}>;

export default async function NightsPage() {
  const nightsRaw = await prisma.night.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      venue: true,
    },
  });

  const nights = nightsRaw as NightWithVenue[];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Noches
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Noches registradas
            </h1>
            <p className="mt-2 text-zinc-400">
              Jornadas operativas disponibles en el sistema.
            </p>
          </div>

          <Link
            href="/nights/new"
            className="rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Nueva noche
          </Link>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5 md:p-6">
          <div className="grid gap-4">
            {nights.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-zinc-400">
                No hay noches cargadas todavía.
              </div>
            ) : (
              nights.map((night: NightWithVenue) => (
                <div
                  key={night.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {night.name}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        Boliche: {night.venue.name}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300">
                          Fecha: {new Date(night.date).toLocaleDateString("es-AR")}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${
                            night.status === "OPEN"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : night.status === "CLOSED"
                              ? "bg-zinc-500/15 text-zinc-300"
                              : "bg-red-500/15 text-red-400"
                          }`}
                        >
                          {night.status}
                        </span>

                        {night.openedAt ? (
                          <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300">
                            Apertura: {new Date(night.openedAt).toLocaleString("es-AR")}
                          </span>
                        ) : null}

                        {night.closedAt ? (
                          <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300">
                            Cierre: {new Date(night.closedAt).toLocaleString("es-AR")}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <NightStatusButton
                      nightId={night.id}
                      currentStatus={night.status}
                    />
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
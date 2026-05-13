import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { CalendarClock, CircleDollarSign, Receipt, Ticket } from "lucide-react";

import { getActiveVenueId } from "@/lib/venues/active-venue";
import { VenueSwitcher } from "@/components/venues/venue-switcher";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { NightStatusButton } from "@/components/nights/night-status-button";
import { NightStatusBadge } from "@/components/nights/night-status-badge";
import { formatCurrency, formatNumber } from "@/lib/utils";

type NightWithMetrics = Prisma.NightGetPayload<{
  include: {
    venue: true;
    responsibleUser: true;
    cashBox: true;
    sales: {
      select: {
        total: true;
      };
    };
    expenses: {
      select: {
        amount: true;
      };
    };
    tickets: {
      select: {
        price: true;
        quantity: true;
        total: true;
      };
    };
    _count: {
      select: {
        sales: true;
        expenses: true;
        tickets: true;
      };
    };
  };
}>;

function getNightTotals(night: NightWithMetrics) {
  const salesRevenue = night.sales.reduce((acc, sale) => acc + sale.total, 0);
  const ticketRevenue = night.tickets.reduce(
    (acc, ticket) => acc + (ticket.total ?? ticket.price * ticket.quantity),
    0
  );
  const expenses = night.expenses.reduce(
    (acc, expense) => acc + expense.amount,
    0
  );

  return {
    revenue: salesRevenue + ticketRevenue,
    expenses,
    net: salesRevenue + ticketRevenue - expenses,
    attendees: night.tickets.reduce((acc, ticket) => acc + ticket.quantity, 0),
  };
}

export default async function NightsPage() {
  const activeVenueId = await getActiveVenueId();

  const [venues, nightsRaw] = await Promise.all([
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
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: {
        venue: true,
        responsibleUser: true,
        cashBox: true,
        sales: {
          select: {
            total: true,
          },
        },
        expenses: {
          select: {
            amount: true,
          },
        },
        tickets: {
          select: {
            price: true,
            quantity: true,
            total: true,
          },
        },
        _count: {
          select: {
            sales: true,
            expenses: true,
            tickets: true,
          },
        },
      },
    }),
  ]);

  const nights = nightsRaw as NightWithMetrics[];
  const openCount = nights.filter((night) => night.status === "OPEN").length;
  const plannedCount = nights.filter(
    (night) => night.status === "PLANNED"
  ).length;
  const closedCount = nights.filter(
    (night) => night.status === "CLOSED" || night.status === "AUDITED"
  ).length;
  const totalRevenue = nights.reduce(
    (acc, night) => acc + getNightTotals(night).revenue,
    0
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Jornadas
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Jornadas operativas
            </h1>
            <p className="mt-2 text-zinc-400">
              Planifica, abre, cierra y audita cada dia, noche o evento.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <VenueSwitcher venues={venues} activeVenueId={activeVenueId} />

            <Link
              href="/nights/new"
              className="rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Nueva jornada
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <CalendarClock className="h-5 w-5 text-[#D4AF37]" />
            <p className="mt-3 text-sm text-zinc-400">Abiertas</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatNumber(openCount)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <CalendarClock className="h-5 w-5 text-sky-300" />
            <p className="mt-3 text-sm text-zinc-400">Planificadas</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatNumber(plannedCount)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <Receipt className="h-5 w-5 text-zinc-300" />
            <p className="mt-3 text-sm text-zinc-400">Cerradas</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatNumber(closedCount)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <CircleDollarSign className="h-5 w-5 text-emerald-400" />
            <p className="mt-3 text-sm text-zinc-400">Ingresos registrados</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5 md:p-6">
          <div className="grid gap-4">
            {nights.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-zinc-400">
                No hay jornadas cargadas todavia.
              </div>
            ) : (
              nights.map((night) => {
                const totals = getNightTotals(night);

                return (
                  <div
                    key={night.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/nights/${night.id}`}
                            className="text-lg font-semibold text-white transition hover:text-[#D4AF37]"
                          >
                            {night.name}
                          </Link>
                          <NightStatusBadge status={night.status} />
                        </div>

                        <p className="mt-1 text-sm text-zinc-400">
                          {night.venue.name}
                          {night.responsibleUser
                            ? ` - Responsable: ${night.responsibleUser.name}`
                            : ""}
                        </p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                          <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300">
                            Fecha:{" "}
                            {new Date(night.date).toLocaleDateString("es-AR")}
                          </span>
                          <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300">
                            Ingresos: {formatCurrency(totals.revenue)}
                          </span>
                          <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300">
                            Gastos: {formatCurrency(totals.expenses)}
                          </span>
                          <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300">
                            Neto: {formatCurrency(totals.net)}
                          </span>
                          <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300">
                            <Ticket className="mr-1 inline h-3 w-3" />
                            {formatNumber(totals.attendees)} asistentes
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {night.openedAt ? (
                            <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-400">
                              Apertura:{" "}
                              {new Date(night.openedAt).toLocaleString("es-AR")}
                            </span>
                          ) : null}

                          {night.closedAt ? (
                            <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-400">
                              Cierre:{" "}
                              {new Date(night.closedAt).toLocaleString("es-AR")}
                            </span>
                          ) : null}

                          {night.cashBox ? (
                            <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-400">
                              Caja: {night.cashBox.status}
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
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { formatCurrency } from "@/lib/utils";
import { getActiveVenueId } from "@/lib/venues/active-venue";
import { VenueSwitcher } from "@/components/venues/venue-switcher";

type ExpenseWithNight = Prisma.ExpenseGetPayload<{
  include: {
    night: true;
  };
}>;

export default async function ExpensesPage() {
  const activeVenueId = await getActiveVenueId();

  const [venues, expensesRaw] = await Promise.all([
    prisma.venue.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.expense.findMany({
      where: {
        night: {
          venueId: activeVenueId ?? undefined,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        night: true,
      },
    }),
  ]);

  const expenses = expensesRaw as ExpenseWithNight[];

  const total = expenses.reduce(
    (acc: number, expense: ExpenseWithNight) => acc + expense.amount,
    0
  );

  const activeVenueName =
    venues.find((venue) => venue.id === activeVenueId)?.name ?? "Sin boliche";

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Gastos
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Gastos registrados
            </h1>
            <p className="mt-2 text-zinc-400">
              Egresos del boliche activo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <VenueSwitcher venues={venues} activeVenueId={activeVenueId} />

            <Link
              href="/expenses/new"
              className="rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Nuevo gasto
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Boliche activo</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {activeVenueName}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Cantidad de gastos</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {expenses.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Total gastado</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {formatCurrency(total)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {expenses.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-zinc-400">
              No hay gastos registrados para este boliche.
            </div>
          ) : (
            expenses.map((expense: ExpenseWithNight) => (
              <div
                key={expense.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {expense.category}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Noche: {expense.night?.name ?? "Sin noche"}
                    </p>
                    <p className="mt-2 text-sm text-zinc-300">
                      {expense.note || "Sin detalle"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-semibold text-white">
                      {formatCurrency(expense.amount)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(expense.createdAt).toLocaleString("es-AR")}
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
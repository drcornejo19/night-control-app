import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { NewExpenseForm } from "@/components/expenses/new-expense-form";
import { getActiveVenueId } from "@/lib/venues/active-venue";
import { VenueSwitcher } from "@/components/venues/venue-switcher";

export default async function NewExpensePage() {
  const activeVenueId = await getActiveVenueId();

  const [venues, nights, categories] = await Promise.all([
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
        status: {
          in: ["OPEN", "CLOSED"],
        },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 40,
      select: {
        id: true,
        name: true,
        venueId: true,
        venue: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.expenseCategoryConfig.findMany({
      where: {
        venueId: activeVenueId ?? undefined,
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        venueId: true,
      },
    }),
  ]);

  const nightOptions = nights.map((night) => ({
    id: night.id,
    name: night.name,
    venueId: night.venueId,
    venueName: night.venue.name,
  }));

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/expenses"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a gastos
            </Link>
            <p className="mt-5 text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Gastos
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Nuevo gasto
            </h1>
            <p className="mt-2 text-zinc-400">
              Carga egresos por sede o por jornada operativa.
            </p>
          </div>

          <VenueSwitcher venues={venues} activeVenueId={activeVenueId} />
        </div>

        <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#131313] to-[#090909] p-6">
          <NewExpenseForm
            venues={venues}
            nights={nightOptions}
            categories={categories}
            activeVenueId={activeVenueId}
          />
        </div>
      </div>
    </AppShell>
  );
}

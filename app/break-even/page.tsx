import type { ComponentType, ReactNode } from "react";
import type { Prisma } from "@prisma/client";
import {
  BadgeDollarSign,
  CalendarClock,
  Landmark,
  Scale,
  Target,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { BreakEvenScenarioForm } from "@/components/break-even/break-even-scenario-form";
import { BreakEvenSimulator } from "@/components/break-even/break-even-simulator";
import { VenueSwitcher } from "@/components/venues/venue-switcher";
import { prisma } from "@/lib/db";
import { calculateBreakEven } from "@/lib/finance/break-even";
import { getDailyFixedCost } from "@/lib/finance/costs";
import { getActiveVenueId } from "@/lib/venues/active-venue";
import { formatCurrency, formatNumber } from "@/lib/utils";

type ScenarioWithRelations = Prisma.BreakEvenScenarioGetPayload<{
  include: {
    night: true;
    venue: true;
  };
}>;

type ExpenseWithCategory = Prisma.ExpenseGetPayload<{
  include: {
    expenseCategoryConfig: true;
  };
}>;

type SaleItemWithProduct = Prisma.SaleItemGetPayload<{
  include: {
    product: true;
  };
}>;

const statusLabels = {
  LOSS: "En perdida",
  BREAK_EVEN: "En equilibrio",
  PROFIT: "En ganancia",
} as const;

export default async function BreakEvenPage() {
  const [activeVenueId, venues] = await Promise.all([
    getActiveVenueId(),
    prisma.venue.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  const nights = await prisma.night.findMany({
    where: {
      venueId: activeVenueId ?? undefined,
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 60,
    select: {
      id: true,
      name: true,
      venueId: true,
      status: true,
      date: true,
      venue: {
        select: {
          name: true,
        },
      },
    },
  });

  const focusNight =
    nights.find((night) => night.status === "OPEN") ?? nights[0] ?? null;
  const scopedVenueId =
    activeVenueId ?? focusNight?.venueId ?? venues[0]?.id ?? null;

  const saleWhere = focusNight
    ? { nightId: focusNight.id }
    : { night: { venueId: scopedVenueId ?? undefined } };
  const nightLinkedWhere = focusNight
    ? { nightId: focusNight.id }
    : { night: { venueId: scopedVenueId ?? undefined } };
  const expenseWhere = focusNight
    ? {
        OR: [
          { nightId: focusNight.id },
          { venueId: scopedVenueId ?? undefined, nightId: null },
        ],
      }
    : { venueId: scopedVenueId ?? undefined };

  const [
    salesAggregate,
    salesCount,
    shiftSummaryAggregate,
    ticketSales,
    reservations,
    saleItemsRaw,
    expensesRaw,
    fixedCosts,
    variableCosts,
    scenariosRaw,
  ] = await Promise.all([
    prisma.sale.aggregate({
      where: saleWhere,
      _sum: {
        total: true,
      },
    }),
    prisma.sale.count({
      where: saleWhere,
    }),
    prisma.shiftSummary.aggregate({
      where: nightLinkedWhere,
      _sum: {
        totalSales: true,
      },
    }),
    prisma.ticketSale.findMany({
      where: nightLinkedWhere,
      select: {
        price: true,
        quantity: true,
        total: true,
      },
    }),
    prisma.reservation.findMany({
      where: {
        ...nightLinkedWhere,
        status: {
          in: ["CONFIRMED", "COMPLETED"],
        },
      },
      select: {
        peopleCount: true,
        depositAmount: true,
        totalAmount: true,
      },
    }),
    prisma.saleItem.findMany({
      where: {
        sale: saleWhere,
      },
      include: {
        product: true,
      },
    }),
    prisma.expense.findMany({
      where: expenseWhere,
      include: {
        expenseCategoryConfig: true,
      },
    }),
    prisma.fixedCost.findMany({
      where: {
        venueId: scopedVenueId ?? undefined,
        active: true,
      },
    }),
    prisma.variableCost.findMany({
      where: {
        venueId: scopedVenueId ?? undefined,
        active: true,
        OR: focusNight
          ? [{ nightId: focusNight.id }, { nightId: null }]
          : undefined,
      },
    }),
    prisma.breakEvenScenario.findMany({
      where: {
        venueId: scopedVenueId ?? undefined,
      },
      include: {
        night: true,
        venue: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const saleItems = saleItemsRaw as SaleItemWithProduct[];
  const expenses = expensesRaw as ExpenseWithCategory[];
  const scenarios = scenariosRaw as ScenarioWithRelations[];
  const activeVenueName =
    venues.find((venue) => venue.id === scopedVenueId)?.name ?? "Todas";

  const detailedRevenue = salesAggregate._sum.total ?? 0;
  const summarizedRevenue = shiftSummaryAggregate._sum.totalSales ?? 0;
  const ticketRevenue = ticketSales.reduce(
    (acc, ticket) => acc + (ticket.total ?? ticket.price * ticket.quantity),
    0
  );
  const reservationRevenue = reservations.reduce(
    (acc, reservation) =>
      acc +
      (reservation.totalAmount > 0
        ? reservation.totalAmount
        : reservation.depositAmount),
    0
  );
  const revenue =
    detailedRevenue + summarizedRevenue + ticketRevenue + reservationRevenue;

  const cogs = saleItems.reduce((acc, item) => {
    const unitCost = item.unitCost ?? item.product.cost ?? 0;
    return acc + unitCost * item.quantity;
  }, 0);
  const fixedCostDaily = fixedCosts.reduce(
    (acc, cost) => acc + getDailyFixedCost(cost.amount, cost.periodicity),
    0
  );
  const variableCostTotal = variableCosts.reduce(
    (acc, cost) => acc + cost.amount,
    0
  );
  const variableExpenseTotal = expenses
    .filter((expense) => expense.expenseCategoryConfig?.type === "VARIABLE")
    .reduce((acc, expense) => acc + expense.amount, 0);
  const operationalExpenses = expenses
    .filter((expense) => expense.expenseCategoryConfig?.type !== "VARIABLE")
    .reduce((acc, expense) => acc + expense.amount, 0);
  const variableCostsTotal = cogs + variableCostTotal + variableExpenseTotal;

  const ticketAttendees = ticketSales.reduce(
    (acc, ticket) => acc + ticket.quantity,
    0
  );
  const reservationAttendees = reservations.reduce(
    (acc, reservation) => acc + reservation.peopleCount,
    0
  );
  const attendees =
    ticketAttendees + reservationAttendees > 0
      ? ticketAttendees + reservationAttendees
      : salesCount;
  const averageTicket = attendees > 0 ? revenue / attendees : 0;

  const breakEven = calculateBreakEven({
    revenue,
    fixedCosts: fixedCostDaily,
    variableCosts: variableCostsTotal,
    operationalExpenses,
    averageTicket,
    attendees,
  });
  const variableCostRatio =
    revenue > 0 ? Math.min(0.95, variableCostsTotal / revenue) : 0.35;

  const nightOptions = nights.map((night) => ({
    id: night.id,
    name: night.name,
    venueId: night.venueId,
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Punto de equilibrio
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Rentabilidad de la jornada
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Cuanto necesita vender la sede para cubrir costos y entrar en
              ganancia.
            </p>
          </div>

          <VenueSwitcher venues={venues} activeVenueId={activeVenueId} />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <MetricCard icon={Landmark} label="Sede" value={activeVenueName} />
          <MetricCard
            icon={CalendarClock}
            label="Jornada foco"
            value={focusNight?.name ?? "General"}
          />
          <MetricCard
            icon={BadgeDollarSign}
            label="Ingresos"
            value={formatCurrency(breakEven.revenue)}
            tone="green"
          />
          <MetricCard
            icon={Scale}
            label="Equilibrio"
            value={formatCurrency(breakEven.breakEvenRevenue)}
            tone="gold"
          />
          <MetricCard
            icon={Target}
            label="Falta vender"
            value={formatCurrency(breakEven.missingRevenue)}
            tone={breakEven.missingRevenue > 0 ? "red" : "green"}
          />
          <MetricCard
            icon={TrendingUp}
            label="Avance"
            value={`${formatNumber(breakEven.progressPercent)}%`}
            tone={breakEven.status === "PROFIT" ? "green" : "gold"}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel title="Estado actual">
            <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-5">
              <p className="text-sm text-zinc-300">Resultado estimado</p>
              <p
                className={`mt-2 text-4xl font-semibold ${
                  breakEven.netProfit >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {formatCurrency(breakEven.netProfit)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Pill tone={breakEven.status === "PROFIT" ? "green" : "red"}>
                  {statusLabels[breakEven.status]}
                </Pill>
                <Pill>{formatNumber(breakEven.breakEvenAttendees)} clientes equilibrio</Pill>
                <Pill>{formatCurrency(breakEven.averageTicket)} ticket prom.</Pill>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <StatRow label="Ingresos registrados" value={formatCurrency(revenue)} />
              <StatRow
                label="Costos variables"
                value={formatCurrency(variableCostsTotal)}
              />
              <StatRow
                label="Margen contribucion"
                value={formatCurrency(breakEven.contributionMargin)}
                tone={breakEven.contributionMargin >= 0 ? "green" : "red"}
              />
              <StatRow
                label="Ratio contribucion"
                value={`${formatNumber(
                  Math.round(breakEven.contributionMarginRatio * 100)
                )}%`}
              />
              <StatRow
                label="Costos fijos diarios"
                value={formatCurrency(fixedCostDaily)}
              />
              <StatRow
                label="Gastos operativos"
                value={formatCurrency(operationalExpenses)}
              />
            </div>
          </Panel>

          <Panel title="Simulador">
            <BreakEvenSimulator
              fixedCosts={fixedCostDaily}
              variableCostRatio={variableCostRatio}
              operationalExpenses={operationalExpenses}
              initialAttendees={attendees || breakEven.breakEvenAttendees}
              initialAverageTicket={averageTicket || 10000}
            />
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel title="Guardar escenario">
            <BreakEvenScenarioForm
              venues={venues}
              nights={nightOptions}
              activeVenueId={scopedVenueId}
              defaults={{
                fixedCosts: fixedCostDaily,
                variableCosts: variableCostsTotal,
                averageTicket: averageTicket || 10000,
                attendees: attendees || breakEven.breakEvenAttendees || 100,
              }}
            />
          </Panel>

          <Panel title="Composicion">
            <div className="grid gap-3 sm:grid-cols-2">
              <BreakdownItem
                label="Ventas detalladas"
                value={formatCurrency(detailedRevenue)}
              />
              <BreakdownItem
                label="Resumen por sector"
                value={formatCurrency(summarizedRevenue)}
              />
              <BreakdownItem
                label="Entradas"
                value={formatCurrency(ticketRevenue)}
              />
              <BreakdownItem
                label="Reservas"
                value={formatCurrency(reservationRevenue)}
              />
              <BreakdownItem label="COGS" value={formatCurrency(cogs)} />
              <BreakdownItem
                label="Variables cargados"
                value={formatCurrency(variableCostTotal)}
              />
            </div>
          </Panel>
        </section>

        <Panel title="Escenarios guardados">
          <div className="grid gap-3 xl:grid-cols-2">
            {scenarios.length === 0 ? (
              <EmptyState text="Todavia no hay escenarios guardados." />
            ) : (
              scenarios.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario} />
              ))
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

function ScenarioCard({ scenario }: { scenario: ScenarioWithRelations }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-white">{scenario.name}</p>
          <p className="mt-1 text-sm text-zinc-400">
            {scenario.night?.name ?? scenario.venue.name}
          </p>
        </div>
        <Pill>{formatNumber(scenario.expectedAttendees)} clientes</Pill>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <BreakdownItem
          label="Ingresos"
          value={formatCurrency(scenario.expectedRevenue)}
        />
        <BreakdownItem
          label="Equilibrio"
          value={formatCurrency(scenario.breakEvenRevenue)}
        />
        <BreakdownItem
          label="Clientes eq."
          value={formatNumber(scenario.breakEvenAttendees)}
        />
      </div>
    </article>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone = "zinc",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "gold" | "green" | "red" | "zinc";
}) {
  const iconColor =
    tone === "gold"
      ? "text-[#D4AF37]"
      : tone === "green"
        ? "text-emerald-400"
        : tone === "red"
          ? "text-red-400"
          : "text-zinc-300";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <Icon className={`h-5 w-5 ${iconColor}`} />
      <p className="mt-3 text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StatRow({
  label,
  value,
  tone = "zinc",
}: {
  label: string;
  value: string;
  tone?: "green" | "red" | "zinc";
}) {
  const color =
    tone === "green"
      ? "text-emerald-400"
      : tone === "red"
        ? "text-red-400"
        : "text-white";

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm text-zinc-300">{label}</span>
      <span className={`text-right font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function BreakdownItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function Pill({
  children,
  tone = "zinc",
}: {
  children: ReactNode;
  tone?: "green" | "red" | "zinc";
}) {
  const className =
    tone === "green"
      ? "bg-emerald-500/15 text-emerald-400"
      : tone === "red"
        ? "bg-red-500/15 text-red-300"
        : "bg-black/30 text-zinc-300";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs ${className}`}>
      {children}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-zinc-400">
      {text}
    </div>
  );
}

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import type { ExpenseCategory, Prisma } from "@prisma/client";
import {
  BadgeDollarSign,
  CalendarClock,
  Landmark,
  Plus,
  Receipt,
  TrendingDown,
  WalletCards,
} from "lucide-react";

import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { NewExpenseForm } from "@/components/expenses/new-expense-form";
import {
  ExpenseCategoryForm,
  FixedCostForm,
  VariableCostForm,
} from "@/components/expenses/cost-forms";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { getActiveVenueId } from "@/lib/venues/active-venue";
import { VenueSwitcher } from "@/components/venues/venue-switcher";
import {
  getDailyFixedCost,
  getMonthlyFixedCost,
} from "@/lib/finance/costs";

type ExpenseWithRelations = Prisma.ExpenseGetPayload<{
  include: {
    night: {
      include: {
        venue: true;
      };
    };
    venue: true;
    expenseCategoryConfig: true;
  };
}>;

type FixedCostRecord = Prisma.FixedCostGetPayload<Record<string, never>>;
type VariableCostWithNight = Prisma.VariableCostGetPayload<{
  include: {
    night: true;
  };
}>;
type SaleItemWithProduct = Prisma.SaleItemGetPayload<{
  include: {
    product: true;
  };
}>;

const expenseLabels: Record<ExpenseCategory, string> = {
  STAFF: "Personal",
  DJ: "DJ",
  SUPPLIER: "Proveedor",
  SERVICES: "Servicios",
  OTHER: "Otro",
};

const fixedLabels = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
} as const;

const variableLabels = {
  PER_SESSION: "Por jornada",
  PER_SALE: "Por venta",
  PER_ATTENDEE: "Por cliente",
  PER_PRODUCT: "Por producto",
  OTHER: "Otro",
} as const;

export default async function ExpensesPage() {
  const activeVenueId = await getActiveVenueId();
  const venueFilter = activeVenueId
    ? {
        OR: [{ venueId: activeVenueId }, { night: { venueId: activeVenueId } }],
      }
    : {};

  const [
    venues,
    expensesRaw,
    categories,
    fixedCosts,
    variableCostsRaw,
    nights,
    salesAggregate,
    shiftSummaryAggregate,
    saleItemsRaw,
  ] = await Promise.all([
    prisma.venue.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.expense.findMany({
      where: venueFilter,
      orderBy: { createdAt: "desc" },
      take: 60,
      include: {
        night: {
          include: {
            venue: true,
          },
        },
        venue: true,
        expenseCategoryConfig: true,
      },
    }),
    prisma.expenseCategoryConfig.findMany({
      where: {
        venueId: activeVenueId ?? undefined,
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        type: true,
        venueId: true,
      },
    }),
    prisma.fixedCost.findMany({
      where: {
        venueId: activeVenueId ?? undefined,
      },
      orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    }),
    prisma.variableCost.findMany({
      where: {
        venueId: activeVenueId ?? undefined,
      },
      include: {
        night: true,
      },
      orderBy: [{ active: "desc" }, { createdAt: "desc" }],
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
    prisma.sale.aggregate({
      where: {
        night: {
          venueId: activeVenueId ?? undefined,
        },
      },
      _sum: {
        total: true,
      },
    }),
    prisma.shiftSummary.aggregate({
      where: {
        night: {
          venueId: activeVenueId ?? undefined,
        },
      },
      _sum: {
        totalSales: true,
      },
    }),
    prisma.saleItem.findMany({
      where: {
        sale: {
          night: {
            venueId: activeVenueId ?? undefined,
          },
        },
      },
      include: {
        product: true,
      },
    }),
  ]);

  const expenses = expensesRaw as ExpenseWithRelations[];
  const variableCosts = variableCostsRaw as VariableCostWithNight[];
  const saleItems = saleItemsRaw as SaleItemWithProduct[];
  const activeVenueName =
    venues.find((venue) => venue.id === activeVenueId)?.name ?? "Todas";

  const expenseTotal = expenses.reduce((acc, expense) => acc + expense.amount, 0);
  const fixedCostDaily = fixedCosts
    .filter((cost) => cost.active)
    .reduce(
      (acc, cost) => acc + getDailyFixedCost(cost.amount, cost.periodicity),
      0
    );
  const fixedCostMonthly = fixedCosts
    .filter((cost) => cost.active)
    .reduce(
      (acc, cost) => acc + getMonthlyFixedCost(cost.amount, cost.periodicity),
      0
    );
  const variableCostTotal = variableCosts
    .filter((cost) => cost.active)
    .reduce((acc, cost) => acc + cost.amount, 0);
  const detailedRevenue = salesAggregate._sum.total ?? 0;
  const summarizedRevenue = shiftSummaryAggregate._sum.totalSales ?? 0;
  const revenue = detailedRevenue + summarizedRevenue;
  const cogs = saleItems.reduce((acc, item) => {
    const unitCost = item.unitCost ?? item.product.cost ?? 0;
    return acc + unitCost * item.quantity;
  }, 0);
  const grossProfit = revenue - cogs;
  const netAfterCosts =
    grossProfit - expenseTotal - variableCostTotal - fixedCostDaily;
  const netMargin = revenue > 0 ? (netAfterCosts / revenue) * 100 : 0;

  const categoryTotals = Array.from(
    expenses
      .reduce((map, expense) => {
        const label =
          expense.expenseCategoryConfig?.name ?? expenseLabels[expense.category];
        map.set(label, (map.get(label) ?? 0) + expense.amount);
        return map;
      }, new Map<string, number>())
      .entries()
  ).sort((a, b) => b[1] - a[1]);

  const nightOptions = nights.map((night) => ({
    id: night.id,
    name: night.name,
    venueId: night.venueId,
    venueName: night.venue.name,
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Gastos
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Costos y egresos
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Gastos operativos, costos fijos y variables para rentabilidad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <VenueSwitcher venues={venues} activeVenueId={activeVenueId} />
            <Link
              href="/expenses/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Nuevo gasto
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <MetricCard icon={Landmark} label="Sede" value={activeVenueName} />
          <MetricCard
            icon={Receipt}
            label="Gastos"
            value={formatCurrency(expenseTotal)}
            tone="red"
          />
          <MetricCard
            icon={CalendarClock}
            label="Fijos diarios"
            value={formatCurrency(fixedCostDaily)}
            tone="gold"
          />
          <MetricCard
            icon={WalletCards}
            label="Fijos mensuales"
            value={formatCurrency(fixedCostMonthly)}
          />
          <MetricCard
            icon={TrendingDown}
            label="Variables"
            value={formatCurrency(variableCostTotal)}
            tone="red"
          />
          <MetricCard
            icon={BadgeDollarSign}
            label="Neto estimado"
            value={formatCurrency(netAfterCosts)}
            tone={netAfterCosts >= 0 ? "green" : "red"}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel title="Nuevo gasto">
            <NewExpenseForm
              venues={venues}
              nights={nightOptions}
              categories={categories}
              activeVenueId={activeVenueId}
            />
          </Panel>

          <Panel title="Resumen financiero">
            <div className="space-y-3">
              <StatRow label="Ingresos" value={formatCurrency(revenue)} />
              <StatRow label="Costo mercaderia" value={formatCurrency(cogs)} />
              <StatRow
                label="Utilidad bruta"
                value={formatCurrency(grossProfit)}
                tone={grossProfit >= 0 ? "green" : "red"}
              />
              <StatRow label="Gastos" value={formatCurrency(expenseTotal)} />
              <StatRow
                label="Costos variables"
                value={formatCurrency(variableCostTotal)}
              />
              <StatRow
                label="Fijos prorrateados"
                value={formatCurrency(fixedCostDaily)}
              />
              <StatRow
                label="Resultado estimado"
                value={`${formatCurrency(netAfterCosts)} (${formatNumber(
                  Math.round(netMargin)
                )}%)`}
                tone={netAfterCosts >= 0 ? "green" : "red"}
              />
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <Panel title="Categorias">
            <ExpenseCategoryForm
              venues={venues}
              activeVenueId={activeVenueId}
            />
          </Panel>
          <Panel title="Costo fijo">
            <FixedCostForm venues={venues} activeVenueId={activeVenueId} />
          </Panel>
          <Panel title="Costo variable">
            <VariableCostForm
              venues={venues}
              activeVenueId={activeVenueId}
              nights={nightOptions}
            />
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel title="Gastos recientes">
            <div className="space-y-3">
              {expenses.length === 0 ? (
                <EmptyState text="No hay gastos registrados." />
              ) : (
                expenses.slice(0, 14).map((expense) => (
                  <ExpenseRow key={expense.id} expense={expense} />
                ))
              )}
            </div>
          </Panel>

          <Panel title="Distribucion por categoria">
            <div className="space-y-3">
              {categoryTotals.length === 0 ? (
                <EmptyState text="Sin categorias con gasto." />
              ) : (
                categoryTotals.slice(0, 10).map(([label, total]) => (
                  <StatRow
                    key={label}
                    label={label}
                    value={formatCurrency(total)}
                  />
                ))
              )}
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel title="Costos fijos">
            <div className="space-y-3">
              {fixedCosts.length === 0 ? (
                <EmptyState text="Sin costos fijos cargados." />
              ) : (
                fixedCosts.map((cost) => (
                  <FixedCostRow key={cost.id} cost={cost} />
                ))
              )}
            </div>
          </Panel>

          <Panel title="Costos variables">
            <div className="space-y-3">
              {variableCosts.length === 0 ? (
                <EmptyState text="Sin costos variables cargados." />
              ) : (
                variableCosts.map((cost) => (
                  <VariableCostRow key={cost.id} cost={cost} />
                ))
              )}
            </div>
          </Panel>
        </section>
      </div>
    </AppShell>
  );
}

function ExpenseRow({ expense }: { expense: ExpenseWithRelations }) {
  const label =
    expense.expenseCategoryConfig?.name ?? expenseLabels[expense.category];

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-white">{label}</p>
            <Pill>{expense.expenseCategoryConfig?.type ?? "OPERATIVO"}</Pill>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            {expense.night?.name ?? expense.venue?.name ?? "Sin jornada"} -{" "}
            {expense.paymentMethod ?? "Sin medio"}
          </p>
          {expense.note ? (
            <p className="mt-2 text-sm text-zinc-500">{expense.note}</p>
          ) : null}
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
    </article>
  );
}

function FixedCostRow({ cost }: { cost: FixedCostRecord }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-white">{cost.name}</p>
          <p className="mt-1 text-sm text-zinc-400">
            {fixedLabels[cost.periodicity]} -{" "}
            {cost.active ? "Activo" : "Inactivo"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-white">
            {formatCurrency(cost.amount)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {formatCurrency(getDailyFixedCost(cost.amount, cost.periodicity))} / dia
          </p>
        </div>
      </div>
    </article>
  );
}

function VariableCostRow({ cost }: { cost: VariableCostWithNight }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-white">{cost.name}</p>
          <p className="mt-1 text-sm text-zinc-400">
            {variableLabels[cost.relationType]} - {cost.night?.name ?? "General"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-white">
            {formatCurrency(cost.amount)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {cost.active ? "Activo" : "Inactivo"}
          </p>
        </div>
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

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300">
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

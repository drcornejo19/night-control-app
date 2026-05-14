import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import type { PaymentMethod, Prisma, SaleType } from "@prisma/client";
import {
  BadgeDollarSign,
  BarChart3,
  Boxes,
  CalendarDays,
  CreditCard,
  Landmark,
  PackageSearch,
  Scale,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { VenueSwitcher } from "@/components/venues/venue-switcher";
import { prisma } from "@/lib/db";
import { calculateBreakEven } from "@/lib/finance/break-even";
import { getDailyFixedCost } from "@/lib/finance/costs";
import {
  formatReportDate,
  getAverageTicket,
  getNetMargin,
  getReportRange,
  parseReportPeriod,
  pushTotal,
  sortTotals,
  type ReportPeriod,
} from "@/lib/finance/reports";
import { getActiveVenueId } from "@/lib/venues/active-venue";
import { formatCurrency, formatNumber } from "@/lib/utils";

type ReportsSearchParams = {
  period?: string;
};

type SaleForReport = Prisma.SaleGetPayload<{
  include: {
    night: true;
    payments: true;
    items: {
      include: {
        product: {
          include: {
            category: true;
          };
        };
      };
    };
  };
}>;

type TicketForReport = Prisma.TicketSaleGetPayload<{
  include: {
    night: true;
    ticketType: true;
  };
}>;

type ReservationForReport = Prisma.ReservationGetPayload<{
  include: {
    night: true;
  };
}>;

type ExpenseForReport = Prisma.ExpenseGetPayload<{
  include: {
    night: true;
    expenseCategoryConfig: true;
  };
}>;

type PurchaseForReport = Prisma.PurchaseGetPayload<{
  include: {
    supplier: true;
    items: true;
  };
}>;

type StockMovementForReport = Prisma.StockMovementGetPayload<{
  include: {
    product: true;
    night: true;
  };
}>;

const periodOptions = [
  { value: "day", label: "Diario" },
  { value: "week", label: "Semanal" },
  { value: "month", label: "Mensual" },
] as const;

const saleTypeLabels: Record<SaleType, string> = {
  BAR: "Barra",
  TICKET: "Entradas",
  VIP: "VIP",
  TABLE: "Mesas",
  DELIVERY: "Delivery",
  OTHER: "Otros",
};

const paymentLabels: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  CARD: "Tarjeta",
  QR: "QR",
  OTHER: "Otros",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: Promise<ReportsSearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const period = parseReportPeriod(params.period);
  const range = getReportRange(period);

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

  const nightWhere = {
    venueId: activeVenueId ?? undefined,
    date: {
      gte: range.start,
      lt: range.end,
    },
  };
  const venueWhere = {
    venueId: activeVenueId ?? undefined,
  };

  const [
    nights,
    salesRaw,
    shiftSummaries,
    ticketsRaw,
    reservationsRaw,
    expensesRaw,
    purchasesRaw,
    fixedCosts,
    variableCosts,
    stockMovementsRaw,
  ] = await Promise.all([
    prisma.night.findMany({
      where: nightWhere,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        date: true,
        status: true,
        venueId: true,
        venue: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.sale.findMany({
      where: {
        night: nightWhere,
      },
      include: {
        night: true,
        payments: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    }),
    prisma.shiftSummary.findMany({
      where: {
        night: nightWhere,
      },
      include: {
        night: true,
      },
    }),
    prisma.ticketSale.findMany({
      where: {
        night: nightWhere,
      },
      include: {
        night: true,
        ticketType: true,
      },
    }),
    prisma.reservation.findMany({
      where: {
        night: nightWhere,
        status: {
          in: ["CONFIRMED", "COMPLETED"],
        },
      },
      include: {
        night: true,
      },
    }),
    prisma.expense.findMany({
      where: {
        OR: [
          {
            night: nightWhere,
          },
          {
            ...venueWhere,
            nightId: null,
            createdAt: {
              gte: range.start,
              lt: range.end,
            },
          },
        ],
      },
      include: {
        night: true,
        expenseCategoryConfig: true,
      },
    }),
    prisma.purchase.findMany({
      where: {
        ...venueWhere,
        date: {
          gte: range.start,
          lt: range.end,
        },
      },
      include: {
        supplier: true,
        items: true,
      },
    }),
    prisma.fixedCost.findMany({
      where: {
        ...venueWhere,
        active: true,
      },
    }),
    prisma.variableCost.findMany({
      where: {
        ...venueWhere,
        active: true,
        OR: [
          {
            nightId: null,
          },
          {
            night: nightWhere,
          },
        ],
      },
    }),
    prisma.stockMovement.findMany({
      where: {
        ...venueWhere,
        createdAt: {
          gte: range.start,
          lt: range.end,
        },
      },
      include: {
        product: true,
        night: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 80,
    }),
  ]);

  const sales = salesRaw as SaleForReport[];
  const tickets = ticketsRaw as TicketForReport[];
  const reservations = reservationsRaw as ReservationForReport[];
  const expenses = expensesRaw as ExpenseForReport[];
  const purchases = purchasesRaw as PurchaseForReport[];
  const stockMovements = stockMovementsRaw as StockMovementForReport[];

  const activeVenueName =
    venues.find((venue) => venue.id === activeVenueId)?.name ?? "Todas";

  const detailedRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const summaryRevenue = shiftSummaries.reduce(
    (acc, summary) => acc + summary.totalSales,
    0
  );
  const ticketRevenue = tickets.reduce(
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
    detailedRevenue + summaryRevenue + ticketRevenue + reservationRevenue;

  const cogs = sales.reduce(
    (acc, sale) =>
      acc +
      sale.items.reduce((itemsAcc, item) => {
        const unitCost = item.unitCost ?? item.product.cost ?? 0;
        return itemsAcc + unitCost * item.quantity;
      }, 0),
    0
  );
  const fixedCostsPeriod = fixedCosts.reduce(
    (acc, cost) =>
      acc + getDailyFixedCost(cost.amount, cost.periodicity) * range.days,
    0
  );
  const explicitVariableCosts = variableCosts.reduce(
    (acc, cost) => acc + cost.amount,
    0
  );
  const variableExpenseTotal = expenses
    .filter((expense) => expense.expenseCategoryConfig?.type === "VARIABLE")
    .reduce((acc, expense) => acc + expense.amount, 0);
  const operationalExpenses = expenses
    .filter((expense) => expense.expenseCategoryConfig?.type !== "VARIABLE")
    .reduce((acc, expense) => acc + expense.amount, 0);
  const variableCostsTotal = cogs + explicitVariableCosts + variableExpenseTotal;
  const grossProfit = revenue - cogs;
  const netProfit =
    revenue - variableCostsTotal - fixedCostsPeriod - operationalExpenses;
  const netMargin = getNetMargin(revenue, netProfit);
  const transactions = sales.length + tickets.length + reservations.length;
  const ticketAttendees = tickets.reduce((acc, ticket) => acc + ticket.quantity, 0);
  const reservationAttendees = reservations.reduce(
    (acc, reservation) => acc + reservation.peopleCount,
    0
  );
  const attendees =
    ticketAttendees + reservationAttendees > 0
      ? ticketAttendees + reservationAttendees
      : transactions;
  const averageTicket = getAverageTicket(revenue, attendees || transactions);
  const breakEven = calculateBreakEven({
    revenue,
    fixedCosts: fixedCostsPeriod,
    variableCosts: variableCostsTotal,
    operationalExpenses,
    averageTicket,
    attendees,
  });

  const paymentTotals = getPaymentTotals(sales, shiftSummaries, tickets);
  const channelTotals = getChannelTotals(
    sales,
    shiftSummaries,
    ticketRevenue,
    reservationRevenue
  );
  const productRows = getProductRows(sales);
  const categoryRows = getCategoryRows(sales);
  const supplierRows = getSupplierRows(purchases);
  const nightRows = getNightRows(nights, sales, tickets, reservations, expenses);
  const purchaseTotal = purchases.reduce((acc, purchase) => acc + purchase.total, 0);
  const wasteValue = stockMovements
    .filter((movement) => movement.type === "WASTE")
    .reduce(
      (acc, movement) =>
        acc + Math.abs(movement.quantity) * (movement.unitCost ?? movement.product.cost ?? 0),
      0
    );

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Reportes
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Balance operativo
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Vista diaria, semanal y mensual de ingresos, costos, stock,
              compras, caja y rentabilidad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <PeriodTabs activePeriod={period} />
            <VenueSwitcher venues={venues} activeVenueId={activeVenueId} />
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <ReportContext
              icon={CalendarDays}
              label="Periodo"
              value={range.label}
              detail={`${formatReportDate(range.start)} - ${formatReportDate(range.end)}`}
            />
            <ReportContext
              icon={Landmark}
              label="Sede"
              value={activeVenueName}
              detail={`${formatNumber(nights.length)} jornadas`}
            />
            <ReportContext
              icon={Scale}
              label="Estado"
              value={netProfit >= 0 ? "Rentable" : "En revision"}
              detail={`${formatNumber(Math.round(breakEven.progressPercent))}% del equilibrio`}
            />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <MetricCard
            icon={BadgeDollarSign}
            label="Ingresos"
            value={formatCurrency(revenue)}
            tone="green"
          />
          <MetricCard
            icon={ShoppingCart}
            label="COGS"
            value={formatCurrency(cogs)}
            tone="red"
          />
          <MetricCard
            icon={TrendingUp}
            label="Utilidad bruta"
            value={formatCurrency(grossProfit)}
            tone={grossProfit >= 0 ? "green" : "red"}
          />
          <MetricCard
            icon={Scale}
            label="Punto equilibrio"
            value={formatCurrency(breakEven.breakEvenRevenue)}
            tone="gold"
          />
          <MetricCard
            icon={BarChart3}
            label="Resultado neto"
            value={formatCurrency(netProfit)}
            tone={netProfit >= 0 ? "green" : "red"}
          />
          <MetricCard
            icon={CreditCard}
            label="Ticket promedio"
            value={formatCurrency(averageTicket)}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel title="Resumen financiero">
            <div className="space-y-3">
              <StatRow label="Ingresos totales" value={formatCurrency(revenue)} />
              <StatRow label="Costo mercaderia" value={formatCurrency(cogs)} />
              <StatRow
                label="Costos variables"
                value={formatCurrency(explicitVariableCosts + variableExpenseTotal)}
              />
              <StatRow
                label="Costos fijos prorrateados"
                value={formatCurrency(fixedCostsPeriod)}
              />
              <StatRow
                label="Gastos operativos"
                value={formatCurrency(operationalExpenses)}
              />
              <StatRow
                label="Resultado neto"
                value={`${formatCurrency(netProfit)} (${formatNumber(
                  Math.round(netMargin)
                )}%)`}
                tone={netProfit >= 0 ? "green" : "red"}
              />
            </div>
          </Panel>

          <Panel title="Ingresos por canal">
            <RankedRows rows={channelTotals} emptyText="Sin ingresos en el periodo." />
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel title="Medios de pago">
            <RankedRows rows={paymentTotals} emptyText="Sin pagos registrados." />
          </Panel>

          <Panel title="Ranking de jornadas">
            <div className="space-y-3">
              {nightRows.length === 0 ? (
                <EmptyState text="No hay jornadas en el periodo." />
              ) : (
                nightRows.slice(0, 8).map((night) => (
                  <article
                    key={night.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">{night.name}</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {formatReportDate(night.date)} - {night.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            night.result >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {formatCurrency(night.result)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {formatCurrency(night.revenue)} ingresos
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <Panel title="Top productos">
            <div className="space-y-3">
              {productRows.length === 0 ? (
                <EmptyState text="Sin productos vendidos." />
              ) : (
                productRows.slice(0, 8).map((product, index) => (
                  <ProductRow key={product.name} product={product} index={index} />
                ))
              )}
            </div>
          </Panel>

          <Panel title="Margen por categoria">
            <div className="space-y-3">
              {categoryRows.length === 0 ? (
                <EmptyState text="Sin categorias con ventas." />
              ) : (
                categoryRows.slice(0, 8).map((category) => (
                  <MarginRow key={category.name} row={category} />
                ))
              )}
            </div>
          </Panel>

          <Panel title="Proveedores">
            <div className="space-y-3">
              <StatRow label="Compras totales" value={formatCurrency(purchaseTotal)} />
              {supplierRows.length === 0 ? (
                <EmptyState text="Sin compras en el periodo." />
              ) : (
                supplierRows.slice(0, 7).map(([name, total]) => (
                  <StatRow key={name} label={name} value={formatCurrency(total)} />
                ))
              )}
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel title="Stock y desvíos">
            <div className="grid gap-3 sm:grid-cols-2">
              <MiniMetric
                icon={Boxes}
                label="Movimientos"
                value={formatNumber(stockMovements.length)}
              />
              <MiniMetric
                icon={PackageSearch}
                label="Mermas valorizadas"
                value={formatCurrency(wasteValue)}
                tone={wasteValue > 0 ? "red" : "green"}
              />
            </div>
            <div className="mt-4 space-y-3">
              {stockMovements.slice(0, 6).map((movement) => (
                <StatRow
                  key={movement.id}
                  label={`${movement.product.name} - ${movement.type}`}
                  value={formatNumber(movement.quantity)}
                  tone={movement.quantity < 0 ? "red" : "green"}
                />
              ))}
              {stockMovements.length === 0 ? (
                <EmptyState text="Sin movimientos de stock en el periodo." />
              ) : null}
            </div>
          </Panel>

          <Panel title="Lectura gerencial">
            <div className="space-y-3">
              <Insight
                label="Equilibrio"
                value={
                  breakEven.missingRevenue > 0
                    ? `Faltan ${formatCurrency(breakEven.missingRevenue)} para empatar.`
                    : "El periodo ya supero el punto de equilibrio."
                }
              />
              <Insight
                label="Rentabilidad"
                value={`Margen neto ${formatNumber(Math.round(netMargin))}% sobre ingresos.`}
              />
              <Insight
                label="Operacion"
                value={`${formatNumber(attendees)} clientes/asistentes estimados en ${formatNumber(
                  transactions
                )} operaciones.`}
              />
              <Insight
                label="Compras"
                value={`${formatCurrency(purchaseTotal)} comprados a proveedores en el periodo.`}
              />
            </div>
          </Panel>
        </section>
      </div>
    </AppShell>
  );
}

function getPaymentTotals(
  sales: SaleForReport[],
  shiftSummaries: Array<{
    cashSales: number;
    transferSales: number;
    cardSales: number;
    qrSales: number;
  }>,
  tickets: TicketForReport[]
) {
  const map = new Map<string, number>();

  sales.forEach((sale) => {
    sale.payments.forEach((payment) => {
      pushTotal(map, paymentLabels[payment.method], payment.amount);
    });
  });
  shiftSummaries.forEach((summary) => {
    pushTotal(map, paymentLabels.CASH, summary.cashSales);
    pushTotal(map, paymentLabels.TRANSFER, summary.transferSales);
    pushTotal(map, paymentLabels.CARD, summary.cardSales);
    pushTotal(map, paymentLabels.QR, summary.qrSales);
  });
  tickets.forEach((ticket) => {
    pushTotal(
      map,
      ticket.paymentMethod ? paymentLabels[ticket.paymentMethod] : paymentLabels.OTHER,
      ticket.total ?? ticket.price * ticket.quantity
    );
  });

  return sortTotals(map);
}

function getChannelTotals(
  sales: SaleForReport[],
  shiftSummaries: Array<{ sector: string; totalSales: number }>,
  ticketRevenue: number,
  reservationRevenue: number
) {
  const map = new Map<string, number>();

  sales.forEach((sale) => pushTotal(map, saleTypeLabels[sale.type], sale.total));
  shiftSummaries.forEach((summary) =>
    pushTotal(map, `Resumen ${summary.sector}`, summary.totalSales)
  );
  pushTotal(map, "Entradas", ticketRevenue);
  pushTotal(map, "Reservas", reservationRevenue);

  return sortTotals(map).filter(([, total]) => total > 0);
}

function getProductRows(sales: SaleForReport[]) {
  const map = new Map<
    string,
    { name: string; quantity: number; revenue: number; cost: number; profit: number }
  >();

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const name = item.product.name;
      const revenue = item.total ?? item.price * item.quantity;
      const cost = (item.unitCost ?? item.product.cost ?? 0) * item.quantity;
      const current = map.get(name) ?? {
        name,
        quantity: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
      };

      current.quantity += item.quantity;
      current.revenue += revenue;
      current.cost += cost;
      current.profit += revenue - cost;
      map.set(name, current);
    });
  });

  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

function getCategoryRows(sales: SaleForReport[]) {
  const map = new Map<
    string,
    { name: string; revenue: number; cost: number; profit: number }
  >();

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const name = item.product.category?.name ?? "Sin categoria";
      const revenue = item.total ?? item.price * item.quantity;
      const cost = (item.unitCost ?? item.product.cost ?? 0) * item.quantity;
      const current = map.get(name) ?? { name, revenue: 0, cost: 0, profit: 0 };

      current.revenue += revenue;
      current.cost += cost;
      current.profit += revenue - cost;
      map.set(name, current);
    });
  });

  return Array.from(map.values()).sort((a, b) => b.profit - a.profit);
}

function getSupplierRows(purchases: PurchaseForReport[]) {
  const map = new Map<string, number>();

  purchases.forEach((purchase) =>
    pushTotal(map, purchase.supplier.name, purchase.total)
  );

  return sortTotals(map);
}

function getNightRows(
  nights: Array<{
    id: string;
    name: string;
    date: Date;
    status: string;
  }>,
  sales: SaleForReport[],
  tickets: TicketForReport[],
  reservations: ReservationForReport[],
  expenses: ExpenseForReport[]
) {
  const map = new Map<
    string,
    { id: string; name: string; date: Date; status: string; revenue: number; expenses: number; result: number }
  >();

  nights.forEach((night) => {
    map.set(night.id, {
      id: night.id,
      name: night.name,
      date: night.date,
      status: night.status,
      revenue: 0,
      expenses: 0,
      result: 0,
    });
  });
  sales.forEach((sale) => {
    const row = map.get(sale.nightId);
    if (row) row.revenue += sale.total;
  });
  tickets.forEach((ticket) => {
    const row = map.get(ticket.nightId);
    if (row) row.revenue += ticket.total ?? ticket.price * ticket.quantity;
  });
  reservations.forEach((reservation) => {
    const row = map.get(reservation.nightId);
    if (row) {
      row.revenue +=
        reservation.totalAmount > 0
          ? reservation.totalAmount
          : reservation.depositAmount;
    }
  });
  expenses.forEach((expense) => {
    if (!expense.nightId) return;
    const row = map.get(expense.nightId);
    if (row) row.expenses += expense.amount;
  });

  return Array.from(map.values())
    .map((row) => ({ ...row, result: row.revenue - row.expenses }))
    .sort((a, b) => b.result - a.result);
}

function PeriodTabs({ activePeriod }: { activePeriod: ReportPeriod }) {
  return (
    <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
      {periodOptions.map((option) => (
        <Link
          key={option.value}
          href={`/reports?period=${option.value}`}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            activePeriod === option.value
              ? "bg-[#D4AF37] text-black"
              : "text-zinc-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
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

function ReportContext({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <Icon className="h-5 w-5 text-[#D4AF37]" />
      <p className="mt-3 text-sm text-zinc-400">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{detail}</p>
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

function RankedRows({
  rows,
  emptyText,
}: {
  rows: [string, number][];
  emptyText: string;
}) {
  if (rows.length === 0) {
    return <EmptyState text={emptyText} />;
  }

  return (
    <div className="space-y-3">
      {rows.slice(0, 8).map(([label, total]) => (
        <StatRow key={label} label={label} value={formatCurrency(total)} />
      ))}
    </div>
  );
}

function ProductRow({
  product,
  index,
}: {
  product: { name: string; quantity: number; revenue: number; profit: number };
  index: number;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-sm font-bold text-[#D4AF37]">
            {index + 1}
          </span>
          <div>
            <p className="font-semibold text-white">{product.name}</p>
            <p className="mt-1 text-sm text-zinc-400">
              {formatNumber(product.quantity)} unidades
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-white">{formatCurrency(product.revenue)}</p>
          <p className="mt-1 text-xs text-emerald-400">
            {formatCurrency(product.profit)} margen
          </p>
        </div>
      </div>
    </article>
  );
}

function MarginRow({
  row,
}: {
  row: { name: string; revenue: number; cost: number; profit: number };
}) {
  const margin = row.revenue > 0 ? Math.round((row.profit / row.revenue) * 100) : 0;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-white">{row.name}</p>
          <p className="mt-1 text-sm text-zinc-400">
            Costo {formatCurrency(row.cost)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-white">{formatCurrency(row.profit)}</p>
          <p className="mt-1 text-xs text-zinc-500">{formatNumber(margin)}%</p>
        </div>
      </div>
    </article>
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

function MiniMetric({
  icon: Icon,
  label,
  value,
  tone = "zinc",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "green" | "red" | "zinc";
}) {
  const color =
    tone === "green"
      ? "text-emerald-400"
      : tone === "red"
        ? "text-red-400"
        : "text-zinc-300";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <Icon className={`h-5 w-5 ${color}`} />
      <p className="mt-3 text-sm text-zinc-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]/80">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-300">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-zinc-400">
      {text}
    </div>
  );
}

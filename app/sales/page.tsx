import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import type { PaymentMethod, Prisma } from "@prisma/client";
import {
  BarChart3,
  CreditCard,
  Landmark,
  Plus,
  ReceiptText,
  ShoppingBag,
  Wallet,
} from "lucide-react";

import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { getActiveVenueId } from "@/lib/venues/active-venue";
import { VenueSwitcher } from "@/components/venues/venue-switcher";
import { ShiftSummaryForm } from "@/components/sales/shift-summary-form";

type SaleWithRelations = Prisma.SaleGetPayload<{
  include: {
    night: {
      include: {
        venue: true;
      };
    };
    payments: true;
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

type ShiftSummaryWithNight = Prisma.ShiftSummaryGetPayload<{
  include: {
    night: {
      include: {
        venue: true;
      };
    };
  };
}>;

const paymentLabels: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  CARD: "Tarjeta",
  QR: "QR",
  OTHER: "Otro",
};

export default async function SalesPage() {
  const activeVenueId = await getActiveVenueId();

  const [venues, salesRaw, summariesRaw, openNights] = await Promise.all([
    prisma.venue.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.sale.findMany({
      where: {
        night: {
          venueId: activeVenueId ?? undefined,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        night: {
          include: {
            venue: true,
          },
        },
        payments: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    }),
    prisma.shiftSummary.findMany({
      where: {
        night: {
          venueId: activeVenueId ?? undefined,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        night: {
          include: {
            venue: true,
          },
        },
      },
    }),
    prisma.night.findMany({
      where: {
        venueId: activeVenueId ?? undefined,
        status: "OPEN",
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        venue: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const sales = salesRaw as SaleWithRelations[];
  const summaries = summariesRaw as ShiftSummaryWithNight[];

  const detailedRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const summaryRevenue = summaries.reduce(
    (acc, summary) => acc + summary.totalSales,
    0
  );
  const totalRevenue = detailedRevenue + summaryRevenue;
  const cogs = sales.reduce((acc, sale) => {
    return (
      acc +
      sale.items.reduce((itemAcc, item) => {
        return itemAcc + (item.unitCost ?? 0) * item.quantity;
      }, 0)
    );
  }, 0);
  const grossProfit = detailedRevenue - cogs;
  const averageTicket = sales.length > 0 ? detailedRevenue / sales.length : 0;

  const paymentTotals: Record<PaymentMethod, number> = {
    CASH: 0,
    TRANSFER: 0,
    CARD: 0,
    QR: 0,
    OTHER: 0,
  };

  for (const sale of sales) {
    for (const payment of sale.payments) {
      paymentTotals[payment.method] += payment.amount;
    }
  }

  for (const summary of summaries) {
    paymentTotals.CASH += summary.cashSales;
    paymentTotals.TRANSFER += summary.transferSales;
    paymentTotals.CARD += summary.cardSales;
    paymentTotals.QR += summary.qrSales;
  }

  const channelTotals = sales.reduce<Record<string, number>>((acc, sale) => {
    acc[sale.type] = (acc[sale.type] ?? 0) + sale.total;
    return acc;
  }, {});

  const productTotals = new Map<
    string,
    { id: string; name: string; quantity: number; revenue: number }
  >();

  for (const sale of sales) {
    for (const item of sale.items) {
      const current = productTotals.get(item.productId) ?? {
        id: item.productId,
        name: item.product.name,
        quantity: 0,
        revenue: 0,
      };
      current.quantity += item.quantity;
      current.revenue += item.total ?? item.price * item.quantity;
      productTotals.set(item.productId, current);
    }
  }

  const topProducts = Array.from(productTotals.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const activeVenueName =
    venues.find((venue) => venue.id === activeVenueId)?.name ?? "Todas";

  const nightOptions = openNights.map((night) => ({
    id: night.id,
    name: night.name,
    venueName: night.venue.name,
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Ventas
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Ventas y cierres por sector
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Registra ventas detalladas o carga un resumen por barra, puerta,
              VIP o mesa sin frenar la operacion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <VenueSwitcher venues={venues} activeVenueId={activeVenueId} />
            <Link
              href="/sales/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Nueva venta
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <MetricCard
            icon={Landmark}
            label="Sede"
            value={activeVenueName}
          />
          <MetricCard
            icon={ShoppingBag}
            label="Venta detallada"
            value={formatCurrency(detailedRevenue)}
            tone="gold"
          />
          <MetricCard
            icon={ReceiptText}
            label="Resumen sectores"
            value={formatCurrency(summaryRevenue)}
          />
          <MetricCard
            icon={Wallet}
            label="Ingresos ventas"
            value={formatCurrency(totalRevenue)}
            tone="green"
          />
          <MetricCard
            icon={BarChart3}
            label="Margen bruto"
            value={formatCurrency(grossProfit)}
            tone={grossProfit >= 0 ? "green" : "red"}
          />
          <MetricCard
            icon={CreditCard}
            label="Ticket promedio"
            value={formatCurrency(averageTicket)}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel title="Carga rapida por sector">
            <ShiftSummaryForm nights={nightOptions} />
          </Panel>

          <Panel title="Medios de pago">
            <div className="space-y-3">
              {Object.entries(paymentTotals).map(([method, total]) => (
                <div
                  key={method}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="text-sm text-zinc-300">
                    {paymentLabels[method as PaymentMethod]}
                  </span>
                  <span className="font-semibold text-white">
                    {formatCurrency(total)}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel title="Ultimas ventas detalladas">
            <div className="space-y-3">
              {sales.length === 0 ? (
                <EmptyState text="No hay ventas detalladas registradas." />
              ) : (
                sales.slice(0, 10).map((sale) => (
                  <article
                    key={sale.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-white">
                            Venta {sale.type}
                          </p>
                          <Pill>{sale.night.name}</Pill>
                        </div>
                        <p className="mt-1 text-sm text-zinc-400">
                          {sale.night.venue.name} -{" "}
                          {new Date(sale.createdAt).toLocaleString("es-AR")}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {sale.items.map((item) => (
                            <Pill key={item.id}>
                              {item.product.name} x{item.quantity}
                            </Pill>
                          ))}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-semibold text-white">
                          {formatCurrency(sale.total)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {sale.payments
                            .map((payment) => paymentLabels[payment.method])
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </Panel>

          <Panel title="Cierres resumidos">
            <div className="space-y-3">
              {summaries.length === 0 ? (
                <EmptyState text="Todavia no hay cierres resumidos." />
              ) : (
                summaries.slice(0, 8).map((summary) => (
                  <article
                    key={summary.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">
                          {summary.sector}
                        </p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {summary.night.name} - {summary.night.venue.name}
                        </p>
                        {summary.observations ? (
                          <p className="mt-2 text-sm text-zinc-500">
                            {summary.observations}
                          </p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">
                          {formatCurrency(summary.totalSales)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {new Date(summary.createdAt).toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Panel title="Top productos">
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <EmptyState text="El ranking aparece cuando haya ventas detalladas." />
              ) : (
                topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-sm font-semibold text-[#D4AF37]">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-sm text-zinc-400">
                          {formatNumber(product.quantity)} unidades
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-white">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel title="Canales">
            <div className="space-y-3">
              {Object.keys(channelTotals).length === 0 ? (
                <EmptyState text="Sin ventas por canal todavia." />
              ) : (
                Object.entries(channelTotals).map(([channel, total]) => (
                  <div
                    key={channel}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <span className="text-sm text-zinc-300">{channel}</span>
                    <span className="font-semibold text-white">
                      {formatCurrency(total)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </section>
      </div>
    </AppShell>
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

import {
  BadgeDollarSign,
  Package,
  Receipt,
  ShoppingBag,
  Ticket,
  Wallet,
} from "lucide-react";
import type { PaymentMethod, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardKpiCard } from "@/components/dashboard/kpi-card";
import { DashboardSection } from "@/components/dashboard/section";
import { DashboardStatRow } from "@/components/dashboard/stat-row";
import { formatCurrency, formatNumber } from "@/lib/utils";

type LatestSale = Prisma.SaleGetPayload<{
  include: {
    payments: true;
    items: {
      include: {
        product: true;
      };
    };
    night: true;
  };
}>;

type LatestExpense = Prisma.ExpenseGetPayload<{
  include: {
    night: true;
  };
}>;

type ProductRecord = Prisma.ProductGetPayload<Record<string, never>>;

type TopProductGroup = {
  productId: string;
  _sum: {
    quantity: number | null;
    price: number | null;
  };
};

export default async function DashboardPage() {
  const [
    salesAggregate,
    expensesAggregate,
    salesCount,
    productsCount,
    ticketsAggregate,
    latestSalesRaw,
    latestExpensesRaw,
    topProductsRawUntyped,
    cashBoxes,
    venuesCount,
    nightsOpenCount,
  ] = await Promise.all([
    prisma.sale.aggregate({
      _sum: { total: true },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
    }),
    prisma.sale.count(),
    prisma.product.count(),
    prisma.ticketSale.aggregate({
      _sum: {
        quantity: true,
      },
    }),
    prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        payments: true,
        items: {
          include: {
            product: true,
          },
        },
        night: true,
      },
    }),
    prisma.expense.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        night: true,
      },
    }),
    prisma.saleItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    }),
    prisma.cashBox.findMany({
      include: {
        movements: true,
        night: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.venue.count(),
    prisma.night.count({
      where: {
        status: "OPEN",
      },
    }),
  ]);

  const latestSales = latestSalesRaw as LatestSale[];
  const latestExpenses = latestExpensesRaw as LatestExpense[];
  const topProductsRaw = topProductsRawUntyped as TopProductGroup[];

  const revenue = salesAggregate._sum.total ?? 0;
  const expenses = expensesAggregate._sum.amount ?? 0;
  const profit = revenue - expenses;
  const soldTickets = ticketsAggregate._sum.quantity ?? 0;

  const paymentSummary: Record<PaymentMethod, number> = {
  CASH: 0,
  TRANSFER: 0,
  CARD: 0,
  OTHER: 0,
};

latestSales.forEach((sale: LatestSale) => {
  sale.payments.forEach((payment: LatestSale["payments"][number]) => {
    const method = payment.method as PaymentMethod;
    paymentSummary[method] += payment.amount;
  });
});

  const totalCash = paymentSummary.CASH;
  const totalTransfer = paymentSummary.TRANSFER;
  const totalCard = paymentSummary.CARD;
  const totalOther = paymentSummary.OTHER;

  const productIds = topProductsRaw.map((item: TopProductGroup) => item.productId);

  const products: ProductRecord[] = productIds.length
    ? await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      })
    : [];

  const productMap = new Map(
    products.map((product: ProductRecord) => [product.id, product])
  );

  const topProducts = topProductsRaw.map((item: TopProductGroup) => {
    const product = productMap.get(item.productId);

    return {
      id: item.productId,
      name: product?.name ?? "Producto",
      quantity: item._sum.quantity ?? 0,
      estimatedRevenue: (item._sum.price ?? 0) * (item._sum.quantity ?? 0),
    };
  });

  const latestCashBox = cashBoxes[0];
  const cashOpening = latestCashBox?.opening ?? 0;
  const cashExpected = latestCashBox?.expected ?? 0;
  const cashClosing = latestCashBox?.closing ?? 0;
  const cashDifference = latestCashBox?.difference ?? 0;

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-6">
          <DashboardKpiCard
            title="Ingresos"
            value={revenue}
            icon={BadgeDollarSign}
            trend="up"
            changeLabel="Ventas totales registradas"
          />

          <DashboardKpiCard
            title="Gastos"
            value={expenses}
            icon={Receipt}
            trend={expenses > 0 ? "down" : "neutral"}
            changeLabel="Operación de la noche"
          />

          <DashboardKpiCard
            title="Ganancia"
            value={profit}
            icon={Wallet}
            trend={profit >= 0 ? "up" : "down"}
            changeLabel="Ingresos menos gastos"
          />

          <DashboardKpiCard
            title="Ventas"
            value={salesCount}
            icon={ShoppingBag}
            trend="neutral"
            changeLabel="Cantidad de tickets de venta"
          />

          <DashboardKpiCard
            title="Productos"
            value={productsCount}
            icon={Package}
            trend="neutral"
            changeLabel="Productos cargados"
          />

          <DashboardKpiCard
            title="Entradas"
            value={soldTickets}
            icon={Ticket}
            trend="neutral"
            changeLabel="Tickets vendidos"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <DashboardSection
            title="Resumen operativo"
            subtitle="Vista general del estado actual del boliche"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <DashboardStatRow
                label="Boliches cargados"
                value={formatNumber(venuesCount)}
              />
              <DashboardStatRow
                label="Noches abiertas"
                value={formatNumber(nightsOpenCount)}
              />
              <DashboardStatRow
                label="Cobrado en efectivo"
                value={formatCurrency(totalCash)}
              />
              <DashboardStatRow
                label="Cobrado por transferencia"
                value={formatCurrency(totalTransfer)}
              />
              <DashboardStatRow
                label="Cobrado con tarjeta"
                value={formatCurrency(totalCard)}
              />
              <DashboardStatRow
                label="Otros cobros"
                value={formatCurrency(totalOther)}
              />
            </div>
          </DashboardSection>

          <DashboardSection
            title="Caja actual"
            subtitle="Último cierre o caja activa detectada"
          >
            <div className="space-y-4">
              <DashboardStatRow
                label="Apertura"
                value={formatCurrency(cashOpening)}
              />
              <DashboardStatRow
                label="Esperado"
                value={formatCurrency(cashExpected)}
              />
              <DashboardStatRow
                label="Cierre"
                value={formatCurrency(cashClosing)}
              />
              <DashboardStatRow
                label="Diferencia"
                value={formatCurrency(cashDifference)}
              />
            </div>
          </DashboardSection>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <DashboardSection
            title="Top productos"
            subtitle="Ranking por cantidad vendida"
          >
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-zinc-400">
                  No hay productos vendidos todavía.
                </div>
              ) : (
                topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-sm font-bold text-[#D4AF37]">
                        {index + 1}
                      </div>

                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-sm text-zinc-400">
                          {formatNumber(product.quantity)} unidades
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-white">
                        {formatCurrency(product.estimatedRevenue)}
                      </p>
                      <p className="text-xs text-zinc-500">estimado</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DashboardSection>

          <DashboardSection
            title="Últimas ventas"
            subtitle="Operación reciente registrada"
          >
            <div className="space-y-3">
              {latestSales.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-zinc-400">
                  No hay ventas registradas.
                </div>
              ) : (
                latestSales.map((sale: LatestSale) => (
                  <div
                    key={sale.id}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">
                          Venta {sale.type}
                        </p>
                        <p className="mt-1 text-sm text-zinc-400">
                          Noche: {sale.night?.name ?? "Sin noche"}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {sale.items.map(
                            (item: LatestSale["items"][number]) => (
                              <span
                                key={item.id}
                                className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300"
                              >
                                {item.product.name} x{item.quantity}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-white">
                          {formatCurrency(sale.total)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {new Date(sale.createdAt).toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DashboardSection>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <DashboardSection
            title="Últimos gastos"
            subtitle="Egresos operativos registrados"
          >
            <div className="space-y-3">
              {latestExpenses.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-zinc-400">
                  No hay gastos registrados.
                </div>
              ) : (
                latestExpenses.map((expense: LatestExpense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {expense.category}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {expense.note || "Sin detalle"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-white">
                        {formatCurrency(expense.amount)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {new Date(expense.createdAt).toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DashboardSection>

          <DashboardSection
            title="Lectura gerencial"
            subtitle="Indicadores rápidos para el dueño o encargado"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <DashboardStatRow
                label="Margen bruto"
                value={
                  revenue > 0
                    ? `${(((profit / revenue) * 100) || 0).toFixed(1)}%`
                    : "0%"
                }
              />
              <DashboardStatRow
                label="Promedio por venta"
                value={
                  salesCount > 0
                    ? formatCurrency(revenue / salesCount)
                    : formatCurrency(0)
                }
              />
              <DashboardStatRow
                label="Ventas registradas"
                value={formatNumber(salesCount)}
              />
              <DashboardStatRow
                label="Productos activos"
                value={formatNumber(productsCount)}
              />
              <DashboardStatRow
                label="Entradas emitidas"
                value={formatNumber(soldTickets)}
              />
              <DashboardStatRow
                label="Estado general"
                value={profit >= 0 ? "Rentable" : "En revisión"}
              />
            </div>
          </DashboardSection>
        </section>
      </div>
    </AppShell>
  );
}
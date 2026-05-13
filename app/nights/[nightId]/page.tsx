import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeDollarSign, Package, Receipt, Ticket, Wallet } from "lucide-react";

import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { NightStatusBadge } from "@/components/nights/night-status-badge";
import { NightStatusButton } from "@/components/nights/night-status-button";
import { formatCurrency, formatNumber } from "@/lib/utils";

type NightDetailPageProps = {
  params: Promise<{
    nightId: string;
  }>;
};

export default async function NightDetailPage({ params }: NightDetailPageProps) {
  const { nightId } = await params;

  const night = await prisma.night.findUnique({
    where: { id: nightId },
    include: {
      venue: true,
      responsibleUser: true,
      cashBox: {
        include: {
          movements: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
      sales: {
        orderBy: { createdAt: "desc" },
        include: {
          payments: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      },
      expenses: {
        orderBy: { createdAt: "desc" },
      },
      tickets: {
        orderBy: { createdAt: "desc" },
      },
      purchases: {
        orderBy: { createdAt: "desc" },
        include: {
          supplier: true,
        },
      },
      stockMovements: {
        orderBy: { createdAt: "desc" },
        include: {
          product: true,
        },
        take: 8,
      },
    },
  });

  if (!night) {
    notFound();
  }

  const salesRevenue = night.sales.reduce((acc, sale) => acc + sale.total, 0);
  const ticketRevenue = night.tickets.reduce(
    (acc, ticket) => acc + (ticket.total ?? ticket.price * ticket.quantity),
    0
  );
  const expensesTotal = night.expenses.reduce(
    (acc, expense) => acc + expense.amount,
    0
  );
  const purchasesTotal = night.purchases.reduce(
    (acc, purchase) => acc + purchase.total,
    0
  );
  const totalRevenue = salesRevenue + ticketRevenue;
  const net = totalRevenue - expensesTotal;
  const attendees = night.tickets.reduce(
    (acc, ticket) => acc + ticket.quantity,
    0
  );
  const averageTicket = attendees > 0 ? totalRevenue / attendees : 0;

  const cashIncome =
    night.cashBox?.movements
      .filter((movement) => movement.type === "INCOME")
      .reduce((acc, movement) => acc + movement.amount, 0) ?? 0;
  const cashExpense =
    night.cashBox?.movements
      .filter((movement) => movement.type === "EXPENSE")
      .reduce((acc, movement) => acc + movement.amount, 0) ?? 0;
  const cashExpected = night.cashBox
    ? night.cashBox.expected ?? night.cashBox.opening + cashIncome - cashExpense
    : 0;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/nights"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a jornadas
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-white md:text-4xl">
                {night.name}
              </h1>
              <NightStatusBadge status={night.status} />
            </div>
            <p className="mt-2 text-zinc-400">
              {night.venue.name} -{" "}
              {new Date(night.date).toLocaleDateString("es-AR")}
              {night.responsibleUser
                ? ` - Responsable: ${night.responsibleUser.name}`
                : ""}
            </p>
          </div>

          <NightStatusButton nightId={night.id} currentStatus={night.status} />
        </div>

        {night.observations ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
            {night.observations}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <BadgeDollarSign className="h-5 w-5 text-emerald-400" />
            <p className="mt-3 text-sm text-zinc-400">Ingresos</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <Receipt className="h-5 w-5 text-red-400" />
            <p className="mt-3 text-sm text-zinc-400">Gastos</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatCurrency(expensesTotal)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <Wallet className="h-5 w-5 text-[#D4AF37]" />
            <p className="mt-3 text-sm text-zinc-400">Neto operativo</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatCurrency(net)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <Ticket className="h-5 w-5 text-sky-300" />
            <p className="mt-3 text-sm text-zinc-400">Asistentes</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatNumber(attendees)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <Package className="h-5 w-5 text-zinc-300" />
            <p className="mt-3 text-sm text-zinc-400">Ticket promedio</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatCurrency(averageTicket)}
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5">
            <h2 className="text-lg font-semibold text-white">Caja</h2>
            {!night.cashBox ? (
              <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
                La jornada todavia no tiene caja abierta.
              </p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Metric label="Estado" value={night.cashBox.status} />
                <Metric label="Apertura" value={formatCurrency(night.cashBox.opening)} />
                <Metric label="Esperado" value={formatCurrency(cashExpected)} />
                <Metric
                  label="Diferencia"
                  value={
                    night.cashBox.difference !== null &&
                    night.cashBox.difference !== undefined
                      ? formatCurrency(night.cashBox.difference)
                      : "-"
                  }
                />
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5">
            <h2 className="text-lg font-semibold text-white">
              Composicion de ingresos
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric label="Barra/productos" value={formatCurrency(salesRevenue)} />
              <Metric label="Entradas" value={formatCurrency(ticketRevenue)} />
              <Metric label="Compras cargadas" value={formatCurrency(purchasesTotal)} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Panel title="Ultimas ventas">
            {night.sales.length === 0 ? (
              <EmptyState text="No hay ventas registradas." />
            ) : (
              night.sales.slice(0, 6).map((sale) => (
                <Row
                  key={sale.id}
                  title={`Venta ${sale.type}`}
                  subtitle={`${sale.items.length} items - ${sale.payments[0]?.method ?? "Sin medio"}`}
                  value={formatCurrency(sale.total)}
                />
              ))
            )}
          </Panel>

          <Panel title="Ultimos gastos">
            {night.expenses.length === 0 ? (
              <EmptyState text="No hay gastos registrados." />
            ) : (
              night.expenses.slice(0, 6).map((expense) => (
                <Row
                  key={expense.id}
                  title={expense.category}
                  subtitle={expense.note ?? expense.description ?? "Sin detalle"}
                  value={formatCurrency(expense.amount)}
                />
              ))
            )}
          </Panel>
        </section>

        <Panel title="Movimientos de stock recientes">
          {night.stockMovements.length === 0 ? (
            <EmptyState text="No hay movimientos de stock asociados." />
          ) : (
            night.stockMovements.map((movement) => (
              <Row
                key={movement.id}
                title={movement.product.name}
                subtitle={`${movement.type} - ${movement.note ?? "Sin detalle"}`}
                value={formatNumber(movement.quantity)}
              />
            ))
          )}
        </Panel>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function Row({
  title,
  subtitle,
  value,
}: {
  title: string;
  subtitle: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
      </div>
      <p className="text-right font-semibold text-white">{value}</p>
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

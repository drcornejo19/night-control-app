import type { Prisma } from "@prisma/client";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Landmark,
  Receipt,
  Wallet,
} from "lucide-react";

import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { OpenCashForm } from "@/components/cash/open-cash-form";
import { CloseCashForm } from "@/components/cash/close-cash-form";
import { CashMovementForm } from "@/components/cash/cash-movement-form";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { getActiveVenueId } from "@/lib/venues/active-venue";
import { VenueSwitcher } from "@/components/venues/venue-switcher";

type CashBoxWithDetails = Prisma.CashBoxGetPayload<{
  include: {
    night: {
      include: {
        venue: true;
        responsibleUser: true;
      };
    };
    movements: {
      include: {
        user: true;
      };
    };
    openedBy: true;
    closedBy: true;
  };
}>;

type NightOptionRaw = Prisma.NightGetPayload<{
  include: {
    venue: true;
    cashBox: true;
  };
}>;

const paymentMethodLabels = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  CARD: "Tarjeta",
  QR: "QR",
  OTHER: "Otro",
} as const;

function getCashMetrics(cashBox: CashBoxWithDetails | null) {
  const methodTotals = {
    CASH: cashBox?.opening ?? 0,
    TRANSFER: 0,
    CARD: 0,
    QR: 0,
    OTHER: 0,
  };

  if (!cashBox) {
    return {
      income: 0,
      expense: 0,
      adjustments: 0,
      expected: 0,
      methodTotals,
    };
  }

  const income = cashBox.movements
    .filter((movement) => movement.type === "INCOME")
    .reduce((acc, movement) => acc + movement.amount, 0);

  const expense = cashBox.movements
    .filter((movement) => movement.type === "EXPENSE")
    .reduce((acc, movement) => acc + movement.amount, 0);

  const adjustments = cashBox.movements
    .filter((movement) => movement.type === "ADJUSTMENT")
    .reduce((acc, movement) => acc + movement.amount, 0);

  for (const movement of cashBox.movements) {
    const method = movement.method ?? "OTHER";
    const sign = movement.type === "EXPENSE" ? -1 : 1;
    methodTotals[method] += sign * movement.amount;
  }

  return {
    income,
    expense,
    adjustments,
    expected: cashBox.opening + income - expense + adjustments,
    methodTotals,
  };
}

export default async function CashPage() {
  const activeVenueId = await getActiveVenueId();

  const [venues, nightsRaw, cashBoxesRaw] = await Promise.all([
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
          in: ["PLANNED", "OPEN"],
        },
      },
      include: {
        venue: true,
        cashBox: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.cashBox.findMany({
      where: {
        night: {
          venueId: activeVenueId ?? undefined,
        },
      },
      include: {
        night: {
          include: {
            venue: true,
            responsibleUser: true,
          },
        },
        movements: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        openedBy: true,
        closedBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const nights = nightsRaw as NightOptionRaw[];
  const cashBoxes = cashBoxesRaw as CashBoxWithDetails[];
  const openCashBox =
    cashBoxes.find((cashBox) => cashBox.status === "OPEN") ?? null;
  const currentCashBox = openCashBox ?? cashBoxes[0] ?? null;
  const metrics = getCashMetrics(currentCashBox);

  const availableNights = nights
    .filter((night) => !night.cashBox)
    .map((night) => ({
      id: night.id,
      name: night.name,
      venueName: night.venue.name,
      status: night.status,
      date: night.date.toISOString(),
    }));

  const activeVenueName =
    venues.find((venue) => venue.id === activeVenueId)?.name ?? "Todas las sedes";

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Caja
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Caja operativa
            </h1>
            <p className="mt-2 text-zinc-400">
              Apertura, movimientos, medios de pago y cierre de caja por
              jornada.
            </p>
          </div>

          <VenueSwitcher venues={venues} activeVenueId={activeVenueId} />
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            icon={Landmark}
            label="Sede activa"
            value={activeVenueName}
          />
          <MetricCard
            icon={ArrowUpCircle}
            label="Ingresos"
            value={formatCurrency(metrics.income)}
            tone="green"
          />
          <MetricCard
            icon={ArrowDownCircle}
            label="Egresos"
            value={formatCurrency(metrics.expense)}
            tone="red"
          />
          <MetricCard
            icon={Wallet}
            label="Esperado"
            value={formatCurrency(metrics.expected)}
            tone="gold"
          />
          <MetricCard
            icon={Receipt}
            label="Diferencia"
            value={
              currentCashBox?.difference !== null &&
              currentCashBox?.difference !== undefined
                ? formatCurrency(currentCashBox.difference)
                : "-"
            }
            tone="zinc"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Panel title="Caja actual">
              {!currentCashBox ? (
                <EmptyState text="Todavia no hay cajas registradas." />
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-white">
                          {currentCashBox.night.name}
                        </h2>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                            currentCashBox.status === "OPEN"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : "border-zinc-500/20 bg-zinc-500/10 text-zinc-300"
                          }`}
                        >
                          {currentCashBox.status === "OPEN"
                            ? "Abierta"
                            : "Cerrada"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">
                        {currentCashBox.night.venue.name}
                        {currentCashBox.night.responsibleUser
                          ? ` - Responsable: ${currentCashBox.night.responsibleUser.name}`
                          : ""}
                      </p>
                    </div>
                    <p className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300">
                      {formatNumber(currentCashBox.movements.length)} movimientos
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SmallStat
                      label="Apertura"
                      value={formatCurrency(currentCashBox.opening)}
                    />
                    <SmallStat
                      label="Calculado"
                      value={formatCurrency(metrics.expected)}
                    />
                    <SmallStat
                      label="Declarado"
                      value={
                        currentCashBox.closing !== null &&
                        currentCashBox.closing !== undefined
                          ? formatCurrency(currentCashBox.closing)
                          : "-"
                      }
                    />
                    <SmallStat
                      label="Ajustes"
                      value={formatCurrency(metrics.adjustments)}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <SmallStat
                      label="Abierta por"
                      value={currentCashBox.openedBy?.name ?? "-"}
                    />
                    <SmallStat
                      label="Cerrada por"
                      value={currentCashBox.closedBy?.name ?? "-"}
                    />
                  </div>
                </div>
              )}
            </Panel>

            {openCashBox ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Nuevo movimiento">
                  <CashMovementForm cashBoxId={openCashBox.id} />
                </Panel>

                <Panel title="Cerrar caja">
                  <CloseCashForm
                    cashBoxId={openCashBox.id}
                    expected={getCashMetrics(openCashBox).expected}
                  />
                </Panel>
              </div>
            ) : (
              <Panel title="Abrir caja">
                <OpenCashForm nights={availableNights} />
              </Panel>
            )}
          </div>

          <div className="space-y-6">
            <Panel title="Medios de pago">
              <div className="space-y-3">
                {Object.entries(metrics.methodTotals).map(([method, total]) => (
                  <div
                    key={method}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <span className="text-sm text-zinc-300">
                      {
                        paymentMethodLabels[
                          method as keyof typeof paymentMethodLabels
                        ]
                      }
                    </span>
                    <span className="font-semibold text-white">
                      {formatCurrency(total)}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Movimientos recientes">
              <div className="space-y-3">
                {!currentCashBox || currentCashBox.movements.length === 0 ? (
                  <EmptyState text="No hay movimientos registrados." />
                ) : (
                  currentCashBox.movements.slice(0, 10).map((movement) => (
                    <div
                      key={movement.id}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-white">
                            {movement.category ?? movement.type}
                          </p>
                          <p className="mt-1 text-sm text-zinc-400">
                            {movement.note || "Sin detalle"}
                          </p>
                          <p className="mt-2 text-xs text-zinc-500">
                            {movement.user?.name ?? "Sistema"} -{" "}
                            {new Date(movement.createdAt).toLocaleString(
                              "es-AR"
                            )}
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              movement.type === "EXPENSE"
                                ? "text-red-300"
                                : movement.type === "INCOME"
                                  ? "text-emerald-300"
                                  : "text-[#D4AF37]"
                            }`}
                          >
                            {movement.type === "EXPENSE" ? "-" : "+"}
                            {formatCurrency(movement.amount)}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {movement.method
                              ? paymentMethodLabels[movement.method]
                              : "Sin metodo"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Panel>

            <Panel title="Historial de cajas">
              <div className="space-y-3">
                {cashBoxes.length === 0 ? (
                  <EmptyState text="Todavia no hay historial." />
                ) : (
                  cashBoxes.slice(0, 6).map((cashBox) => (
                    <div
                      key={cashBox.id}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-white">
                            {cashBox.night.name}
                          </p>
                          <p className="mt-1 text-sm text-zinc-400">
                            {cashBox.night.venue.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">
                            {cashBox.status}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {formatCurrency(cashBox.expected ?? cashBox.opening)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
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
  icon: React.ComponentType<{ className?: string }>;
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

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
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

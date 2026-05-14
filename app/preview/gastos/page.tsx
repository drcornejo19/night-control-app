import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowLeft,
  BadgeDollarSign,
  CalendarClock,
  Landmark,
  Plus,
  Receipt,
  TrendingDown,
  WalletCards,
} from "lucide-react";

import { formatCurrency, formatNumber } from "@/lib/utils";

const expenses = [
  ["Seguridad", "Viernes principal", "Transferencia", 380000],
  ["DJ invitado", "Viernes principal", "Transferencia", 250000],
  ["Limpieza", "Sin jornada", "Efectivo", 90000],
  ["Marketing", "Sin jornada", "Tarjeta", 120000],
] as const;

const fixedCosts = [
  ["Alquiler", "Mensual", 1800000, 60000],
  ["Personal fijo", "Mensual", 2400000, 80000],
  ["Servicios", "Mensual", 360000, 12000],
] as const;

const variableCosts = [
  ["Comision tarjeta", "Por venta", 145000],
  ["Personal eventual", "Por jornada", 310000],
  ["Impuestos estimados", "Otro", 185000],
] as const;

const expenseTotal = expenses.reduce((acc, item) => acc + item[3], 0);
const fixedDaily = fixedCosts.reduce((acc, item) => acc + item[3], 0);
const fixedMonthly = fixedCosts.reduce((acc, item) => acc + item[2], 0);
const variableTotal = variableCosts.reduce((acc, item) => acc + item[2], 0);
const revenue = 4350000;
const cogs = 1280000;
const grossProfit = revenue - cogs;
const net = grossProfit - expenseTotal - variableTotal - fixedDaily;
const margin = revenue > 0 ? Math.round((net / revenue) * 100) : 0;

export default function PreviewGastosPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </Link>
            <p className="mt-5 text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Vista preview
            </p>
            <h1 className="mt-2 text-4xl font-semibold">Costos y egresos</h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Gastos operativos, costos fijos y variables para rentabilidad.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/preview/stock"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
            >
              Ver stock
            </Link>
            <Link
              href="/preview/ventas"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
            >
              Ver ventas
            </Link>
            <Link
              href="/preview/caja"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
            >
              Ver caja
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Metric icon={Landmark} label="Sede" value="Black Club Palermo" />
          <Metric
            icon={Receipt}
            label="Gastos"
            value={formatCurrency(expenseTotal)}
            tone="red"
          />
          <Metric
            icon={CalendarClock}
            label="Fijos diarios"
            value={formatCurrency(fixedDaily)}
            tone="gold"
          />
          <Metric
            icon={WalletCards}
            label="Fijos mensuales"
            value={formatCurrency(fixedMonthly)}
          />
          <Metric
            icon={TrendingDown}
            label="Variables"
            value={formatCurrency(variableTotal)}
            tone="red"
          />
          <Metric
            icon={BadgeDollarSign}
            label="Neto estimado"
            value={formatCurrency(net)}
            tone={net >= 0 ? "green" : "red"}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel title="Nuevo gasto">
            <div className="grid gap-3 sm:grid-cols-2">
              <GhostInput label="Sede" value="Black Club Palermo" />
              <GhostInput label="Jornada" value="Viernes principal" />
              <GhostInput label="Categoria interna" value="Seguridad" />
              <GhostInput label="Tipo contable" value="Personal" />
              <GhostInput label="Medio de pago" value="Transferencia" />
              <GhostInput label="Monto" value="$ 380.000" />
            </div>
            <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black">
              <Plus className="h-4 w-4" />
              Registrar gasto
            </button>
          </Panel>

          <Panel title="Resumen financiero">
            <div className="space-y-3">
              <StatRow label="Ingresos" value={formatCurrency(revenue)} />
              <StatRow label="Costo mercaderia" value={formatCurrency(cogs)} />
              <StatRow
                label="Utilidad bruta"
                value={formatCurrency(grossProfit)}
                tone="green"
              />
              <StatRow label="Gastos" value={formatCurrency(expenseTotal)} />
              <StatRow
                label="Costos variables"
                value={formatCurrency(variableTotal)}
              />
              <StatRow
                label="Fijos prorrateados"
                value={formatCurrency(fixedDaily)}
              />
              <StatRow
                label="Resultado estimado"
                value={`${formatCurrency(net)} (${formatNumber(margin)}%)`}
                tone="green"
              />
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <Panel title="Gastos recientes">
            <div className="space-y-3">
              {expenses.map(([name, night, method, amount]) => (
                <CostRow
                  key={name}
                  name={name}
                  meta={`${night} - ${method}`}
                  amount={amount}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Costos fijos">
            <div className="space-y-3">
              {fixedCosts.map(([name, periodicity, amount, daily]) => (
                <CostRow
                  key={name}
                  name={name}
                  meta={`${periodicity} - ${formatCurrency(daily)} / dia`}
                  amount={amount}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Costos variables">
            <div className="space-y-3">
              {variableCosts.map(([name, relation, amount]) => (
                <CostRow key={name} name={name} meta={relation} amount={amount} />
              ))}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

function Metric({
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
  const color =
    tone === "gold"
      ? "text-[#D4AF37]"
      : tone === "green"
        ? "text-emerald-400"
        : tone === "red"
          ? "text-red-400"
          : "text-zinc-300";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <Icon className={`h-5 w-5 ${color}`} />
      <p className="mt-3 text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
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

function CostRow({
  name,
  meta,
  amount,
}: {
  name: string;
  meta: string;
  amount: number;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">{name}</p>
          <p className="mt-1 text-sm text-zinc-400">{meta}</p>
        </div>
        <p className="text-right font-semibold">{formatCurrency(amount)}</p>
      </div>
    </article>
  );
}

function GhostInput({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

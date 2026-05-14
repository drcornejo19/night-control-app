import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowLeft,
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

import { calculateBreakEven } from "@/lib/finance/break-even";
import { formatCurrency, formatNumber } from "@/lib/utils";

const revenue = 12850000;
const cogs = 3820000;
const fixedCosts = 1064000;
const operationalExpenses = 2180000;
const variableCosts = cogs + 940000;
const netProfit = revenue - variableCosts - fixedCosts - operationalExpenses;
const breakEven = calculateBreakEven({
  revenue,
  fixedCosts,
  variableCosts,
  operationalExpenses,
  attendees: 1180,
  averageTicket: revenue / 1180,
});

const paymentRows = [
  ["Tarjeta", 4650000],
  ["Transferencia", 3150000],
  ["Efectivo", 2980000],
  ["QR", 2070000],
] as const;

const channelRows = [
  ["Barra", 7350000],
  ["Entradas", 3200000],
  ["Reservas", 1450000],
  ["Resumen sectores", 850000],
] as const;

const productRows = [
  ["Fernet Branca", 236, 2140000, 910000],
  ["Red Bull", 312, 998400, 624000],
  ["Vodka Smirnoff", 185, 1665000, 820000],
] as const;

const nightRows = [
  ["Viernes principal", "CERRADA", 5120000, 2480000],
  ["Sabado cachengue", "CERRADA", 6830000, 2910000],
  ["Domingo especial", "ABIERTA", 900000, -180000],
] as const;

export default function PreviewReportesPage() {
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
            <h1 className="mt-2 text-4xl font-semibold">Balance operativo</h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Reportes diarios, semanales y mensuales de ingresos, costos,
              caja, stock y rentabilidad.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <PreviewLink href="/preview/equilibrio">Ver equilibrio</PreviewLink>
            <PreviewLink href="/preview/gastos">Ver gastos</PreviewLink>
            <PreviewLink href="/preview/stock">Ver stock</PreviewLink>
          </div>
        </div>

        <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <Context icon={CalendarDays} label="Periodo" value="Este mes" detail="01 may - 31 may" />
            <Context icon={Landmark} label="Sede" value="Black Club Palermo" detail="3 jornadas" />
            <Context icon={Scale} label="Estado" value="Rentable" detail={`${breakEven.progressPercent}% del equilibrio`} />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Metric icon={BadgeDollarSign} label="Ingresos" value={formatCurrency(revenue)} tone="green" />
          <Metric icon={ShoppingCart} label="COGS" value={formatCurrency(cogs)} tone="red" />
          <Metric icon={TrendingUp} label="Utilidad bruta" value={formatCurrency(revenue - cogs)} tone="green" />
          <Metric icon={Scale} label="Equilibrio" value={formatCurrency(breakEven.breakEvenRevenue)} tone="gold" />
          <Metric icon={BarChart3} label="Resultado neto" value={formatCurrency(netProfit)} tone="green" />
          <Metric icon={CreditCard} label="Ticket promedio" value={formatCurrency(revenue / 1180)} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel title="Resumen financiero">
            <div className="space-y-3">
              <StatRow label="Ingresos totales" value={formatCurrency(revenue)} />
              <StatRow label="Costo mercaderia" value={formatCurrency(cogs)} />
              <StatRow label="Costos variables" value={formatCurrency(variableCosts - cogs)} />
              <StatRow label="Costos fijos" value={formatCurrency(fixedCosts)} />
              <StatRow label="Gastos operativos" value={formatCurrency(operationalExpenses)} />
              <StatRow label="Resultado neto" value={formatCurrency(netProfit)} tone="green" />
            </div>
          </Panel>

          <Panel title="Ingresos por canal">
            <RankedRows rows={channelRows} />
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel title="Medios de pago">
            <RankedRows rows={paymentRows} />
          </Panel>

          <Panel title="Ranking de jornadas">
            <div className="space-y-3">
              {nightRows.map(([name, status, income, result]) => (
                <article key={name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{name}</p>
                      <p className="mt-1 text-sm text-zinc-400">{status}</p>
                    </div>
                    <div className="text-right">
                      <p className={result >= 0 ? "font-semibold text-emerald-400" : "font-semibold text-red-400"}>
                        {formatCurrency(result)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {formatCurrency(income)} ingresos
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <Panel title="Top productos">
            <div className="space-y-3">
              {productRows.map(([name, units, income, margin], index) => (
                <article key={name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-sm font-bold text-[#D4AF37]">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold">{name}</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {formatNumber(units)} unidades
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(income)}</p>
                      <p className="mt-1 text-xs text-emerald-400">
                        {formatCurrency(margin)} margen
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Stock y desvíos">
            <div className="grid gap-3">
              <MiniMetric icon={Boxes} label="Movimientos" value="48" />
              <MiniMetric icon={PackageSearch} label="Mermas valorizadas" value={formatCurrency(84000)} tone="red" />
              <StatRow label="Hielo - Merma" value="-12" tone="red" />
              <StatRow label="Fernet - Compra" value="+48" tone="green" />
            </div>
          </Panel>

          <Panel title="Lectura gerencial">
            <div className="space-y-3">
              <Insight label="Equilibrio" value="El periodo superó el punto de equilibrio." />
              <Insight label="Rentabilidad" value="Margen neto 31% sobre ingresos." />
              <Insight label="Operación" value="1.180 asistentes estimados en 3 jornadas." />
              <Insight label="Compras" value="$ 2.940.000 comprados a proveedores." />
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

function PreviewLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
    >
      {children}
    </Link>
  );
}

function Context({
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
      <p className="mt-1 font-semibold">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{detail}</p>
    </div>
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

function RankedRows({ rows }: { rows: readonly (readonly [string, number])[] }) {
  return (
    <div className="space-y-3">
      {rows.map(([label, total]) => (
        <StatRow key={label} label={label} value={formatCurrency(total)} />
      ))}
    </div>
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
      <p className="mt-1 text-xl font-semibold">{value}</p>
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

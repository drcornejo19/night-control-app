import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowLeft,
  BadgeDollarSign,
  Calculator,
  CalendarClock,
  Landmark,
  Scale,
  Target,
  TrendingUp,
} from "lucide-react";

import { calculateBreakEven, calculateProjectedProfit } from "@/lib/finance/break-even";
import { formatCurrency, formatNumber } from "@/lib/utils";

const revenue = 4350000;
const cogs = 1280000;
const fixedCosts = 152000;
const variableCosts = 640000 + cogs;
const operationalExpenses = 840000;
const attendees = 410;
const averageTicket = revenue / attendees;
const breakEven = calculateBreakEven({
  revenue,
  fixedCosts,
  variableCosts,
  operationalExpenses,
  attendees,
  averageTicket,
});
const simulation = calculateProjectedProfit({
  attendees: 520,
  averageTicket: 12500,
  fixedCosts,
  variableCostRatio: variableCosts / revenue,
  operationalExpenses,
});

const scenarios = [
  ["Conservador", 330, 9800],
  ["Base rentable", 410, 10600],
  ["Noche fuerte", 520, 12500],
] as const;

export default function PreviewEquilibrioPage() {
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
            <h1 className="mt-2 text-4xl font-semibold">
              Punto de equilibrio
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Cuanto necesita vender la jornada para cubrir costos y entrar en
              ganancia.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <PreviewLink href="/preview/gastos">Ver gastos</PreviewLink>
            <PreviewLink href="/preview/stock">Ver stock</PreviewLink>
            <PreviewLink href="/preview/ventas">Ver ventas</PreviewLink>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Metric icon={Landmark} label="Sede" value="Black Club Palermo" />
          <Metric icon={CalendarClock} label="Jornada" value="Viernes" />
          <Metric
            icon={BadgeDollarSign}
            label="Ingresos"
            value={formatCurrency(revenue)}
            tone="green"
          />
          <Metric
            icon={Scale}
            label="Equilibrio"
            value={formatCurrency(breakEven.breakEvenRevenue)}
            tone="gold"
          />
          <Metric
            icon={Target}
            label="Falta vender"
            value={formatCurrency(breakEven.missingRevenue)}
            tone="red"
          />
          <Metric
            icon={TrendingUp}
            label="Avance"
            value={`${formatNumber(breakEven.progressPercent)}%`}
            tone="gold"
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
                <Pill tone={breakEven.netProfit >= 0 ? "green" : "red"}>
                  {breakEven.netProfit >= 0 ? "En ganancia" : "En perdida"}
                </Pill>
                <Pill>
                  {formatNumber(breakEven.breakEvenAttendees)} clientes
                  equilibrio
                </Pill>
                <Pill>{formatCurrency(averageTicket)} ticket prom.</Pill>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <StatRow label="Ingresos registrados" value={formatCurrency(revenue)} />
              <StatRow
                label="Costos variables"
                value={formatCurrency(variableCosts)}
              />
              <StatRow
                label="Margen contribucion"
                value={formatCurrency(breakEven.contributionMargin)}
                tone="green"
              />
              <StatRow label="Costos fijos" value={formatCurrency(fixedCosts)} />
              <StatRow
                label="Gastos operativos"
                value={formatCurrency(operationalExpenses)}
              />
            </div>
          </Panel>

          <Panel title="Simulador">
            <div className="grid gap-3 sm:grid-cols-2">
              <GhostInput label="Personas" value="520" />
              <GhostInput label="Ticket promedio" value="$ 12.500" />
            </div>
            <div className="mt-4 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-5">
              <div className="flex items-center gap-3">
                <Calculator className="h-5 w-5 text-[#D4AF37]" />
                <div>
                  <p className="text-sm text-zinc-300">Utilidad estimada</p>
                  <p className="mt-1 text-3xl font-semibold text-emerald-400">
                    {formatCurrency(simulation.projectedProfit)}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MiniStat
                label="Venta proyectada"
                value={formatCurrency(simulation.projectedRevenue)}
              />
              <MiniStat
                label="Variables"
                value={formatCurrency(simulation.projectedVariableCosts)}
              />
              <MiniStat
                label="Fijos + gastos"
                value={formatCurrency(fixedCosts + operationalExpenses)}
              />
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel title="Escenarios">
            <div className="space-y-3">
              {scenarios.map(([name, people, ticket]) => {
                const result = calculateBreakEven({
                  revenue: people * ticket,
                  fixedCosts,
                  variableCosts: people * ticket * (variableCosts / revenue),
                  operationalExpenses,
                  attendees: people,
                  averageTicket: ticket,
                });

                return (
                  <article
                    key={name}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{name}</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {formatNumber(people)} personas x{" "}
                          {formatCurrency(ticket)}
                        </p>
                      </div>
                      <Pill tone={result.netProfit >= 0 ? "green" : "red"}>
                        {formatCurrency(result.netProfit)}
                      </Pill>
                    </div>
                  </article>
                );
              })}
            </div>
          </Panel>

          <Panel title="Composicion">
            <div className="grid gap-3 sm:grid-cols-2">
              <MiniStat label="Ventas" value={formatCurrency(2850000)} />
              <MiniStat label="Entradas" value={formatCurrency(1250000)} />
              <MiniStat label="Reservas" value={formatCurrency(250000)} />
              <MiniStat label="COGS" value={formatCurrency(cogs)} />
              <MiniStat
                label="Variables cargados"
                value={formatCurrency(variableCosts - cogs)}
              />
              <MiniStat label="Fijos diarios" value={formatCurrency(fixedCosts)} />
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
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

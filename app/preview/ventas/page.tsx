import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  CreditCard,
  Landmark,
  Plus,
  ReceiptText,
  ShoppingBag,
  Wallet,
} from "lucide-react";

import { formatCurrency, formatNumber } from "@/lib/utils";

const sales = [
  {
    id: "sale-1",
    channel: "BAR",
    night: "Viernes principal",
    venue: "Black Club Palermo",
    total: 220000,
    method: "Tarjeta",
    items: ["Fernet Branca x2", "Red Bull x4"],
    time: "00:42 hs",
  },
  {
    id: "sale-2",
    channel: "VIP",
    night: "Viernes principal",
    venue: "Black Club Palermo",
    total: 180000,
    method: "Transferencia",
    items: ["Combo mesa x1"],
    time: "00:28 hs",
  },
  {
    id: "sale-3",
    channel: "BAR",
    night: "Viernes principal",
    venue: "Black Club Palermo",
    total: 45000,
    method: "Efectivo",
    items: ["Agua x3", "Speed x2"],
    time: "00:15 hs",
  },
];

const summaries = [
  {
    sector: "Barra principal",
    total: 2850000,
    cash: 910000,
    transfer: 640000,
    card: 1215000,
    qr: 85000,
  },
  {
    sector: "Puerta",
    total: 1250000,
    cash: 610000,
    transfer: 570000,
    card: 70000,
    qr: 0,
  },
];

const methodTotals = [
  ["Efectivo", 1520000],
  ["Transferencia", 1210000],
  ["Tarjeta", 1535000],
  ["QR", 85000],
] as const;

const totalDetailed = sales.reduce((acc, sale) => acc + sale.total, 0);
const totalSummary = summaries.reduce((acc, summary) => acc + summary.total, 0);
const totalRevenue = totalDetailed + totalSummary;

export default function PreviewVentasPage() {
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
              Ventas y cierres por sector
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Demo visual de venta detallada, resumen por sector, medios de pago
              y lectura rapida de ingresos.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/preview/caja"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
            >
              Ver caja
            </Link>
            <Link
              href="/preview/jornadas"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
            >
              Ver jornadas
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Metric icon={Landmark} label="Sede" value="Black Club Palermo" />
          <Metric
            icon={ShoppingBag}
            label="Venta detallada"
            value={formatCurrency(totalDetailed)}
            tone="gold"
          />
          <Metric
            icon={ReceiptText}
            label="Resumen sectores"
            value={formatCurrency(totalSummary)}
          />
          <Metric
            icon={Wallet}
            label="Ingresos ventas"
            value={formatCurrency(totalRevenue)}
            tone="green"
          />
          <Metric
            icon={BarChart3}
            label="Margen bruto"
            value={formatCurrency(245000)}
            tone="green"
          />
          <Metric
            icon={CreditCard}
            label="Ticket promedio"
            value={formatCurrency(totalDetailed / sales.length)}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel title="Carga rapida por sector">
            <div className="grid gap-3 sm:grid-cols-2">
              <GhostInput label="Jornada" value="Viernes principal" />
              <GhostInput label="Sector" value="Barra principal" />
              <GhostInput label="Efectivo" value="$ 910.000" />
              <GhostInput label="Transferencia" value="$ 640.000" />
              <GhostInput label="Tarjeta" value="$ 1.215.000" />
              <GhostInput label="QR" value="$ 85.000" />
            </div>
            <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black">
              <Plus className="h-4 w-4" />
              Guardar resumen
            </button>
          </Panel>

          <Panel title="Medios de pago">
            <div className="space-y-3">
              {methodTotals.map(([label, total]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="text-sm text-zinc-300">{label}</span>
                  <span className="font-semibold">{formatCurrency(total)}</span>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel title="Ultimas ventas detalladas">
            <div className="space-y-3">
              {sales.map((sale) => (
                <article
                  key={sale.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">Venta {sale.channel}</p>
                        <Pill>{sale.night}</Pill>
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">
                        {sale.venue} - {sale.time}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {sale.items.map((item) => (
                          <Pill key={item}>{item}</Pill>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold">
                        {formatCurrency(sale.total)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {sale.method}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Cierres resumidos">
            <div className="space-y-3">
              {summaries.map((summary) => (
                <article
                  key={summary.sector}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{summary.sector}</p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {formatNumber(4)} medios cargados
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(summary.total)}
                    </p>
                  </div>
                </article>
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

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
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

function GhostInput({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

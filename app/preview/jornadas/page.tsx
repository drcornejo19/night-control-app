import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Receipt,
  Ticket,
  Wallet,
} from "lucide-react";

import { NightStatusBadge } from "@/components/nights/night-status-badge";
import { formatCurrency, formatNumber } from "@/lib/utils";

const sessions = [
  {
    id: "preview-1",
    name: "Viernes principal",
    venue: "Black Club Palermo",
    responsible: "Marcos R.",
    status: "OPEN" as const,
    date: "2026-05-15",
    revenue: 4350000,
    expenses: 620000,
    attendees: 420,
    cash: "OPEN",
  },
  {
    id: "preview-2",
    name: "Sabado reggaeton",
    venue: "Black Club Palermo",
    responsible: "Sofia M.",
    status: "PLANNED" as const,
    date: "2026-05-16",
    revenue: 0,
    expenses: 180000,
    attendees: 0,
    cash: "Sin caja",
  },
  {
    id: "preview-3",
    name: "Cierre hamburgueseria",
    venue: "Local Guemes",
    responsible: "Juan P.",
    status: "CLOSED" as const,
    date: "2026-05-12",
    revenue: 1280000,
    expenses: 410000,
    attendees: 186,
    cash: "CLOSED",
  },
];

const totalRevenue = sessions.reduce((acc, session) => acc + session.revenue, 0);
const openCount = sessions.filter((session) => session.status === "OPEN").length;
const plannedCount = sessions.filter(
  (session) => session.status === "PLANNED"
).length;
const closedCount = sessions.filter(
  (session) => session.status === "CLOSED"
).length;

export default function PreviewJornadasPage() {
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
              Jornadas operativas
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Demo visual del flujo de Etapa 2: planificar, abrir, cerrar y
              auditar una jornada alrededor de caja, ventas y gastos.
            </p>
          </div>

          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-3 text-sm text-[#D4AF37]">
            Preview sin datos reales
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric
            icon={Clock3}
            label="Abiertas"
            value={formatNumber(openCount)}
            tone="gold"
          />
          <Metric
            icon={CalendarClock}
            label="Planificadas"
            value={formatNumber(plannedCount)}
            tone="blue"
          />
          <Metric
            icon={CheckCircle2}
            label="Cerradas"
            value={formatNumber(closedCount)}
            tone="zinc"
          />
          <Metric
            icon={CircleDollarSign}
            label="Ingresos registrados"
            value={formatCurrency(totalRevenue)}
            tone="green"
          />
        </section>

        <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5 md:p-6">
          <div className="grid gap-4">
            {sessions.map((session) => {
              const net = session.revenue - session.expenses;

              return (
                <article
                  key={session.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">
                          {session.name}
                        </h2>
                        <NightStatusBadge status={session.status} />
                      </div>

                      <p className="mt-1 text-sm text-zinc-400">
                        {session.venue} - Responsable: {session.responsible}
                      </p>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                        <Pill>Fecha: {session.date}</Pill>
                        <Pill>Ingresos: {formatCurrency(session.revenue)}</Pill>
                        <Pill>Gastos: {formatCurrency(session.expenses)}</Pill>
                        <Pill>Neto: {formatCurrency(net)}</Pill>
                        <Pill>
                          <Ticket className="mr-1 inline h-3 w-3" />
                          {formatNumber(session.attendees)} asistentes
                        </Pill>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Pill>Caja: {session.cash}</Pill>
                        <Pill>Stock: control inicial/final</Pill>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {session.status === "PLANNED" ? (
                        <PreviewButton>Abrir</PreviewButton>
                      ) : null}
                      {session.status === "OPEN" ? (
                        <PreviewButton>Cerrar</PreviewButton>
                      ) : null}
                      {session.status === "CLOSED" ? (
                        <PreviewButton>Auditar</PreviewButton>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Detalle de jornada">
            <Row label="Caja esperada" value="$ 4.265.000" icon={Wallet} />
            <Row label="Caja declarada" value="$ 4.350.000" icon={Wallet} />
            <Row label="Diferencia" value="$ 85.000" icon={Receipt} />
          </Panel>

          <Panel title="Composicion de ingresos">
            <Row label="Barra/productos" value="$ 2.850.000" icon={Ticket} />
            <Row label="Entradas" value="$ 1.250.000" icon={Ticket} />
            <Row label="Reservas/VIP" value="$ 250.000" icon={Ticket} />
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
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "gold" | "green" | "blue" | "zinc";
}) {
  const color =
    tone === "gold"
      ? "text-[#D4AF37]"
      : tone === "green"
        ? "text-emerald-400"
        : tone === "blue"
          ? "text-sky-300"
          : "text-zinc-300";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <Icon className={`h-5 w-5 ${color}`} />
      <p className="mt-3 text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-300">
      {children}
    </span>
  );
}

function PreviewButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-2 text-sm font-medium text-[#D4AF37]"
    >
      {children}
    </button>
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
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-[#D4AF37]" />
        <span className="text-sm text-zinc-300">{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

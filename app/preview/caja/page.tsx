import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowLeft,
  ArrowUpCircle,
  Landmark,
  Receipt,
  Wallet,
} from "lucide-react";

import { formatCurrency } from "@/lib/utils";

const methodTotals = [
  ["Efectivo", 1520000],
  ["Transferencia", 1210000],
  ["Tarjeta", 1535000],
  ["QR", 85000],
  ["Otro", 0],
] as const;

const movements = [
  {
    type: "INCOME",
    category: "Venta barra",
    note: "Barra principal",
    amount: 45000,
    method: "Efectivo",
    time: "00:42 hs",
  },
  {
    type: "EXPENSE",
    category: "DJ",
    note: "Pago operativo",
    amount: 150000,
    method: "Transferencia",
    time: "00:20 hs",
  },
  {
    type: "INCOME",
    category: "Entrada general",
    note: "Puerta",
    amount: 15000,
    method: "QR",
    time: "00:15 hs",
  },
  {
    type: "ADJUSTMENT",
    category: "Ajuste caja",
    note: "Redondeo declarado",
    amount: 5000,
    method: "Efectivo",
    time: "00:05 hs",
  },
];

export default function PreviewCajaPage() {
  const opening = 50000;
  const income = 4350000;
  const expenses = 620000;
  const expected = 4265000;
  const declared = 4350000;
  const difference = declared - expected;

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
            <h1 className="mt-2 text-4xl font-semibold">Caja operativa</h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Demo visual de apertura, movimientos, medios de pago y cierre con
              diferencia calculada.
            </p>
          </div>

          <Link
            href="/preview/jornadas"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
          >
            Ver jornadas
          </Link>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Metric icon={Landmark} label="Sede activa" value="Black Club Palermo" />
          <Metric
            icon={ArrowUpCircle}
            label="Ingresos"
            value={formatCurrency(income)}
            tone="green"
          />
          <Metric
            icon={ArrowDownCircle}
            label="Egresos"
            value={formatCurrency(expenses)}
            tone="red"
          />
          <Metric
            icon={Wallet}
            label="Esperado"
            value={formatCurrency(expected)}
            tone="gold"
          />
          <Metric
            icon={Receipt}
            label="Diferencia"
            value={formatCurrency(difference)}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Panel title="Caja actual">
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold">
                        Viernes principal
                      </h2>
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                        Abierta
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">
                      Black Club Palermo - Responsable: Marcos R.
                    </p>
                  </div>
                  <p className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300">
                    24 movimientos
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <SmallStat label="Apertura" value={formatCurrency(opening)} />
                  <SmallStat label="Calculado" value={formatCurrency(expected)} />
                  <SmallStat label="Declarado" value={formatCurrency(declared)} />
                  <SmallStat label="Ajustes" value={formatCurrency(5000)} />
                </div>
              </div>
            </Panel>

            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Nuevo movimiento">
                <div className="grid gap-3 sm:grid-cols-2">
                  <GhostInput label="Tipo" value="Ingreso" />
                  <GhostInput label="Medio" value="Efectivo" />
                  <GhostInput label="Categoria" value="Venta barra" />
                  <GhostInput label="Monto" value="$ 45.000" />
                </div>
                <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-400">
                  Formulario real disponible en la ruta Caja autenticada.
                </div>
              </Panel>

              <Panel title="Cerrar caja">
                <div className="grid gap-3 sm:grid-cols-2">
                  <SmallStat label="Esperado" value={formatCurrency(expected)} />
                  <SmallStat
                    label="Diferencia previa"
                    value={formatCurrency(difference)}
                  />
                </div>
                <button className="mt-4 w-full rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black">
                  Cerrar caja
                </button>
              </Panel>
            </div>
          </div>

          <div className="space-y-6">
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

            <Panel title="Movimientos recientes">
              <div className="space-y-3">
                {movements.map((movement) => (
                  <div
                    key={`${movement.category}-${movement.time}`}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{movement.category}</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {movement.note}
                        </p>
                        <p className="mt-2 text-xs text-zinc-500">
                          {movement.method} - {movement.time}
                        </p>
                      </div>
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
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
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
  icon: React.ComponentType<{ className?: string }>;
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
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
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

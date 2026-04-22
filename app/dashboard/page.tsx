import {
  AlertTriangle,
  BadgeDollarSign,
  Crown,
  Martini,
  Receipt,
  Ticket,
  Wallet,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { formatCurrency } from "@/lib/utils";

const topProducts = [
  { name: "Fernet Branca", units: 236, total: 708000 },
  { name: "Vodka Smirnoff", units: 185, total: 555000 },
  { name: "Red Bull", units: 312, total: 499200 },
  { name: "Whisky J&B", units: 128, total: 384000 },
  { name: "Heineken", units: 210, total: 273000 },
];

const alerts = [
  {
    title: "Stock crítico",
    description: "Hielo — quedan 5 bolsas",
    tone: "danger",
  },
  {
    title: "Stock bajo",
    description: "Red Bull — quedan 12 unidades",
    tone: "warning",
  },
  {
    title: "Diferencia en caja",
    description: "La diferencia supera el 1,5%",
    tone: "warning",
  },
  {
    title: "Gasto alto",
    description: "Personal 18% más que anoche",
    tone: "info",
  },
];

const activity = [
  {
    title: "Venta #1258",
    subtitle: "Barra principal",
    amount: 45000,
    time: "00:42 hs",
  },
  {
    title: "Gasto - DJ",
    subtitle: "Gastos",
    amount: 150000,
    time: "00:20 hs",
  },
  {
    title: "Venta Entrada",
    subtitle: "Entrada general",
    amount: 15000,
    time: "00:15 hs",
  },
  {
    title: "Venta #1257",
    subtitle: "VIP Mesa 3",
    amount: 220000,
    time: "00:10 hs",
  },
  {
    title: "Compra - Hielo",
    subtitle: "Proveedor: Frío Express",
    amount: 80000,
    time: "Ayer 19:30",
  },
];

const hourlyData = [5, 12, 28, 44, 68, 84, 82, 89, 60, 22];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-6">
          <KpiCard
            title="Recaudación total"
            value={4350000}
            change={18}
            icon={BadgeDollarSign}
          />
          <KpiCard
            title="Ventas barra"
            value={2850000}
            change={21}
            icon={Martini}
          />
          <KpiCard
            title="Entradas"
            value={1250000}
            change={15}
            icon={Ticket}
          />
          <KpiCard
            title="Gastos"
            value={620000}
            change={8}
            icon={Receipt}
            variant="danger"
          />
          <KpiCard
            title="Ganancia neta"
            value={3730000}
            change={20}
            icon={Crown}
            variant="success"
          />
          <KpiCard
            title="Diferencia caja"
            value={85000}
            change={1.9}
            icon={Wallet}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr_0.45fr]">
          <SectionCard title="Ingresos por hora">
            <div className="flex h-[340px] flex-col justify-between rounded-[24px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(212,175,55,0.12),transparent)] p-5">
              <div className="flex items-end gap-2">
                {hourlyData.map((value, index) => (
                  <div
                    key={index}
                    className="flex flex-1 flex-col items-center gap-3"
                  >
                    <div className="flex h-[240px] w-full items-end">
                      <div
                        className="w-full rounded-t-2xl bg-gradient-to-t from-[#8C6A18] via-[#D4AF37] to-[#F2D16B] shadow-[0_0_18px_rgba(212,175,55,0.16)]"
                        style={{ height: `${value}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500">
                      {index + 20 > 23 ? `${index - 4}hs` : `${index + 20}hs`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Resumen de caja" action="Ver detalle">
            <div className="space-y-4">
              {[
                ["Efectivo", "$1.520.000"],
                ["Transferencia", "$1.210.000"],
                ["Tarjeta", "$1.535.000"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <span className="text-sm text-zinc-300">{label}</span>
                  <span className="text-sm font-semibold text-white">
                    {value}
                  </span>
                </div>
              ))}

              <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Total esperado</span>
                  <span className="font-semibold text-white">$4.265.000</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Total contado</span>
                  <span className="font-semibold text-white">$4.350.000</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-3">
                  <span className="text-sm font-semibold text-emerald-400">
                    Diferencia
                  </span>
                  <span className="text-lg font-semibold text-emerald-400">
                    $85.000
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Estado de la noche">
            <div className="flex h-full flex-col items-center justify-between gap-6 rounded-[24px] border border-[#D4AF37]/15 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_55%)] p-6 text-center">
              <div className="flex h-44 w-44 items-center justify-center rounded-full border-[10px] border-[#D4AF37]/70">
                <div className="flex h-32 w-32 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-black/20">
                  <span className="text-sm font-semibold uppercase tracking-[0.24em] text-[#D4AF37]">
                    En curso
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-zinc-400">Noche abierta desde</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  22:15 hs
                </p>
              </div>

              <button className="w-full rounded-2xl bg-[#D4AF37] px-4 py-3.5 text-sm font-semibold text-black transition hover:brightness-110">
                Cerrar noche
              </button>
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.85fr_0.85fr_1fr]">
          <SectionCard title="Top productos" action="Ver todos">
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-sm font-bold text-[#D4AF37]">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="text-sm text-zinc-400">
                        {product.units} uds
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(product.total)}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Alertas" action="Ver todas">
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 rounded-xl p-2 ${
                        alert.tone === "danger"
                          ? "bg-red-500/15 text-red-400"
                          : alert.tone === "warning"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-sky-500/15 text-sky-400"
                      }`}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="font-medium text-white">{alert.title}</p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Últimas operaciones" action="Ver todas">
            <div className="space-y-3">
              {activity.map((item) => (
                <div
                  key={`${item.title}-${item.time}`}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {formatCurrency(item.amount)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>
      </div>
    </AppShell>
  );
}
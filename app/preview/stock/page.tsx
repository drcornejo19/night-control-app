import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowDownUp,
  ArrowLeft,
  Boxes,
  ClipboardCheck,
  Landmark,
  PackageSearch,
  Plus,
  Scale,
  TrendingDown,
} from "lucide-react";

import { formatCurrency, formatNumber } from "@/lib/utils";

const products = [
  {
    name: "Fernet Branca",
    category: "Bebidas",
    unit: "botellas",
    stock: 42,
    minStock: 18,
    averageCost: 8200,
    salePrice: 18500,
  },
  {
    name: "Red Bull",
    category: "Bebidas",
    unit: "latas",
    stock: 12,
    minStock: 24,
    averageCost: 1200,
    salePrice: 3200,
  },
  {
    name: "Hielo",
    category: "Insumos",
    unit: "bolsas",
    stock: 5,
    minStock: 15,
    averageCost: 1800,
    salePrice: 0,
  },
];

const movements = [
  ["Fernet Branca", "Compra", 24, 196800, "Hoy 18:40"],
  ["Red Bull", "Venta", -18, -21600, "Hoy 01:15"],
  ["Hielo", "Merma", -4, -7200, "Hoy 00:30"],
] as const;

const stockValue = products.reduce(
  (acc, product) => acc + product.stock * product.averageCost,
  0
);
const lowStock = products.filter((product) => product.stock <= product.minStock);

export default function PreviewStockPage() {
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
            <h1 className="mt-2 text-4xl font-semibold">Stock valorizado</h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Cantidades, costo promedio, mermas y conteos por jornada.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/preview/ventas" className="preview-link">
              Ver ventas
            </Link>
            <Link href="/preview/caja" className="preview-link">
              Ver caja
            </Link>
            <Link href="/preview/jornadas" className="preview-link">
              Ver jornadas
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Metric icon={Landmark} label="Sede" value="Black Club Palermo" />
          <Metric
            icon={Boxes}
            label="Stock valorizado"
            value={formatCurrency(stockValue)}
            tone="gold"
          />
          <Metric
            icon={PackageSearch}
            label="Productos"
            value={formatNumber(products.length)}
          />
          <Metric
            icon={AlertTriangle}
            label="Bajo minimo"
            value={formatNumber(lowStock.length)}
            tone="red"
          />
          <Metric icon={Scale} label="Desvio unidades" value="4" tone="red" />
          <Metric
            icon={TrendingDown}
            label="Desvio valorizado"
            value={formatCurrency(18800)}
            tone="red"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel title="Movimiento manual">
            <div className="grid gap-3 sm:grid-cols-2">
              <GhostInput label="Producto" value="Red Bull - 12 latas" />
              <GhostInput label="Jornada" value="Viernes principal" />
              <GhostInput label="Tipo" value="Merma" />
              <GhostInput label="Cantidad" value="4" />
              <GhostInput label="Costo unitario" value="$ 1.200" />
              <GhostInput label="Nota" value="Conteo barra principal" />
            </div>
            <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black">
              <Plus className="h-4 w-4" />
              Registrar movimiento
            </button>
          </Panel>

          <Panel title="Conteo por jornada">
            <div className="grid gap-3 sm:grid-cols-2">
              <GhostInput label="Jornada" value="Viernes principal" />
              <GhostInput label="Producto" value="Fernet Branca" />
              <GhostInput label="Stock inicial" value="54" />
              <GhostInput label="Stock final" value="42" />
            </div>
            <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black">
              <ClipboardCheck className="h-4 w-4" />
              Guardar conteo
            </button>
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel title="Inventario">
            <div className="space-y-3">
              {products.map((product) => {
                const margin =
                  product.salePrice > 0
                    ? Math.round(
                        ((product.salePrice - product.averageCost) /
                          product.salePrice) *
                          100
                      )
                    : 0;

                return (
                  <article
                    key={product.name}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{product.name}</p>
                          <Pill>{product.category}</Pill>
                          <Pill
                            tone={
                              product.stock <= product.minStock
                                ? "red"
                                : "green"
                            }
                          >
                            {product.stock <= product.minStock ? "Bajo" : "OK"}
                          </Pill>
                        </div>
                        <p className="mt-1 text-sm text-zinc-400">
                          {product.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold">
                          {formatNumber(product.stock)}
                        </p>
                        <p className="text-xs text-zinc-500">
                          minimo {formatNumber(product.minStock)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-4">
                      <MiniMetric
                        label="Costo prom."
                        value={formatCurrency(product.averageCost)}
                      />
                      <MiniMetric
                        label="Valor stock"
                        value={formatCurrency(product.stock * product.averageCost)}
                      />
                      <MiniMetric
                        label="Venta"
                        value={formatCurrency(product.salePrice)}
                      />
                      <MiniMetric label="Margen" value={`${margin}%`} />
                    </div>
                  </article>
                );
              })}
            </div>
          </Panel>

          <Panel title="Ultimos movimientos">
            <div className="space-y-3">
              {movements.map(([product, type, quantity, amount, time]) => (
                <article
                  key={`${product}-${time}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <ArrowDownUp
                          className={`h-4 w-4 ${
                            quantity >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        />
                        <p className="font-semibold">{product}</p>
                        <Pill>{type}</Pill>
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">{time}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xl font-semibold ${
                          quantity >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {quantity > 0 ? "+" : ""}
                        {formatNumber(quantity)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {formatCurrency(amount)}
                      </p>
                    </div>
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

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
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

function GhostInput({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

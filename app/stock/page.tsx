import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { NightStatus, type Prisma, type StockMovementType } from "@prisma/client";
import {
  AlertTriangle,
  ArrowDownUp,
  Boxes,
  ClipboardCheck,
  Landmark,
  Layers3,
  PackageSearch,
  Plus,
  Scale,
  TrendingDown,
} from "lucide-react";

import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { VenueSwitcher } from "@/components/venues/venue-switcher";
import { StockMovementForm } from "@/components/stock/stock-movement-form";
import { SessionStockControlForm } from "@/components/stock/session-stock-control-form";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { getActiveVenueId } from "@/lib/venues/active-venue";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { venue: true; category: true; stock: true };
}>;

type MovementWithRelations = Prisma.StockMovementGetPayload<{
  include: {
    product: { include: { category: true } };
    night: true;
    venue: true;
    createdBy: true;
  };
}>;

type ControlWithRelations = Prisma.SessionStockControlGetPayload<{
  include: {
    night: { include: { venue: true } };
    product: { include: { category: true; stock: true } };
  };
}>;

const movementLabels: Record<StockMovementType, string> = {
  PURCHASE: "Compra",
  SALE: "Venta",
  ADJUSTMENT: "Ajuste",
  WASTE: "Merma",
  INTERNAL_CONSUMPTION: "Consumo interno",
  INITIAL_STOCK: "Stock inicial",
  FINAL_STOCK: "Stock final",
};

export default async function StockPage() {
  const activeVenueId = await getActiveVenueId();

  const [venues, productsRaw, movementsRaw, nights, controlsRaw] =
    await Promise.all([
      prisma.venue.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.product.findMany({
        where: { venueId: activeVenueId ?? undefined },
        orderBy: { name: "asc" },
        include: { venue: true, category: true, stock: true },
      }),
      prisma.stockMovement.findMany({
        where: { venueId: activeVenueId ?? undefined },
        orderBy: { createdAt: "desc" },
        take: 40,
        include: {
          product: { include: { category: true } },
          night: true,
          venue: true,
          createdBy: true,
        },
      }),
      prisma.night.findMany({
        where: {
          venueId: activeVenueId ?? undefined,
          status: { in: [NightStatus.OPEN, NightStatus.CLOSED] },
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take: 30,
        select: { id: true, name: true, venue: { select: { name: true } } },
      }),
      prisma.sessionStockControl.findMany({
        where: { night: { venueId: activeVenueId ?? undefined } },
        orderBy: { updatedAt: "desc" },
        take: 24,
        include: {
          night: { include: { venue: true } },
          product: { include: { category: true, stock: true } },
        },
      }),
    ]);

  const products = productsRaw as ProductWithRelations[];
  const movements = movementsRaw as MovementWithRelations[];
  const controls = controlsRaw as ControlWithRelations[];

  const activeVenueName =
    venues.find((venue) => venue.id === activeVenueId)?.name ?? "Todas";
  const stockValue = products.reduce(
    (acc, product) => acc + getStockValue(product),
    0
  );
  const lowStockProducts = products.filter((product) => {
    const quantity = product.stock?.quantity ?? 0;
    const minStock = product.stock?.minStock ?? 0;
    return quantity <= minStock;
  });
  const zeroStockCount = products.filter(
    (product) => (product.stock?.quantity ?? 0) === 0
  ).length;
  const totalTheoretical = controls.reduce(
    (acc, control) => acc + control.theoreticalConsumption,
    0
  );
  const totalReal = controls.reduce(
    (acc, control) => acc + control.realConsumption,
    0
  );
  const totalDeviation = controls.reduce(
    (acc, control) => acc + control.deviation,
    0
  );
  const deviationValue = controls.reduce((acc, control) => {
    const averageCost =
      control.product.stock?.averageCost ?? control.product.cost ?? 0;
    return acc + control.deviation * averageCost;
  }, 0);

  const productOptions = products.map((product) => ({
    id: product.id,
    name: product.name,
    stock: product.stock?.quantity ?? 0,
    minStock: product.stock?.minStock ?? 0,
    averageCost: getAverageCost(product),
    unit: product.unit,
    venueName: product.venue.name,
  }));
  const nightOptions = nights.map((night) => ({
    id: night.id,
    name: night.name,
    venueName: night.venue.name,
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Stock
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Stock valorizado
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Cantidades, costo promedio, mermas y conteos por jornada.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <VenueSwitcher venues={venues} activeVenueId={activeVenueId} />
            <Link
              href="/products/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <MetricCard icon={Landmark} label="Sede" value={activeVenueName} />
          <MetricCard
            icon={Boxes}
            label="Stock valorizado"
            value={formatCurrency(stockValue)}
            tone="gold"
          />
          <MetricCard
            icon={PackageSearch}
            label="Productos"
            value={formatNumber(products.length)}
          />
          <MetricCard
            icon={AlertTriangle}
            label="Bajo minimo"
            value={formatNumber(lowStockProducts.length)}
            tone={lowStockProducts.length > 0 ? "red" : "green"}
          />
          <MetricCard
            icon={Scale}
            label="Desvio unidades"
            value={formatNumber(totalDeviation)}
            tone={totalDeviation === 0 ? "green" : "red"}
          />
          <MetricCard
            icon={TrendingDown}
            label="Desvio valorizado"
            value={formatCurrency(deviationValue)}
            tone={deviationValue === 0 ? "green" : "red"}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel title="Movimiento manual">
            <StockMovementForm products={productOptions} nights={nightOptions} />
          </Panel>

          <Panel title="Conteo por jornada">
            <SessionStockControlForm
              products={productOptions}
              nights={nightOptions}
            />
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel title="Inventario">
            <div className="space-y-3">
              {products.length === 0 ? (
                <EmptyState text="No hay productos cargados." />
              ) : (
                products.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))
              )}
            </div>
          </Panel>

          <Panel title="Alertas de stock">
            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <EmptyState text="Sin productos bajo minimo." />
              ) : (
                lowStockProducts.slice(0, 8).map((product) => {
                  const quantity = product.stock?.quantity ?? 0;
                  const minStock = product.stock?.minStock ?? 0;

                  return (
                    <article
                      key={product.id}
                      className="rounded-2xl border border-red-500/15 bg-red-500/10 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">
                            {product.name}
                          </p>
                          <p className="mt-1 text-sm text-red-200/80">
                            Actual {formatNumber(quantity)} / minimo{" "}
                            {formatNumber(minStock)}
                          </p>
                        </div>
                        <Pill tone={quantity === 0 ? "red" : "gold"}>
                          {quantity === 0 ? "Sin stock" : "Bajo"}
                        </Pill>
                      </div>
                    </article>
                  );
                })
              )}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <Layers3 className="h-5 w-5 text-[#D4AF37]" />
                  <div>
                    <p className="font-semibold text-white">
                      Productos sin stock: {formatNumber(zeroStockCount)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Base para compras y reposicion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel title="Ultimos movimientos">
            <div className="space-y-3">
              {movements.length === 0 ? (
                <EmptyState text="Todavia no hay movimientos." />
              ) : (
                movements.slice(0, 12).map((movement) => (
                  <MovementRow key={movement.id} movement={movement} />
                ))
              )}
            </div>
          </Panel>

          <Panel title="Consumo teorico vs real">
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <MiniMetric
                label="Teorico"
                value={formatNumber(totalTheoretical)}
              />
              <MiniMetric label="Real" value={formatNumber(totalReal)} />
              <MiniMetric
                label="Desvio"
                value={formatNumber(totalDeviation)}
                tone={totalDeviation === 0 ? "green" : "red"}
              />
            </div>

            <div className="space-y-3">
              {controls.length === 0 ? (
                <EmptyState text="Sin conteos guardados." />
              ) : (
                controls.slice(0, 10).map((control) => (
                  <ControlRow key={control.id} control={control} />
                ))
              )}
            </div>
          </Panel>
        </section>
      </div>
    </AppShell>
  );
}

function ProductRow({ product }: { product: ProductWithRelations }) {
  const quantity = product.stock?.quantity ?? 0;
  const minStock = product.stock?.minStock ?? 0;
  const averageCost = getAverageCost(product);
  const stockValue = getStockValue(product);
  const salePrice = product.salePrice ?? product.price;
  const grossMargin =
    salePrice > 0 ? ((salePrice - averageCost) / salePrice) * 100 : 0;
  const isLowStock = quantity <= minStock;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-white">{product.name}</p>
            {product.category ? <Pill>{product.category.name}</Pill> : null}
            <Pill tone={isLowStock ? "red" : "green"}>
              {isLowStock ? "Bajo" : "OK"}
            </Pill>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            {product.venue.name} - {product.unit}
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-semibold text-white">
            {formatNumber(quantity)}
          </p>
          <p className="text-xs text-zinc-500">
            minimo {formatNumber(minStock)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <MiniMetric label="Costo prom." value={formatCurrency(averageCost)} />
        <MiniMetric label="Valor stock" value={formatCurrency(stockValue)} />
        <MiniMetric label="Venta" value={formatCurrency(salePrice)} />
        <MiniMetric
          label="Margen"
          value={`${formatNumber(Math.round(grossMargin))}%`}
          tone={grossMargin > 35 ? "green" : "gold"}
        />
      </div>
    </article>
  );
}

function MovementRow({ movement }: { movement: MovementWithRelations }) {
  const amount =
    (movement.unitCost ?? movement.product.cost ?? 0) * movement.quantity;
  const isPositive = movement.quantity >= 0;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <ArrowDownUp
              className={`h-4 w-4 ${
                isPositive ? "text-emerald-400" : "text-red-400"
              }`}
            />
            <p className="font-semibold text-white">
              {movement.product.name}
            </p>
            <Pill>{movementLabels[movement.type]}</Pill>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            {movement.night?.name ?? movement.venue?.name ?? "Sin jornada"} -{" "}
            {new Date(movement.createdAt).toLocaleString("es-AR")}
          </p>
          {movement.note ? (
            <p className="mt-2 text-sm text-zinc-500">{movement.note}</p>
          ) : null}
        </div>

        <div className="text-right">
          <p
            className={`text-xl font-semibold ${
              isPositive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {formatNumber(movement.quantity)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {formatCurrency(amount)}
          </p>
        </div>
      </div>
    </article>
  );
}

function ControlRow({ control }: { control: ControlWithRelations }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-[#D4AF37]" />
            <p className="font-semibold text-white">{control.product.name}</p>
            <Pill>{control.night.name}</Pill>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            {control.night.venue.name} -{" "}
            {new Date(control.updatedAt).toLocaleString("es-AR")}
          </p>
        </div>

        <Pill tone={control.deviation === 0 ? "green" : "red"}>
          Desvio {formatNumber(control.deviation)}
        </Pill>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <MiniMetric
          label="Inicial"
          value={formatNumber(control.initialQuantity)}
        />
        <MiniMetric label="Final" value={formatNumber(control.finalQuantity)} />
        <MiniMetric
          label="Teorico"
          value={formatNumber(control.theoreticalConsumption)}
        />
        <MiniMetric
          label="Real"
          value={formatNumber(control.realConsumption)}
          tone={control.deviation === 0 ? "green" : "gold"}
        />
      </div>
    </article>
  );
}

function MetricCard({
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

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MiniMetric({
  label,
  value,
  tone = "zinc",
}: {
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
          : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-1 font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function Pill({
  children,
  tone = "zinc",
}: {
  children: ReactNode;
  tone?: "gold" | "green" | "red" | "zinc";
}) {
  const className =
    tone === "gold"
      ? "bg-[#D4AF37]/15 text-[#D4AF37]"
      : tone === "green"
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-zinc-400">
      {text}
    </div>
  );
}

function getAverageCost(product: ProductWithRelations) {
  return product.stock?.averageCost ?? product.cost ?? 0;
}

function getStockValue(product: ProductWithRelations) {
  const quantity = product.stock?.quantity ?? 0;
  return product.stock?.stockValue ?? quantity * getAverageCost(product);
}

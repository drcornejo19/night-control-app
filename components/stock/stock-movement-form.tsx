"use client";

import { type FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { createStockMovement } from "@/actions/stock/create-stock-movement";
import { formatCurrency, formatNumber } from "@/lib/utils";

type ProductOption = {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  averageCost: number;
  unit: string;
  venueName?: string;
};

type NightOption = {
  id: string;
  name: string;
  venueName?: string;
};

type MovementTypeValue = "ADJUSTMENT" | "WASTE" | "INTERNAL_CONSUMPTION";

type Props = {
  products: ProductOption[];
  nights: NightOption[];
};

const movementTypes = [
  { value: "ADJUSTMENT", label: "Ajuste" },
  { value: "WASTE", label: "Merma" },
  { value: "INTERNAL_CONSUMPTION", label: "Consumo interno" },
] as const;

const controlClass =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none";

export function StockMovementForm({ products, nights }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [nightId, setNightId] = useState("");
  const [type, setType] = useState<MovementTypeValue>("ADJUSTMENT");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId),
    [productId, products]
  );

  const numericQuantity = Number(quantity) || 0;
  const delta =
    type === "ADJUSTMENT" ? numericQuantity : -Math.abs(numericQuantity);
  const nextStock = (selectedProduct?.stock ?? 0) + delta;
  const effectiveCost = Number(unitCost) || selectedProduct?.averageCost || 0;
  const valueImpact = delta * effectiveCost;
  const canSubmit =
    Boolean(productId) && numericQuantity !== 0 && nextStock >= 0 && !isPending;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await createStockMovement({
        productId,
        nightId: nightId || undefined,
        type,
        quantity,
        unitCost: unitCost || undefined,
        note: note || undefined,
      });

      setMessage(result.message);

      if (result.ok) {
        setQuantity("");
        setUnitCost("");
        setNote("");
        router.refresh();
      }
    });
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
        No hay productos para mover stock.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-medium text-white">
            Producto
          </span>
          <select
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            className={controlClass}
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {formatNumber(product.stock)} {product.unit}
                {product.venueName ? ` - ${product.venueName}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-white">
            Jornada
          </span>
          <select
            value={nightId}
            onChange={(event) => setNightId(event.target.value)}
            className={controlClass}
          >
            <option value="">Sin jornada</option>
            {nights.map((night) => (
              <option key={night.id} value={night.id}>
                {night.name}
                {night.venueName ? ` - ${night.venueName}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-white">
            Tipo
          </span>
          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as MovementTypeValue)
            }
            className={controlClass}
          >
            {movementTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-white">
            Cantidad
          </span>
          <input
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className={controlClass}
            placeholder={type === "ADJUSTMENT" ? "Ej: 12 o -4" : "Ej: 4"}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-white">
            Costo unitario
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={unitCost}
            onChange={(event) => setUnitCost(event.target.value)}
            className={controlClass}
            placeholder={formatCurrency(selectedProduct?.averageCost ?? 0)}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-white">
            Nota
          </span>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className={controlClass}
            placeholder="Ej: rotura, conteo manual, reposicion"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <PreviewMetric
          label="Actual"
          value={formatNumber(selectedProduct?.stock ?? 0)}
        />
        <PreviewMetric
          label="Nuevo stock"
          value={formatNumber(Math.max(nextStock, 0))}
          tone={nextStock < 0 ? "red" : "gold"}
        />
        <PreviewMetric
          label="Impacto valor"
          value={formatCurrency(valueImpact)}
          tone={valueImpact < 0 ? "red" : "green"}
        />
      </div>

      {message ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {isPending ? "Guardando..." : "Registrar movimiento"}
      </button>
    </form>
  );
}

function PreviewMetric({
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
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${color}`}>{value}</p>
    </div>
  );
}

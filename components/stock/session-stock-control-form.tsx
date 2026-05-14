"use client";

import { type FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck } from "lucide-react";

import { saveSessionStockControl } from "@/actions/stock/save-session-stock-control";
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

type Props = {
  products: ProductOption[];
  nights: NightOption[];
};

const controlClass =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none";

export function SessionStockControlForm({ products, nights }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [nightId, setNightId] = useState(nights[0]?.id ?? "");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const initialProduct = products[0];
  const [initialQuantity, setInitialQuantity] = useState(
    initialProduct ? String(initialProduct.stock) : "0"
  );
  const [finalQuantity, setFinalQuantity] = useState(
    initialProduct ? String(initialProduct.stock) : "0"
  );
  const [message, setMessage] = useState("");

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId),
    [productId, products]
  );
  const realConsumption =
    (Number(initialQuantity) || 0) - (Number(finalQuantity) || 0);
  const endingValue =
    (Number(finalQuantity) || 0) * (selectedProduct?.averageCost ?? 0);
  const canSubmit = Boolean(nightId && productId) && !isPending;

  function changeProduct(nextProductId: string) {
    const product = products.find((item) => item.id === nextProductId);
    setProductId(nextProductId);

    if (product) {
      setInitialQuantity(String(product.stock));
      setFinalQuantity(String(product.stock));
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await saveSessionStockControl({
        nightId,
        productId,
        initialQuantity,
        finalQuantity,
      });

      setMessage(result.message);

      if (result.ok) {
        router.refresh();
      }
    });
  }

  if (nights.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
        No hay jornadas para controlar stock.
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
        No hay productos para controlar stock.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-medium text-white">
            Jornada
          </span>
          <select
            value={nightId}
            onChange={(event) => setNightId(event.target.value)}
            className={controlClass}
          >
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
            Producto
          </span>
          <select
            value={productId}
            onChange={(event) => changeProduct(event.target.value)}
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
            Stock inicial
          </span>
          <input
            type="number"
            min="0"
            value={initialQuantity}
            onChange={(event) => setInitialQuantity(event.target.value)}
            className={controlClass}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-white">
            Stock final
          </span>
          <input
            type="number"
            min="0"
            value={finalQuantity}
            onChange={(event) => setFinalQuantity(event.target.value)}
            className={controlClass}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <PreviewMetric
          label="Consumo real"
          value={formatNumber(realConsumption)}
          tone={realConsumption < 0 ? "red" : "gold"}
        />
        <PreviewMetric
          label="Costo promedio"
          value={formatCurrency(selectedProduct?.averageCost ?? 0)}
        />
        <PreviewMetric
          label="Stock final valorizado"
          value={formatCurrency(endingValue)}
          tone="green"
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
      >
        <ClipboardCheck className="h-4 w-4" />
        {isPending ? "Guardando..." : "Guardar conteo"}
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

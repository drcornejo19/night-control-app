"use client";

import {
  type FormEvent,
  type ReactNode,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { createSale } from "@/actions/sales/create-sale";
import { formatCurrency } from "@/lib/utils";

type ProductOption = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

type NightOption = {
  id: string;
  name: string;
  venueName?: string;
};

type Props = {
  nights: NightOption[];
  products: ProductOption[];
};

type Row = {
  productId: string;
  quantity: number;
};

type PaymentMethodValue = "CASH" | "TRANSFER" | "CARD" | "QR" | "OTHER";
type SaleTypeValue = "BAR" | "TICKET" | "VIP" | "TABLE" | "DELIVERY" | "OTHER";

const saleTypes = [
  { value: "BAR", label: "Barra" },
  { value: "TICKET", label: "Entrada" },
  { value: "VIP", label: "VIP" },
  { value: "TABLE", label: "Mesa" },
  { value: "DELIVERY", label: "Delivery" },
  { value: "OTHER", label: "Otro" },
] as const;

const paymentMethods = [
  { value: "CASH", label: "Efectivo" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "CARD", label: "Tarjeta" },
  { value: "QR", label: "QR" },
  { value: "OTHER", label: "Otro" },
] as const;

const controlClass =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none";

export function NewSaleForm({ nights, products }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [nightId, setNightId] = useState(nights[0]?.id ?? "");
  const [saleType, setSaleType] = useState<SaleTypeValue>("BAR");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodValue>("CASH");
  const [discount, setDiscount] = useState("");
  const [rows, setRows] = useState<Row[]>([
    { productId: products[0]?.id ?? "", quantity: 1 },
  ]);
  const [message, setMessage] = useState<string>("");

  const subtotal = useMemo(() => {
    return rows.reduce((acc, row) => {
      const product = products.find((item) => item.id === row.productId);
      if (!product) return acc;
      return acc + product.price * row.quantity;
    }, 0);
  }, [rows, products]);

  const numericDiscount = Math.min(Number(discount) || 0, subtotal);
  const total = Math.max(0, subtotal - numericDiscount);
  const canSubmit = Boolean(nightId && products.length > 0 && rows.length > 0);

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) =>
      prev.map((row, itemIndex) =>
        itemIndex === index ? { ...row, ...patch } : row
      )
    );
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { productId: products[0]?.id ?? "", quantity: 1 },
    ]);
  }

  function removeRow(index: number) {
    setRows((prev) => {
      const next = prev.filter((_, itemIndex) => itemIndex !== index);
      return next.length > 0 ? next : prev;
    });
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await createSale({
        nightId,
        saleType,
        paymentMethod,
        discount,
        items: rows,
      });

      setMessage(result.message);

      if (result.ok) {
        router.push("/sales");
        router.refresh();
      }
    });
  }

  if (nights.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-400">
        No hay jornadas abiertas para registrar ventas. Abri una jornada antes
        de vender.
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-400">
        No hay productos activos con stock para vender.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2">
        <Field label="Jornada">
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
        </Field>

        <Field label="Canal">
          <select
            value={saleType}
            onChange={(event) => setSaleType(event.target.value as SaleTypeValue)}
            className={controlClass}
          >
            {saleTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Medio de pago">
          <select
            value={paymentMethod}
            onChange={(event) =>
              setPaymentMethod(event.target.value as PaymentMethodValue)
            }
            className={controlClass}
          >
            {paymentMethods.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Descuento">
          <input
            type="number"
            min="0"
            step="0.01"
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
            placeholder="0"
            className={controlClass}
          />
        </Field>
      </section>

      <section className="space-y-4">
        {rows.map((row, index) => {
          const selected = products.find((item) => item.id === row.productId);
          const lineTotal = selected ? selected.price * row.quantity : 0;

          return (
            <div
              key={`${row.productId}-${index}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="grid gap-4 md:grid-cols-[1fr_120px_44px]">
                <Field label="Producto">
                  <select
                    value={row.productId}
                    onChange={(event) =>
                      updateRow(index, { productId: event.target.value })
                    }
                    className={controlClass}
                  >
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - Stock {product.stock} -{" "}
                        {formatCurrency(product.price)}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Cantidad">
                  <input
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(event) =>
                      updateRow(index, {
                        quantity: Number(event.target.value) || 1,
                      })
                    }
                    className={controlClass}
                  />
                </Field>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300 transition hover:bg-red-500/15"
                    aria-label="Quitar producto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mt-3 text-sm text-zinc-400">
                Subtotal linea: {formatCurrency(lineTotal)}
              </p>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white transition hover:bg-black/40"
          >
            <Plus className="h-4 w-4" />
            Agregar producto
          </button>

          <div className="grid gap-2 text-right sm:grid-cols-3 sm:text-left">
            <MiniTotal label="Subtotal" value={formatCurrency(subtotal)} />
            <MiniTotal label="Descuento" value={formatCurrency(numericDiscount)} />
            <MiniTotal label="Total" value={formatCurrency(total)} strong />
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending || !canSubmit}
        className="w-full rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
      >
        {isPending ? "Registrando..." : "Registrar venta"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white">{label}</span>
      {children}
    </label>
  );
}

function MiniTotal({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-zinc-400">{label}</p>
      <p
        className={`mt-1 font-semibold ${
          strong ? "text-xl text-white" : "text-zinc-200"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

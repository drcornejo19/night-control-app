"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSale } from "@/actions/sales/create-sale";

type ProductOption = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

type NightOption = {
  id: string;
  name: string;
};

type Props = {
  nights: NightOption[];
  products: ProductOption[];
};

type Row = {
  productId: string;
  quantity: number;
};

export function NewSaleForm({ nights, products }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [nightId, setNightId] = useState(nights[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER" | "CARD" | "OTHER">("CASH");
  const [rows, setRows] = useState<Row[]>([{ productId: products[0]?.id ?? "", quantity: 1 }]);
  const [message, setMessage] = useState<string>("");

  const total = useMemo(() => {
    return rows.reduce((acc, row) => {
      const product = products.find((p) => p.id === row.productId);
      if (!product) return acc;
      return acc + product.price * row.quantity;
    }, 0);
  }, [rows, products]);

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  function addRow() {
    setRows((prev) => [...prev, { productId: products[0]?.id ?? "", quantity: 1 }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await createSale({
        nightId,
        paymentMethod,
        items: rows,
      });

      setMessage(result.message);

      if (result.ok) {
        router.push("/sales");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="mb-2 block text-sm font-medium text-white">Noche</label>
          <select
            value={nightId}
            onChange={(e) => setNightId(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
          >
            {nights.map((night) => (
              <option key={night.id} value={night.id}>
                {night.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="mb-2 block text-sm font-medium text-white">Método de pago</label>
          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as "CASH" | "TRANSFER" | "CARD" | "OTHER")
            }
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
          >
            <option value="CASH">Efectivo</option>
            <option value="TRANSFER">Transferencia</option>
            <option value="CARD">Tarjeta</option>
            <option value="OTHER">Otro</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {rows.map((row, index) => {
          const selected = products.find((p) => p.id === row.productId);

          return (
            <div
              key={index}
              className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_140px_100px]"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Producto</label>
                <select
                  value={row.productId}
                  onChange={(e) => updateRow(index, { productId: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — Stock: {product.stock} — ${product.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={row.quantity}
                  onChange={(e) =>
                    updateRow(index, { quantity: Number(e.target.value) || 1 })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400"
                >
                  Quitar
                </button>
              </div>

              <div className="md:col-span-3">
                <p className="text-sm text-zinc-400">
                  {selected ? `Subtotal estimado: $${selected.price * row.quantity}` : "Sin producto"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-4">
        <button
          type="button"
          onClick={addRow}
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm font-medium text-white"
        >
          Agregar producto
        </button>

        <div className="text-right">
          <p className="text-sm text-zinc-300">Total estimado</p>
          <p className="text-2xl font-semibold text-white">${total}</p>
        </div>
      </div>

      {message ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
      >
        {isPending ? "Registrando..." : "Registrar venta"}
      </button>
    </form>
  );
}
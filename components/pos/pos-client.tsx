"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";

import { createSale } from "@/actions/sales/create-sale";
import { formatCurrency } from "@/lib/utils";

type PosProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

type NightOption = {
  id: string;
  name: string;
};

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
};

type PosClientProps = {
  products: PosProduct[];
  nights: NightOption[];
};

export function PosClient({ products, nights }: PosClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [nightId, setNightId] = useState(nights[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "TRANSFER" | "CARD" | "OTHER"
  >("CASH");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");

  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  function addToCart(product: PosProduct) {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);

      if (existing) {
        if (existing.quantity >= product.stock) {
          return prev;
        }

        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      if (product.stock <= 0) {
        return prev;
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          stock: product.stock,
        },
      ];
    });
  }

  function increase(productId: string) {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        if (item.quantity >= item.stock) return item;

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  }

  function decrease(productId: string) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  function handleCheckout() {
    setMessage("");

    if (!nightId) {
      setMessage("Seleccioná una noche.");
      return;
    }

    if (cart.length === 0) {
      setMessage("Agregá al menos un producto.");
      return;
    }

    startTransition(async () => {
      const result = await createSale({
        nightId,
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      setMessage(result.message);

      if (result.ok) {
        setCart([]);
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
      <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5 md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-white">
              Productos
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Tocá un producto para agregarlo al carrito.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <select
              value={nightId}
              onChange={(e) => setNightId(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
            >
              {nights.map((night) => (
                <option key={night.id} value={night.id}>
                  {night.name}
                </option>
              ))}
            </select>

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value as "CASH" | "TRANSFER" | "CARD" | "OTHER"
                )
              }
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="CASH">Efectivo</option>
              <option value="TRANSFER">Transferencia</option>
              <option value="CARD">Tarjeta</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-left transition hover:border-[#D4AF37]/30 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <p className="text-lg font-semibold text-white">{product.name}</p>
              <p className="mt-2 text-sm text-zinc-400">
                Stock: {product.stock}
              </p>
              <p className="mt-4 text-2xl font-semibold text-[#D4AF37]">
                {formatCurrency(product.price)}
              </p>
            </button>
          ))}
        </div>
      </section>

      <aside className="rounded-[30px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5 md:p-6">
        <div className="mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-white">
            Carrito
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Revisá la venta antes de cobrar.
          </p>
        </div>

        <div className="space-y-3">
          {cart.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-zinc-400">
              No hay productos agregados.
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {formatCurrency(item.price)} c/u
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => decrease(item.productId)}
                      className="rounded-xl border border-white/10 bg-black/20 p-2 text-white"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="min-w-8 text-center text-sm font-semibold text-white">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => increase(item.productId)}
                      className="rounded-xl border border-white/10 bg-black/20 p-2 text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-lg font-semibold text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 space-y-4 rounded-[24px] border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">Total</span>
            <span className="text-2xl font-semibold text-white">
              {formatCurrency(total)}
            </span>
          </div>

          {message ? (
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200">
              {message}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={isPending || cart.length === 0}
            className="w-full rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
          >
            {isPending ? "Procesando..." : "Cobrar"}
          </button>
        </div>
      </aside>
    </div>
  );
}
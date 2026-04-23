"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createExpense } from "@/actions/expenses/create-expenses";

type NightOption = {
  id: string;
  name: string;
};

type Props = {
  nights: NightOption[];
};

export function NewExpenseForm({ nights }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [nightId, setNightId] = useState(nights[0]?.id ?? "");
  const [category, setCategory] = useState<
    "STAFF" | "DJ" | "SUPPLIER" | "SERVICES" | "OTHER"
  >("OTHER");
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "TRANSFER" | "CARD" | "OTHER"
  >("CASH");
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await createExpense({
        nightId,
        category,
        amount,
        note,
        paymentMethod,
      });

      setMessage(result.message);

      if (result.ok) {
        router.push("/expenses");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="mb-2 block text-sm font-medium text-white">
            Noche
          </label>
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
          <label className="mb-2 block text-sm font-medium text-white">
            Categoría
          </label>
          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value as
                  | "STAFF"
                  | "DJ"
                  | "SUPPLIER"
                  | "SERVICES"
                  | "OTHER"
              )
            }
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
          >
            <option value="STAFF">Personal</option>
            <option value="DJ">DJ</option>
            <option value="SUPPLIER">Proveedor</option>
            <option value="SERVICES">Servicios</option>
            <option value="OTHER">Otro</option>
          </select>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="mb-2 block text-sm font-medium text-white">
            Medio de pago
          </label>
          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value as "CASH" | "TRANSFER" | "CARD" | "OTHER"
              )
            }
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
          >
            <option value="CASH">Efectivo</option>
            <option value="TRANSFER">Transferencia</option>
            <option value="CARD">Tarjeta</option>
            <option value="OTHER">Otro</option>
          </select>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="mb-2 block text-sm font-medium text-white">
            Monto
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <label className="mb-2 block text-sm font-medium text-white">
          Observación
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
          placeholder="Detalle del gasto"
        />
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
        {isPending ? "Registrando..." : "Registrar gasto"}
      </button>
    </form>
  );
}
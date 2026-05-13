"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createCashMovement } from "@/actions/cash/create-cash-movement";

const movementOptions = [
  { value: "INCOME", label: "Ingreso" },
  { value: "EXPENSE", label: "Egreso" },
  { value: "ADJUSTMENT", label: "Ajuste" },
] as const;

const paymentMethods = [
  { value: "CASH", label: "Efectivo" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "CARD", label: "Tarjeta" },
  { value: "QR", label: "QR" },
  { value: "OTHER", label: "Otro" },
] as const;

type CashMovementFormProps = {
  cashBoxId: string;
};

export function CashMovementForm({ cashBoxId }: CashMovementFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState<(typeof movementOptions)[number]["value"]>(
    "INCOME"
  );
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<(typeof paymentMethods)[number]["value"]>(
    "CASH"
  );
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await createCashMovement({
        cashBoxId,
        type,
        category,
        amount,
        method,
        note: note || undefined,
      });

      setMessage(result.message);

      if (result.ok) {
        setCategory("");
        setAmount("");
        setNote("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">
            Tipo
          </span>
          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as typeof type)
            }
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
          >
            {movementOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">
            Medio de pago
          </span>
          <select
            value={method}
            onChange={(event) =>
              setMethod(event.target.value as typeof method)
            }
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
          >
            {paymentMethods.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">
            Categoria
          </span>
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Ej: Reposicion urgente"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">
            Monto
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Ej: 150000"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Nota
        </span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder="Detalle breve del movimiento"
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
        />
      </label>

      {message ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending || !category || !amount}
        className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
      >
        {isPending ? "Registrando..." : "Registrar movimiento"}
      </button>
    </form>
  );
}

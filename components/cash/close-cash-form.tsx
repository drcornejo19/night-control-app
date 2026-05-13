"use client";

import { type FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { closeCash } from "@/actions/cash/close-cash";
import { formatCurrency } from "@/lib/utils";

type CloseCashFormProps = {
  cashBoxId: string;
  expected: number;
};

export function CloseCashForm({ cashBoxId, expected }: CloseCashFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [closing, setClosing] = useState("");
  const [message, setMessage] = useState("");

  const difference = useMemo(() => {
    const parsedClosing = Number(closing);
    if (!closing || Number.isNaN(parsedClosing)) return null;
    return parsedClosing - expected;
  }, [closing, expected]);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await closeCash({
        cashBoxId,
        closing,
      });

      setMessage(result.message);

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-zinc-400">Esperado calculado</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {formatCurrency(expected)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-zinc-400">Diferencia previa</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {difference === null ? "-" : formatCurrency(difference)}
          </p>
        </div>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Total declarado al cierre
        </span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={closing}
          onChange={(event) => setClosing(event.target.value)}
          placeholder="Ej: 4350000"
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
        disabled={isPending || !closing}
        className="w-full rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
      >
        {isPending ? "Cerrando..." : "Cerrar caja"}
      </button>
    </form>
  );
}

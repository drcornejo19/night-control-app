"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { openCash } from "@/actions/cash/open-cash";

type NightOption = {
  id: string;
  name: string;
  venueName: string;
  status: string;
  date: string;
};

type OpenCashFormProps = {
  nights: NightOption[];
};

export function OpenCashForm({ nights }: OpenCashFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [nightId, setNightId] = useState(nights[0]?.id ?? "");
  const [opening, setOpening] = useState("");
  const [message, setMessage] = useState("");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await openCash({
        nightId,
        opening,
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
        No hay jornadas abiertas o planificadas sin caja. Crea una jornada para
        abrir caja.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Jornada
        </span>
        <select
          value={nightId}
          onChange={(event) => setNightId(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
        >
          {nights.map((night) => (
            <option key={night.id} value={night.id} className="bg-[#111111]">
              {night.name} - {night.venueName} - {night.status}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Monto inicial
        </span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={opening}
          onChange={(event) => setOpening(event.target.value)}
          placeholder="Ej: 50000"
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
        disabled={isPending || !nightId}
        className="w-full rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
      >
        {isPending ? "Abriendo..." : "Abrir caja"}
      </button>
    </form>
  );
}

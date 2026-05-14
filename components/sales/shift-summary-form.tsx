"use client";

import { type FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createShiftSummary } from "@/actions/sales/create-shift-summary";
import { formatCurrency } from "@/lib/utils";

type NightOption = {
  id: string;
  name: string;
  venueName?: string;
};

type ShiftSummaryFormProps = {
  nights: NightOption[];
};

const controlClass =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none";

export function ShiftSummaryForm({ nights }: ShiftSummaryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [nightId, setNightId] = useState(nights[0]?.id ?? "");
  const [sector, setSector] = useState("Barra principal");
  const [cashSales, setCashSales] = useState("");
  const [transferSales, setTransferSales] = useState("");
  const [cardSales, setCardSales] = useState("");
  const [qrSales, setQrSales] = useState("");
  const [observations, setObservations] = useState("");
  const [message, setMessage] = useState("");

  const total = useMemo(
    () =>
      [cashSales, transferSales, cardSales, qrSales].reduce(
        (acc, value) => acc + (Number(value) || 0),
        0
      ),
    [cashSales, transferSales, cardSales, qrSales]
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await createShiftSummary({
        nightId,
        sector,
        cashSales,
        transferSales,
        cardSales,
        qrSales,
        observations: observations || undefined,
      });

      setMessage(result.message);

      if (result.ok) {
        setCashSales("");
        setTransferSales("");
        setCardSales("");
        setQrSales("");
        setObservations("");
        router.refresh();
      }
    });
  }

  if (nights.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
        No hay jornadas abiertas para cargar un cierre resumido.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
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
            Sector
          </span>
          <input
            value={sector}
            onChange={(event) => setSector(event.target.value)}
            className={controlClass}
            placeholder="Ej: Barra patio"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MoneyInput label="Efectivo" value={cashSales} onChange={setCashSales} />
        <MoneyInput
          label="Transferencia"
          value={transferSales}
          onChange={setTransferSales}
        />
        <MoneyInput label="Tarjeta" value={cardSales} onChange={setCardSales} />
        <MoneyInput label="QR" value={qrSales} onChange={setQrSales} />
      </div>

      <label>
        <span className="mb-2 block text-sm font-medium text-white">
          Observaciones
        </span>
        <textarea
          value={observations}
          onChange={(event) => setObservations(event.target.value)}
          rows={3}
          className={controlClass}
          placeholder="Detalle del cierre, responsable, notas de caja"
        />
      </label>

      <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-4">
        <p className="text-sm text-zinc-300">Total del resumen</p>
        <p className="mt-1 text-2xl font-semibold text-white">
          {formatCurrency(total)}
        </p>
      </div>

      {message ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending || !nightId || !sector || total <= 0}
        className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
      >
        {isPending ? "Registrando..." : "Guardar resumen"}
      </button>
    </form>
  );
}

function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-white">{label}</span>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={controlClass}
        placeholder="0"
      />
    </label>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createNight } from "@/actions/nights/create-night";

type VenueOption = {
  id: string;
  name: string;
};

type UserOption = {
  id: string;
  name: string;
  email: string;
};

type NewNightFormProps = {
  venues: VenueOption[];
  users: UserOption[];
  activeVenueId?: string | null;
};

export function NewNightForm({
  venues,
  users,
  activeVenueId,
}: NewNightFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialVenueId = activeVenueId ?? venues[0]?.id ?? "";

  const [venueId, setVenueId] = useState(initialVenueId);
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [openedAt, setOpenedAt] = useState("");
  const [openNow, setOpenNow] = useState(true);
  const [responsibleUserId, setResponsibleUserId] = useState("");
  const [observations, setObservations] = useState("");
  const [message, setMessage] = useState("");

  const selectedVenue = useMemo(
    () => venues.find((venue) => venue.id === venueId),
    [venues, venueId]
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await createNight({
        venueId,
        name,
        date,
        responsibleUserId: responsibleUserId || undefined,
        openedAt: openedAt || undefined,
        openNow,
        observations: observations || undefined,
      });

      setMessage(result.message);

      if (result.ok) {
        router.push("/nights");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="mb-2 block text-sm font-medium text-white">
            Sede
          </span>
          <select
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
          >
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </select>
        </label>

        <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="mb-2 block text-sm font-medium text-white">
            Nombre de la jornada
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Viernes principal, turno noche"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
          />
        </label>

        <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="mb-2 block text-sm font-medium text-white">
            Fecha operativa
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
          />
        </label>

        <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="mb-2 block text-sm font-medium text-white">
            Responsable
          </span>
          <select
            value={responsibleUserId}
            onChange={(e) => setResponsibleUserId(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
          >
            <option value="">Asignar automaticamente</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.email}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
        <label className="flex items-center justify-between gap-4 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-4">
          <span>
            <span className="block text-sm font-medium text-white">
              Abrir al crear
            </span>
            <span className="mt-1 block text-xs text-zinc-400">
              Si queda apagado, la jornada queda planificada.
            </span>
          </span>
          <input
            type="checkbox"
            checked={openNow}
            onChange={(e) => setOpenNow(e.target.checked)}
            className="h-5 w-5 accent-[#D4AF37]"
          />
        </label>

        <label className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="mb-2 block text-sm font-medium text-white">
            Hora de apertura
          </span>
          <input
            type="datetime-local"
            value={openedAt}
            disabled={!openNow}
            onChange={(e) => setOpenedAt(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none disabled:opacity-40"
          />
        </label>
      </div>

      <label className="block rounded-2xl border border-white/10 bg-white/5 p-4">
        <span className="mb-2 block text-sm font-medium text-white">
          Observaciones
        </span>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          rows={4}
          placeholder="Costos esperados, evento, aclaraciones del turno..."
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
        />
      </label>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-300">
        <span className="text-zinc-500">Se va a crear en:</span>{" "}
        <span className="font-medium text-white">
          {selectedVenue?.name ?? "Sin sede"}
        </span>{" "}
        <span className="text-zinc-500">con estado</span>{" "}
        <span className="font-medium text-[#D4AF37]">
          {openNow ? "abierta" : "planificada"}
        </span>
      </div>

      {message ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending || !venueId}
        className="w-full rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
      >
        {isPending ? "Creando..." : "Crear jornada"}
      </button>
    </form>
  );
}

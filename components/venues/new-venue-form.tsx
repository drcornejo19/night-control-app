"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createVenue } from "@/actions/venues/create-venue";

export function NewVenueForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    startTransition(async () => {
      const res = await createVenue({ name, city });

      setMessage(res.message);
      if (res.ok) {
        router.push("/venues");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="mb-2 block text-sm font-medium text-white">
            Nombre del boliche
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Night Club A"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="mb-2 block text-sm font-medium text-white">
            Ciudad (opcional)
          </label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ej: Buenos Aires"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
          />
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
        {isPending ? "Creando..." : "Crear boliche"}
      </button>
    </form>
  );
}
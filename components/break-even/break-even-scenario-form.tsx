"use client";

import {
  type FormEvent,
  type ReactNode,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { createBreakEvenScenario } from "@/actions/break-even/create-break-even-scenario";
import { calculateBreakEven } from "@/lib/finance/break-even";
import { formatCurrency, formatNumber } from "@/lib/utils";

type VenueOption = {
  id: string;
  name: string;
};

type NightOption = {
  id: string;
  name: string;
  venueId: string;
};

type Props = {
  venues: VenueOption[];
  nights: NightOption[];
  activeVenueId: string | null;
  defaults: {
    fixedCosts: number;
    variableCosts: number;
    averageTicket: number;
    attendees: number;
  };
};

const controlClass =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none";

export function BreakEvenScenarioForm({
  venues,
  nights,
  activeVenueId,
  defaults,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [venueId, setVenueId] = useState(activeVenueId ?? venues[0]?.id ?? "");
  const [nightId, setNightId] = useState("");
  const [name, setName] = useState("Escenario base");
  const [fixedCosts, setFixedCosts] = useState(
    Math.round(defaults.fixedCosts).toString()
  );
  const [variableCosts, setVariableCosts] = useState(
    Math.round(defaults.variableCosts).toString()
  );
  const [averageTicket, setAverageTicket] = useState(
    Math.round(defaults.averageTicket || 0).toString()
  );
  const [attendees, setAttendees] = useState(
    Math.max(1, defaults.attendees || 100).toString()
  );
  const [message, setMessage] = useState("");

  const filteredNights = useMemo(
    () => nights.filter((night) => night.venueId === venueId),
    [nights, venueId]
  );
  const preview = calculateBreakEven({
    revenue: (Number(averageTicket) || 0) * (Number(attendees) || 0),
    fixedCosts: Number(fixedCosts) || 0,
    variableCosts: Number(variableCosts) || 0,
    averageTicket: Number(averageTicket) || 0,
    attendees: Number(attendees) || 0,
  });

  function changeVenue(nextVenueId: string) {
    setVenueId(nextVenueId);
    setNightId("");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await createBreakEvenScenario({
        venueId,
        nightId: nightId || undefined,
        name,
        fixedCosts,
        variableCosts,
        expectedAverageTicket: averageTicket,
        expectedAttendees: attendees,
      });

      setMessage(result.message);

      if (result.ok) {
        router.refresh();
      }
    });
  }

  if (venues.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
        No hay sedes para crear escenarios.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Sede">
          <select
            value={venueId}
            onChange={(event) => changeVenue(event.target.value)}
            className={controlClass}
          >
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Jornada">
          <select
            value={nightId}
            onChange={(event) => setNightId(event.target.value)}
            className={controlClass}
          >
            <option value="">General</option>
            {filteredNights.map((night) => (
              <option key={night.id} value={night.id}>
                {night.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Nombre">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={controlClass}
          placeholder="Ej: Viernes con 350 personas"
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Costos fijos">
          <NumberInput value={fixedCosts} onChange={setFixedCosts} />
        </Field>
        <Field label="Costos variables">
          <NumberInput value={variableCosts} onChange={setVariableCosts} />
        </Field>
        <Field label="Ticket promedio esperado">
          <NumberInput value={averageTicket} onChange={setAverageTicket} />
        </Field>
        <Field label="Clientes esperados">
          <NumberInput value={attendees} onChange={setAttendees} />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <PreviewItem
          label="Ingresos esperados"
          value={formatCurrency(preview.revenue)}
        />
        <PreviewItem
          label="Punto equilibrio"
          value={formatCurrency(preview.breakEvenRevenue)}
        />
        <PreviewItem
          label="Clientes equilibrio"
          value={formatNumber(preview.breakEvenAttendees)}
        />
      </div>

      {message ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={
          isPending ||
          !venueId ||
          !name ||
          preview.averageTicket <= 0 ||
          preview.attendees <= 0
        }
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {isPending ? "Guardando..." : "Guardar escenario"}
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

function NumberInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="number"
      min="0"
      step="1"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={controlClass}
      placeholder="0"
    />
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-3">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

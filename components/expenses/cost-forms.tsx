"use client";

import {
  type FormEvent,
  type ReactNode,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Layers3, Save } from "lucide-react";

import {
  createExpenseCategoryConfig,
  createFixedCost,
  createVariableCost,
} from "@/actions/expenses/create-costs";
import { formatCurrency } from "@/lib/utils";

type VenueOption = {
  id: string;
  name: string;
};

type NightOption = {
  id: string;
  name: string;
  venueId: string;
  venueName?: string;
};

type Props = {
  venues: VenueOption[];
  activeVenueId: string | null;
};

type VariableCostProps = Props & {
  nights: NightOption[];
};

type ExpenseCategoryTypeValue =
  | "FIXED"
  | "VARIABLE"
  | "OPERATIONAL"
  | "EXTRAORDINARY";
type FixedCostPeriodicityValue = "DAILY" | "WEEKLY" | "MONTHLY";
type VariableRelationValue =
  | "PER_SESSION"
  | "PER_SALE"
  | "PER_ATTENDEE"
  | "PER_PRODUCT"
  | "OTHER";

const categoryTypes = [
  { value: "OPERATIONAL", label: "Operativo" },
  { value: "FIXED", label: "Fijo" },
  { value: "VARIABLE", label: "Variable" },
  { value: "EXTRAORDINARY", label: "Extraordinario" },
] as const;

const periodicities = [
  { value: "DAILY", label: "Diario" },
  { value: "WEEKLY", label: "Semanal" },
  { value: "MONTHLY", label: "Mensual" },
] as const;

const relationTypes = [
  { value: "PER_SESSION", label: "Por jornada" },
  { value: "PER_SALE", label: "Por venta" },
  { value: "PER_ATTENDEE", label: "Por cliente" },
  { value: "PER_PRODUCT", label: "Por producto" },
  { value: "OTHER", label: "Otro" },
] as const;

const controlClass =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none";

export function ExpenseCategoryForm({ venues, activeVenueId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [venueId, setVenueId] = useState(activeVenueId ?? venues[0]?.id ?? "");
  const [name, setName] = useState("");
  const [type, setType] =
    useState<ExpenseCategoryTypeValue>("OPERATIONAL");
  const [message, setMessage] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await createExpenseCategoryConfig({
        venueId,
        name,
        type,
      });

      setMessage(result.message);

      if (result.ok) {
        setName("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Sede">
        <VenueSelect venues={venues} venueId={venueId} setVenueId={setVenueId} />
      </Field>
      <Field label="Nombre">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={controlClass}
          placeholder="Ej: Seguridad, marketing, limpieza"
        />
      </Field>
      <Field label="Tipo">
        <select
          value={type}
          onChange={(event) =>
            setType(event.target.value as ExpenseCategoryTypeValue)
          }
          className={controlClass}
        >
          {categoryTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      <SubmitButton disabled={isPending || !venueId || !name}>
        {isPending ? "Guardando..." : "Crear categoria"}
      </SubmitButton>
      <Message text={message} />
    </form>
  );
}

export function FixedCostForm({ venues, activeVenueId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [venueId, setVenueId] = useState(activeVenueId ?? venues[0]?.id ?? "");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [periodicity, setPeriodicity] =
    useState<FixedCostPeriodicityValue>("MONTHLY");
  const [message, setMessage] = useState("");

  const monthlyEquivalent = useMemo(() => {
    const value = Number(amount) || 0;
    if (periodicity === "DAILY") return value * 30;
    if (periodicity === "WEEKLY") return value * 4.33;
    return value;
  }, [amount, periodicity]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await createFixedCost({
        venueId,
        name,
        amount,
        periodicity,
        active: true,
      });

      setMessage(result.message);

      if (result.ok) {
        setName("");
        setAmount("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Sede">
        <VenueSelect venues={venues} venueId={venueId} setVenueId={setVenueId} />
      </Field>
      <Field label="Nombre">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={controlClass}
          placeholder="Ej: Alquiler, sueldos fijos"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Monto">
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className={controlClass}
            placeholder="0"
          />
        </Field>
        <Field label="Periodicidad">
          <select
            value={periodicity}
            onChange={(event) =>
              setPeriodicity(event.target.value as FixedCostPeriodicityValue)
            }
            className={controlClass}
          >
            {periodicities.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Preview label="Equivalente mensual" value={formatCurrency(monthlyEquivalent)} />
      <SubmitButton disabled={isPending || !venueId || !name || !amount}>
        {isPending ? "Guardando..." : "Crear costo fijo"}
      </SubmitButton>
      <Message text={message} />
    </form>
  );
}

export function VariableCostForm({
  venues,
  activeVenueId,
  nights,
}: VariableCostProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [venueId, setVenueId] = useState(activeVenueId ?? venues[0]?.id ?? "");
  const [nightId, setNightId] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [relationType, setRelationType] =
    useState<VariableRelationValue>("PER_SESSION");
  const [message, setMessage] = useState("");

  const filteredNights = useMemo(
    () => nights.filter((night) => night.venueId === venueId),
    [nights, venueId]
  );

  function changeVenue(nextVenueId: string) {
    setVenueId(nextVenueId);
    setNightId("");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await createVariableCost({
        venueId,
        nightId: nightId || undefined,
        name,
        amount,
        relationType,
        active: true,
      });

      setMessage(result.message);

      if (result.ok) {
        setName("");
        setAmount("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Sede">
          <VenueSelect
            venues={venues}
            venueId={venueId}
            setVenueId={changeVenue}
          />
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
          placeholder="Ej: Comision tarjeta, personal eventual"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Monto">
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className={controlClass}
            placeholder="0"
          />
        </Field>
        <Field label="Relacion">
          <select
            value={relationType}
            onChange={(event) =>
              setRelationType(event.target.value as VariableRelationValue)
            }
            className={controlClass}
          >
            {relationTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <SubmitButton disabled={isPending || !venueId || !name || !amount}>
        {isPending ? "Guardando..." : "Crear costo variable"}
      </SubmitButton>
      <Message text={message} />
    </form>
  );
}

function VenueSelect({
  venues,
  venueId,
  setVenueId,
}: {
  venues: VenueOption[];
  venueId: string;
  setVenueId: (value: string) => void;
}) {
  return (
    <select
      value={venueId}
      onChange={(event) => setVenueId(event.target.value)}
      className={controlClass}
    >
      {venues.map((venue) => (
        <option key={venue.id} value={venue.id}>
          {venue.name}
        </option>
      ))}
    </select>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white">{label}</span>
      {children}
    </label>
  );
}

function Preview({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-4">
      <div className="flex items-center gap-3">
        <Layers3 className="h-5 w-5 text-[#D4AF37]" />
        <div>
          <p className="text-sm text-zinc-300">{label}</p>
          <p className="mt-1 text-xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SubmitButton({
  disabled,
  children,
}: {
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
    >
      <Save className="h-4 w-4" />
      {children}
    </button>
  );
}

function Message({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
      {text}
    </div>
  );
}

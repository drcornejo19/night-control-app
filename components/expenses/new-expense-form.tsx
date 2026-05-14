"use client";

import { type FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";

import { createExpense } from "@/actions/expenses/create-expenses";
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

type ExpenseCategoryOption = {
  id: string;
  name: string;
  type: string;
  venueId: string;
};

type Props = {
  venues: VenueOption[];
  nights: NightOption[];
  categories: ExpenseCategoryOption[];
  activeVenueId: string | null;
};

type PaymentMethodValue = "CASH" | "TRANSFER" | "CARD" | "QR" | "OTHER";
type ExpenseCategoryValue = "STAFF" | "DJ" | "SUPPLIER" | "SERVICES" | "OTHER";

const expenseCategories = [
  { value: "STAFF", label: "Personal" },
  { value: "DJ", label: "DJ / entretenimiento" },
  { value: "SUPPLIER", label: "Proveedor" },
  { value: "SERVICES", label: "Servicios" },
  { value: "OTHER", label: "Otro" },
] as const;

const paymentMethods = [
  { value: "CASH", label: "Efectivo" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "CARD", label: "Tarjeta" },
  { value: "QR", label: "QR" },
  { value: "OTHER", label: "Otro" },
] as const;

const controlClass =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none";

export function NewExpenseForm({
  venues,
  nights,
  categories,
  activeVenueId,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialVenueId = activeVenueId ?? venues[0]?.id ?? "";
  const [venueId, setVenueId] = useState(initialVenueId);
  const [nightId, setNightId] = useState("");
  const [expenseCategoryId, setExpenseCategoryId] = useState("");
  const [category, setCategory] = useState<ExpenseCategoryValue>("OTHER");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue>("CASH");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const filteredNights = useMemo(
    () => nights.filter((night) => night.venueId === venueId),
    [nights, venueId]
  );
  const filteredCategories = useMemo(
    () => categories.filter((item) => item.venueId === venueId),
    [categories, venueId]
  );
  const selectedAmount = Number(amount) || 0;

  function changeVenue(nextVenueId: string) {
    setVenueId(nextVenueId);
    setNightId("");
    setExpenseCategoryId("");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await createExpense({
        venueId,
        nightId: nightId || undefined,
        expenseCategoryId: expenseCategoryId || undefined,
        category,
        amount,
        note: note || undefined,
        paymentMethod,
      });

      setMessage(result.message);

      if (result.ok) {
        setAmount("");
        setNote("");
        router.refresh();
      }
    });
  }

  if (venues.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
        No hay sedes para cargar gastos.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-medium text-white">
            Sede
          </span>
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
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-white">
            Jornada
          </span>
          <select
            value={nightId}
            onChange={(event) => setNightId(event.target.value)}
            className={controlClass}
          >
            <option value="">Sin jornada</option>
            {filteredNights.map((night) => (
              <option key={night.id} value={night.id}>
                {night.name}
                {night.venueName ? ` - ${night.venueName}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-white">
            Categoria interna
          </span>
          <select
            value={expenseCategoryId}
            onChange={(event) => setExpenseCategoryId(event.target.value)}
            className={controlClass}
          >
            <option value="">Sin categoria interna</option>
            {filteredCategories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} - {item.type}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-white">
            Tipo contable
          </span>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as ExpenseCategoryValue)
            }
            className={controlClass}
          >
            {expenseCategories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-white">
            Medio de pago
          </span>
          <select
            value={paymentMethod}
            onChange={(event) =>
              setPaymentMethod(event.target.value as PaymentMethodValue)
            }
            className={controlClass}
          >
            {paymentMethods.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-white">
            Monto
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className={controlClass}
            placeholder="0"
          />
        </label>
      </div>

      <label>
        <span className="mb-2 block text-sm font-medium text-white">
          Observacion
        </span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          className={controlClass}
          placeholder="Detalle del gasto"
        />
      </label>

      <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-4">
        <div className="flex items-center gap-3">
          <Receipt className="h-5 w-5 text-[#D4AF37]" />
          <div>
            <p className="text-sm text-zinc-300">Gasto a registrar</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {formatCurrency(selectedAmount)}
            </p>
          </div>
        </div>
      </div>

      {message ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending || !venueId || selectedAmount <= 0}
        className="w-full rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
      >
        {isPending ? "Registrando..." : "Registrar gasto"}
      </button>
    </form>
  );
}

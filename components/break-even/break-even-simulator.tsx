"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

import { calculateProjectedProfit } from "@/lib/finance/break-even";
import { formatCurrency, formatNumber } from "@/lib/utils";

type Props = {
  fixedCosts: number;
  variableCostRatio: number;
  operationalExpenses: number;
  initialAttendees: number;
  initialAverageTicket: number;
};

const controlClass =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none";

export function BreakEvenSimulator({
  fixedCosts,
  variableCostRatio,
  operationalExpenses,
  initialAttendees,
  initialAverageTicket,
}: Props) {
  const [attendees, setAttendees] = useState(
    Math.max(1, initialAttendees || 100).toString()
  );
  const [averageTicket, setAverageTicket] = useState(
    Math.max(1, Math.round(initialAverageTicket || 10000)).toString()
  );

  const simulation = calculateProjectedProfit({
    attendees: Number(attendees) || 0,
    averageTicket: Number(averageTicket) || 0,
    fixedCosts,
    variableCostRatio,
    operationalExpenses,
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-medium text-white">
            Personas
          </span>
          <input
            type="number"
            min="0"
            step="1"
            value={attendees}
            onChange={(event) => setAttendees(event.target.value)}
            className={controlClass}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-white">
            Ticket promedio
          </span>
          <input
            type="number"
            min="0"
            step="100"
            value={averageTicket}
            onChange={(event) => setAverageTicket(event.target.value)}
            className={controlClass}
          />
        </label>
      </div>

      <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-4">
        <div className="flex items-center gap-3">
          <Calculator className="h-5 w-5 text-[#D4AF37]" />
          <div>
            <p className="text-sm text-zinc-300">Utilidad estimada</p>
            <p
              className={`mt-1 text-3xl font-semibold ${
                simulation.projectedProfit >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {formatCurrency(simulation.projectedProfit)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat
          label="Venta proyectada"
          value={formatCurrency(simulation.projectedRevenue)}
        />
        <MiniStat
          label="Variables estimados"
          value={formatCurrency(simulation.projectedVariableCosts)}
        />
        <MiniStat
          label="Ratio variable"
          value={`${formatNumber(Math.round(variableCostRatio * 100))}%`}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

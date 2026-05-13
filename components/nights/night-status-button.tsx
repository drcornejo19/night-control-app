"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateNightStatus } from "@/actions/nights/update-night-status";

type NightStatus = "PLANNED" | "OPEN" | "CLOSED" | "AUDITED" | "CANCELLED";

type NightStatusButtonProps = {
  nightId: string;
  currentStatus: NightStatus;
};

export function NightStatusButton({
  nightId,
  currentStatus,
}: NightStatusButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(status: NightStatus) {
    startTransition(async () => {
      const result = await updateNightStatus({
        nightId,
        status,
      });

      if (!result.ok) {
        alert(result.message);
        return;
      }

      router.refresh();
    });
  }

  if (currentStatus === "AUDITED") {
    return (
      <span className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400">
        Auditada
      </span>
    );
  }

  if (currentStatus === "PLANNED") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatusChange("OPEN")}
          className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-2 text-sm font-medium text-[#D4AF37]"
        >
          {isPending ? "Abriendo..." : "Abrir"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatusChange("CANCELLED")}
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400"
        >
          Cancelar
        </button>
      </div>
    );
  }

  if (currentStatus === "OPEN") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatusChange("CLOSED")}
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400"
        >
          {isPending ? "Cerrando..." : "Cerrar"}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatusChange("CANCELLED")}
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400"
        >
          Cancelar
        </button>
      </div>
    );
  }

  if (currentStatus === "CLOSED") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatusChange("OPEN")}
          className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-2 text-sm font-medium text-[#D4AF37]"
        >
          Reabrir
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatusChange("AUDITED")}
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400"
        >
          Auditar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => handleStatusChange("PLANNED")}
      className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-2 text-sm font-medium text-[#D4AF37]"
    >
      Reactivar
    </button>
  );
}

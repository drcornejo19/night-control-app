"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateNightStatus } from "@/actions/nights/update-night-status";

type NightStatusButtonProps = {
  nightId: string;
  currentStatus: "OPEN" | "CLOSED" | "CANCELLED";
};

export function NightStatusButton({
  nightId,
  currentStatus,
}: NightStatusButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(status: "OPEN" | "CLOSED" | "CANCELLED") {
    startTransition(async () => {
      await updateNightStatus({
        nightId,
        status,
      });

      router.refresh();
    });
  }

  if (currentStatus === "OPEN") {
    return (
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatusChange("CLOSED")}
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400"
        >
          {isPending ? "Actualizando..." : "Cerrar"}
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
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleStatusChange("OPEN")}
        className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-2 text-sm font-medium text-[#D4AF37]"
      >
        Reabrir
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => handleStatusChange("OPEN")}
      className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-2 text-sm font-medium text-[#D4AF37]"
    >
      Reactivar
    </button>
  );
}
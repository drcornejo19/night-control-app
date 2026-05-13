export type NightStatusView =
  | "PLANNED"
  | "OPEN"
  | "CLOSED"
  | "AUDITED"
  | "CANCELLED";

const statusStyles: Record<NightStatusView, string> = {
  PLANNED: "border-sky-500/20 bg-sky-500/10 text-sky-300",
  OPEN: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  CLOSED: "border-zinc-500/20 bg-zinc-500/10 text-zinc-300",
  AUDITED: "border-[#D4AF37]/20 bg-[#D4AF37]/10 text-[#D4AF37]",
  CANCELLED: "border-red-500/20 bg-red-500/10 text-red-400",
};

const statusLabels: Record<NightStatusView, string> = {
  PLANNED: "Planificada",
  OPEN: "Abierta",
  CLOSED: "Cerrada",
  AUDITED: "Auditada",
  CANCELLED: "Cancelada",
};

export function NightStatusBadge({ status }: { status: NightStatusView }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

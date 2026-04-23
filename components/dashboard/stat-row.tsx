type DashboardStatRowProps = {
  label: string;
  value: string;
};

export function DashboardStatRow({
  label,
  value,
}: DashboardStatRowProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
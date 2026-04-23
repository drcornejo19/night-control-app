import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type DashboardKpiCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  changeLabel?: string;
  trend?: "up" | "down" | "neutral";
};

export function DashboardKpiCard({
  title,
  value,
  icon: Icon,
  changeLabel,
  trend = "neutral",
}: DashboardKpiCardProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#131313] to-[#090909] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            {title}
          </p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            {formatCurrency(value)}
          </h3>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 text-[#D4AF37]">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        {trend === "up" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            OK
          </span>
        )}

        {trend === "down" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-400">
            <TrendingDown className="h-3.5 w-3.5" />
            Atención
          </span>
        )}

        {trend === "neutral" && (
          <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-400">
            Actual
          </span>
        )}

        {changeLabel ? (
          <span className="text-xs text-zinc-500">{changeLabel}</span>
        ) : null}
      </div>
    </div>
  );
}
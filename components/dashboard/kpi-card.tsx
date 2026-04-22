import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  title: string;
  value: number;
  change: number;
  icon: LucideIcon;
  variant?: "default" | "success" | "danger";
};

export function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  variant = "default",
}: KpiCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="group rounded-[28px] border border-white/10 bg-gradient-to-br from-[#141414] to-[#0A0A0A] p-5 transition hover:border-[#D4AF37]/25 hover:shadow-[0_0_0_1px_rgba(212,175,55,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">
            {title}
          </p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            {formatCurrency(value)}
          </h3>
        </div>

        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl border",
            variant === "danger"
              ? "border-red-500/20 bg-red-500/10 text-red-400"
              : variant === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-[#D4AF37]/20 bg-[#D4AF37]/10 text-[#D4AF37]"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            isPositive
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-red-500/15 text-red-400"
          )}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {isPositive ? "+" : ""}
          {change}%
        </div>

        <div className="h-10 w-24 rounded-full bg-[radial-gradient(circle_at_left,rgba(212,175,55,0.32),transparent_55%)] opacity-80" />
      </div>
    </div>
  );
}
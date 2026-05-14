export type ReportPeriod = "day" | "week" | "month";

export type ReportRange = {
  period: ReportPeriod;
  label: string;
  start: Date;
  end: Date;
  days: number;
};

export function parseReportPeriod(value: string | undefined): ReportPeriod {
  if (value === "week" || value === "month") return value;
  return "day";
}

export function getReportRange(period: ReportPeriod, now = new Date()): ReportRange {
  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return {
      period,
      label: "Este mes",
      start,
      end,
      days: getDaysBetween(start, end),
    };
  }

  if (period === "week") {
    const start = startOfWeek(now);
    const end = addDays(start, 7);

    return {
      period,
      label: "Esta semana",
      start,
      end,
      days: getDaysBetween(start, end),
    };
  }

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = addDays(start, 1);

  return {
    period,
    label: "Hoy",
    start,
    end,
    days: 1,
  };
}

export function getNetMargin(revenue: number, netProfit: number) {
  if (revenue <= 0) return 0;
  return (netProfit / revenue) * 100;
}

export function getAverageTicket(revenue: number, transactions: number) {
  if (transactions <= 0) return 0;
  return revenue / transactions;
}

export function pushTotal(
  map: Map<string, number>,
  label: string | null | undefined,
  amount: number
) {
  const key = label?.trim() || "Sin clasificar";
  map.set(key, (map.get(key) ?? 0) + amount);
}

export function sortTotals(map: Map<string, number>) {
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

export function formatReportDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  return start;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getDaysBetween(start: Date, end: Date) {
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.round(diff / 86_400_000));
}

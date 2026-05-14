export type BreakEvenStatus = "LOSS" | "BREAK_EVEN" | "PROFIT";

export type BreakEvenResult = {
  revenue: number;
  fixedCosts: number;
  variableCosts: number;
  operationalExpenses: number;
  contributionMargin: number;
  contributionMarginRatio: number;
  breakEvenRevenue: number;
  breakEvenAttendees: number;
  missingRevenue: number;
  progressPercent: number;
  netProfit: number;
  averageTicket: number;
  attendees: number;
  status: BreakEvenStatus;
};

type BreakEvenInput = {
  revenue: number;
  fixedCosts: number;
  variableCosts: number;
  operationalExpenses?: number;
  averageTicket?: number;
  attendees?: number;
};

export function calculateBreakEven(input: BreakEvenInput): BreakEvenResult {
  const revenue = normalizeMoney(input.revenue);
  const fixedCosts = normalizeMoney(input.fixedCosts);
  const variableCosts = normalizeMoney(input.variableCosts);
  const operationalExpenses = normalizeMoney(input.operationalExpenses ?? 0);
  const attendees = Math.max(0, Math.round(input.attendees ?? 0));
  const averageTicket =
    input.averageTicket && input.averageTicket > 0
      ? input.averageTicket
      : attendees > 0
        ? revenue / attendees
        : 0;

  const contributionMargin = revenue - variableCosts;
  const contributionMarginRatio =
    revenue > 0 ? contributionMargin / revenue : 0;
  const breakEvenRevenue =
    contributionMarginRatio > 0 ? fixedCosts / contributionMarginRatio : 0;
  const breakEvenAttendees =
    averageTicket > 0 ? Math.ceil(breakEvenRevenue / averageTicket) : 0;
  const missingRevenue = Math.max(0, breakEvenRevenue - revenue);
  const progressPercent =
    breakEvenRevenue > 0
      ? Math.min(999, Math.round((revenue / breakEvenRevenue) * 100))
      : revenue > 0
        ? 100
        : 0;
  const netProfit =
    revenue - variableCosts - fixedCosts - operationalExpenses;

  return {
    revenue,
    fixedCosts,
    variableCosts,
    operationalExpenses,
    contributionMargin,
    contributionMarginRatio,
    breakEvenRevenue,
    breakEvenAttendees,
    missingRevenue,
    progressPercent,
    netProfit,
    averageTicket,
    attendees,
    status: getBreakEvenStatus(netProfit, missingRevenue),
  };
}

export function calculateProjectedProfit({
  attendees,
  averageTicket,
  fixedCosts,
  variableCostRatio,
  operationalExpenses = 0,
}: {
  attendees: number;
  averageTicket: number;
  fixedCosts: number;
  variableCostRatio: number;
  operationalExpenses?: number;
}) {
  const projectedRevenue = Math.max(0, attendees) * Math.max(0, averageTicket);
  const projectedVariableCosts =
    projectedRevenue * Math.max(0, variableCostRatio);

  return {
    projectedRevenue,
    projectedVariableCosts,
    projectedProfit:
      projectedRevenue -
      projectedVariableCosts -
      Math.max(0, fixedCosts) -
      Math.max(0, operationalExpenses),
  };
}

function getBreakEvenStatus(
  netProfit: number,
  missingRevenue: number
): BreakEvenStatus {
  if (netProfit > 0) return "PROFIT";
  if (missingRevenue <= 1) return "BREAK_EVEN";
  return "LOSS";
}

function normalizeMoney(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

import type { FixedCostPeriodicity } from "@prisma/client";

export function getDailyFixedCost(amount: number, periodicity: FixedCostPeriodicity) {
  if (periodicity === "DAILY") return amount;
  if (periodicity === "WEEKLY") return amount / 7;
  return amount / 30;
}

export function getMonthlyFixedCost(
  amount: number,
  periodicity: FixedCostPeriodicity
) {
  if (periodicity === "DAILY") return amount * 30;
  if (periodicity === "WEEKLY") return amount * 4.33;
  return amount;
}

export function getContributionMarginRatio(revenue: number, variableCosts: number) {
  if (revenue <= 0) return 0;
  return (revenue - variableCosts) / revenue;
}

export function getBreakEvenRevenue(fixedCosts: number, marginRatio: number) {
  if (marginRatio <= 0) return 0;
  return fixedCosts / marginRatio;
}

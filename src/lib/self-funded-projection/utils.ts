// lib/self-funded-projection/utils.ts
// Shared utility functions (avoids circular imports)

import type { SelfFundedInfrastructureParams } from "./types";

/**
 * Sum all 9 infrastructure items
 */
export function sumInfrastructure(infra: SelfFundedInfrastructureParams): number {
  return (
    infra.landCost +
    infra.warehouseCost +
    infra.cattleHandlingCost +
    infra.officeCost +
    infra.waterWellCost +
    infra.geomembraneCost +
    infra.housingCost +
    infra.agriculturalAreaCost +
    infra.machineryCost +
    infra.agriculturalEngineerFee
  );
}

/**
 * Calculate total investment (cattle + infra + consulting)
 */
export function calculateTotalInvestment(
  numberOfCows: number,
  costPerCow: number,
  infrastructureTotal: number,
  consultingFeePercent: number
): number {
  const cattleTotal = numberOfCows * costPerCow;
  const baseCost = cattleTotal + infrastructureTotal;
  const consultingFee = baseCost * (consultingFeePercent / 100);
  return baseCost + consultingFee;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-MX").format(Math.round(value));
}

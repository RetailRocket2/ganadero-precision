// lib/self-funded-projection/index.ts
// Main orchestrator for Self-Funded Cattle Ranching Investment Projection

import type {
  SelfFundedProjectionInput,
  SelfFundedProjectionResult,
  SelfFundedInvestmentSummary,
  SelfFundedFinancialMetrics,
  CashFlowStatementRow,
  IncomeStatementRow,
} from "./types";

import { validateSelfFundedInput } from "./validators";
import { getDefaultSelfFundedInput } from "./defaults";
import { sumInfrastructure } from "./utils";
import {
  calculateHerdProjections,
  calculateMonthlyCalfInventory,
} from "./herd-calculations";
import { calculateMonthlyCashFlows } from "./monthly-cashflow";
import {
  generateIncomeStatements,
  generateBalanceSheets,
  generateCashFlowStatements,
} from "./financial-statements";

// Import pure math from existing engine
import {
  calculateNPV,
  calculateIRR,
  calculatePaybackPeriod,
  calculateROI,
  findBreakEvenYear,
} from "../ranching-projection/metrics";

// Re-export types and utilities
export * from "./types";
export * from "./defaults";
export * from "./utils";
export { validateSelfFundedInput, getFieldErrors, hasFieldError } from "./validators";

/**
 * Calculate financial metrics — no DSCR
 */
function calculateSelfFundedMetrics(
  input: SelfFundedProjectionInput,
  cashFlowStatements: CashFlowStatementRow[],
  incomeStatements: IncomeStatementRow[],
  totalCashRequired: number
): SelfFundedFinancialMetrics {
  const annualCashFlows: number[] = [];

  // Year 0: full owner investment (negative)
  annualCashFlows.push(-totalCashRequired);

  // Years 1-N: operating cash flow only
  // (investment is already captured in Year 0, don't double-count via netCashFromInvesting)
  for (const statement of cashFlowStatements) {
    annualCashFlows.push(statement.netCashFromOperating);
  }

  const npv = calculateNPV(annualCashFlows, 0.10);
  const irr = calculateIRR(annualCashFlows);
  const paybackPeriodYears = calculatePaybackPeriod(annualCashFlows);

  const totalNetIncome = incomeStatements.reduce((sum, s) => sum + s.netIncome, 0);
  const roiTotal = calculateROI(totalNetIncome, totalCashRequired) / 100;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- self-funded IncomeStatementRow is a subset; findBreakEvenYear only reads netIncome & year
  const breakEvenYear = findBreakEvenYear(incomeStatements as any);
  const averageNetMargin =
    incomeStatements.reduce((sum, s) => sum + s.netMarginPercent, 0) /
    incomeStatements.length;

  return {
    paybackPeriodYears,
    irr,
    npv,
    roiTotal,
    breakEvenYear,
    averageNetMargin,
  };
}

/**
 * Calculate investment summary
 */
function calculateInvestmentSummary(
  input: SelfFundedProjectionInput
): SelfFundedInvestmentSummary {
  const infrastructureTotal = sumInfrastructure(input.infrastructure);
  const cattleTotal = input.cattle.numberOfCows * input.cattle.costPerCow;
  const baseCost = cattleTotal + infrastructureTotal;
  const consultingFee = baseCost * (input.consultingFee.feePercent / 100);
  const totalCashRequired = baseCost + consultingFee;

  return {
    totalCashRequired,
    infrastructureTotal,
    cattleTotal,
    consultingFee,
  };
}

/**
 * Main function: generate complete self-funded projection
 */
export function generateSelfFundedProjection(
  input: SelfFundedProjectionInput
): SelfFundedProjectionResult {
  const validation = validateSelfFundedInput(input);
  if (!validation.isValid) {
    throw new Error(
      `Datos inválidos: ${validation.errors.map((e) => e.message).join(", ")}`
    );
  }

  // 1. Investment summary
  const investmentSummary = calculateInvestmentSummary(input);

  // 2. Herd projections
  const herdProjections = calculateHerdProjections(input);

  // 3. Monthly calf inventory
  const calfInventory = calculateMonthlyCalfInventory(input, herdProjections);

  // 4. Monthly cash flows
  const monthlyCashFlows = calculateMonthlyCashFlows(input, herdProjections, calfInventory);

  // 5. Income statements
  const incomeStatements = generateIncomeStatements(input, monthlyCashFlows, herdProjections);

  // 6. Balance sheets
  const balanceSheets = generateBalanceSheets(
    input, monthlyCashFlows, herdProjections, incomeStatements,
    investmentSummary.totalCashRequired
  );

  // 7. Cash flow statements
  const cashFlowStatements = generateCashFlowStatements(
    input, monthlyCashFlows, incomeStatements,
    investmentSummary.totalCashRequired
  );

  // 8. Financial metrics
  const metrics = calculateSelfFundedMetrics(
    input, cashFlowStatements, incomeStatements,
    investmentSummary.totalCashRequired
  );

  return {
    input,
    investmentSummary,
    monthlyCashFlows,
    herdProjections,
    incomeStatements,
    balanceSheets,
    cashFlowStatements,
    metrics,
    generatedAt: new Date(),
    version: "1.0.0",
  };
}

export function generateDefaultSelfFundedProjection(): SelfFundedProjectionResult {
  return generateSelfFundedProjection(getDefaultSelfFundedInput());
}

/**
 * Format metrics for display
 */
export function formatSelfFundedMetrics(metrics: SelfFundedFinancialMetrics): {
  paybackPeriod: string;
  irr: string;
  npv: string;
  roi: string;
  breakEven: string;
  avgMargin: string;
} {
  const fmtCurr = (v: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v);
  const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;

  return {
    paybackPeriod: metrics.paybackPeriodYears <= 10
      ? `${metrics.paybackPeriodYears.toFixed(1)} años`
      : "No recupera en 10 años",
    irr: fmtPct(metrics.irr),
    npv: fmtCurr(metrics.npv),
    roi: fmtPct(metrics.roiTotal),
    breakEven: metrics.breakEvenYear <= 10
      ? `Año ${metrics.breakEvenYear}`
      : "No alcanza en 10 años",
    avgMargin: `${metrics.averageNetMargin.toFixed(1)}%`,
  };
}

/**
 * Evaluate investment quality — no DSCR scoring
 */
export function evaluateSelfFundedInvestment(metrics: SelfFundedFinancialMetrics): {
  rating: "excelente" | "bueno" | "aceptable" | "riesgoso";
  summary: string;
} {
  let score = 0;

  if (metrics.irr >= 0.25) score += 3;
  else if (metrics.irr >= 0.15) score += 2;
  else if (metrics.irr >= 0.10) score += 1;

  if (metrics.npv > 1_000_000) score += 3;
  else if (metrics.npv > 0) score += 2;
  else if (metrics.npv > -500_000) score += 1;

  if (metrics.paybackPeriodYears <= 2) score += 3;
  else if (metrics.paybackPeriodYears <= 3) score += 2;
  else if (metrics.paybackPeriodYears <= 4) score += 1;

  let rating: "excelente" | "bueno" | "aceptable" | "riesgoso";
  let summary: string;

  if (score >= 7) {
    rating = "excelente";
    summary = "Inversión con excelente potencial de retorno. Sin riesgo de deuda bancaria.";
  } else if (score >= 5) {
    rating = "bueno";
    summary = "Inversión sólida con buenos indicadores. Capital propio bien aprovechado.";
  } else if (score >= 3) {
    rating = "aceptable";
    summary = "Inversión viable pero con retornos moderados. Evaluar optimizaciones.";
  } else {
    rating = "riesgoso";
    summary = "Retorno bajo para el capital invertido. Revisar parámetros.";
  }

  return { rating, summary };
}

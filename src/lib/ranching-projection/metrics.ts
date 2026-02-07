// lib/ranching-projection/metrics.ts
// Financial metrics calculations: IRR, NPV, Payback, ROI

import type {
  RanchingProjectionInput,
  CashFlowStatementRow,
  IncomeStatementRow,
  FinancialMetrics,
} from "./types";

// Default discount rate for NPV calculation
const DEFAULT_DISCOUNT_RATE = 0.10; // 10%

/**
 * Calculate Net Present Value (VPN)
 * NPV = Σ (CFt / (1 + r)^t) - Initial Investment
 */
export function calculateNPV(
  cashFlows: number[],
  discountRate: number = DEFAULT_DISCOUNT_RATE
): number {
  return cashFlows.reduce((npv, cf, t) => {
    return npv + cf / Math.pow(1 + discountRate, t);
  }, 0);
}

/**
 * Calculate Internal Rate of Return (TIR)
 * Uses Newton-Raphson method to find the rate where NPV = 0
 */
export function calculateIRR(
  cashFlows: number[],
  maxIterations: number = 100,
  tolerance: number = 0.0001
): number {
  // Initial guess
  let rate = 0.1;

  for (let i = 0; i < maxIterations; i++) {
    // Calculate NPV at current rate
    let npv = 0;
    let dnpv = 0; // Derivative of NPV

    for (let t = 0; t < cashFlows.length; t++) {
      const discountFactor = Math.pow(1 + rate, t);
      npv += cashFlows[t] / discountFactor;
      dnpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
    }

    // Newton-Raphson step
    const newRate = rate - npv / dnpv;

    // Check convergence
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }

    rate = newRate;

    // Guard against invalid rates
    if (isNaN(rate) || !isFinite(rate) || rate < -1) {
      return 0;
    }
  }

  // If didn't converge, return the last rate
  return rate;
}

/**
 * Calculate Payback Period
 * Returns the year (fractional) when cumulative cash flow becomes positive
 */
export function calculatePaybackPeriod(
  cashFlows: number[]
): number {
  let cumulative = 0;

  for (let t = 0; t < cashFlows.length; t++) {
    const previousCumulative = cumulative;
    cumulative += cashFlows[t];

    // Check if we crossed zero
    if (cumulative >= 0 && previousCumulative < 0) {
      // Interpolate to find exact year
      const fraction = -previousCumulative / (cumulative - previousCumulative);
      return t - 1 + fraction;
    }
  }

  // If never pays back, return projection length + 1
  return cashFlows.length + 1;
}

/**
 * Calculate Return on Investment (ROI)
 * ROI = (Net Profit - Initial Investment) / Initial Investment × 100
 */
export function calculateROI(
  totalNetIncome: number,
  initialInvestment: number
): number {
  if (initialInvestment === 0) return 0;
  return (totalNetIncome / initialInvestment) * 100;
}

/**
 * Find the break-even year (first year with positive net income)
 */
export function findBreakEvenYear(
  incomeStatements: IncomeStatementRow[]
): number {
  for (const statement of incomeStatements) {
    if (statement.netIncome > 0) {
      return statement.year;
    }
  }
  return incomeStatements.length + 1;
}

/**
 * Calculate all financial metrics
 */
export function calculateFinancialMetrics(
  input: RanchingProjectionInput,
  cashFlowStatements: CashFlowStatementRow[],
  incomeStatements: IncomeStatementRow[],
  debtServiceCoverageRatios: number[]
): FinancialMetrics {
  // Build annual cash flow array for NPV/IRR
  // Year 0 is the initial investment (negative)
  const annualCashFlows: number[] = [];

  // Calculate initial investment
  const { loan, infrastructure, cattle, consultingFee } = input;
  const infrastructureTotal =
    infrastructure.warehouseCost +
    infrastructure.cattleHandlingCost +
    infrastructure.officeCost +
    infrastructure.otherInfrastructureCost;
  // Cattle total (cows only - using IATF)
  const cattleTotal = cattle.numberOfCows * cattle.costPerCow;
  const consultingFeeAmount = loan.loanAmount * (consultingFee.feePercent / 100);
  const initialInvestment = infrastructureTotal + cattleTotal + consultingFeeAmount;

  // Down payment is the owner's investment
  const ownerInvestment = loan.loanAmount * (loan.downPaymentPercent / 100);

  // Year 0: Initial owner investment (negative)
  annualCashFlows.push(-ownerInvestment);

  // Years 1-5: Net cash change from cash flow statements
  for (const statement of cashFlowStatements) {
    // Use free cash flow (operating + investing, before financing)
    const freeCashFlow = statement.netCashFromOperating + statement.netCashFromInvesting;
    annualCashFlows.push(freeCashFlow);
  }

  // Calculate NPV at 10%
  const npv = calculateNPV(annualCashFlows, DEFAULT_DISCOUNT_RATE);

  // Calculate IRR
  const irr = calculateIRR(annualCashFlows);

  // Calculate payback period
  const paybackPeriodYears = calculatePaybackPeriod(annualCashFlows);

  // Calculate ROI at year 5
  const totalNetIncome = incomeStatements.reduce(
    (sum, stmt) => sum + stmt.netIncome,
    0
  );
  const roiYear5 = calculateROI(totalNetIncome, ownerInvestment) / 100; // As decimal

  // Find break-even year
  const breakEvenYear = findBreakEvenYear(incomeStatements);

  // Average net margin
  const avgNetMargin =
    incomeStatements.reduce((sum, stmt) => sum + stmt.netMarginPercent, 0) /
    incomeStatements.length;

  return {
    paybackPeriodYears,
    irr,
    npv,
    roiYear5,
    breakEvenYear,
    debtServiceCoverageRatio: debtServiceCoverageRatios,
    averageNetMargin: avgNetMargin,
  };
}

/**
 * Format metrics for display
 */
export function formatMetrics(metrics: FinancialMetrics): {
  paybackPeriod: string;
  irr: string;
  npv: string;
  roi: string;
  breakEven: string;
  avgMargin: string;
} {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatPercent = (value: number) =>
    `${(value * 100).toFixed(1)}%`;

  return {
    paybackPeriod: metrics.paybackPeriodYears <= 5
      ? `${metrics.paybackPeriodYears.toFixed(1)} años`
      : "No recupera en 5 años",
    irr: formatPercent(metrics.irr),
    npv: formatCurrency(metrics.npv),
    roi: formatPercent(metrics.roiYear5),
    breakEven: metrics.breakEvenYear <= 5
      ? `Año ${metrics.breakEvenYear}`
      : "No alcanza en 5 años",
    avgMargin: `${metrics.averageNetMargin.toFixed(1)}%`,
  };
}

/**
 * Evaluate investment quality based on metrics
 */
export function evaluateInvestment(metrics: FinancialMetrics): {
  rating: "excelente" | "bueno" | "aceptable" | "riesgoso";
  summary: string;
} {
  // Score based on multiple factors
  let score = 0;

  // IRR evaluation (higher is better)
  if (metrics.irr >= 0.25) score += 3;
  else if (metrics.irr >= 0.15) score += 2;
  else if (metrics.irr >= 0.10) score += 1;

  // NPV evaluation (positive is good)
  if (metrics.npv > 1_000_000) score += 3;
  else if (metrics.npv > 0) score += 2;
  else if (metrics.npv > -500_000) score += 1;

  // Payback evaluation (shorter is better)
  if (metrics.paybackPeriodYears <= 2) score += 3;
  else if (metrics.paybackPeriodYears <= 3) score += 2;
  else if (metrics.paybackPeriodYears <= 4) score += 1;

  // DSCR evaluation (should be > 1.2)
  const avgDSCR =
    metrics.debtServiceCoverageRatio.reduce((a, b) => a + b, 0) /
    metrics.debtServiceCoverageRatio.length;
  if (avgDSCR >= 1.5) score += 2;
  else if (avgDSCR >= 1.2) score += 1;

  // Determine rating
  let rating: "excelente" | "bueno" | "aceptable" | "riesgoso";
  let summary: string;

  if (score >= 9) {
    rating = "excelente";
    summary = "Inversión con excelente potencial de retorno y bajo riesgo financiero.";
  } else if (score >= 6) {
    rating = "bueno";
    summary = "Inversión sólida con buenos indicadores financieros.";
  } else if (score >= 3) {
    rating = "aceptable";
    summary = "Inversión viable pero con retornos moderados. Evaluar optimizaciones.";
  } else {
    rating = "riesgoso";
    summary = "Inversión con riesgo elevado. Revisar parámetros y buscar mejoras.";
  }

  return { rating, summary };
}

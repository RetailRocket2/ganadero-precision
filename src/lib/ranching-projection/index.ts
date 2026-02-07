// lib/ranching-projection/index.ts
// Main orchestrator for Cattle Ranching Financial Projection

import type {
  RanchingProjectionInput,
  RanchingProjectionResult,
  InvestmentSummary,
  LoanAmortizationRow,
} from "./types";

import { validateInput } from "./validators";
import { getDefaultInput } from "./defaults";
import {
  calculateHerdProjections,
  calculateMonthlyCalfInventory,
} from "./herd-calculations";
import { calculateMonthlyCashFlows } from "./monthly-cashflow";
import {
  generateIncomeStatements,
  generateBalanceSheets,
  generateCashFlowStatements,
  calculateDSCR,
} from "./financial-statements";
import { calculateFinancialMetrics } from "./metrics";

// Re-export types and utilities
export * from "./types";
export * from "./defaults";
export * from "./validators";
export { formatMetrics, evaluateInvestment } from "./metrics";

/**
 * Calculate loan amount from cattle + infrastructure + consulting fee
 * Formula: baseCost / (1 - consultingFeePercent/100)
 * This solves the circular dependency where consulting fee is % of loan
 */
export function calculateLoanAmount(
  numberOfCows: number,
  costPerCow: number,
  infrastructureTotal: number,
  consultingFeePercent: number
): number {
  const cattleTotal = numberOfCows * costPerCow;
  const baseCost = cattleTotal + infrastructureTotal;
  // Solve: loan = baseCost + loan * (feePercent/100)
  // loan * (1 - feePercent/100) = baseCost
  // loan = baseCost / (1 - feePercent/100)
  const divisor = 1 - consultingFeePercent / 100;
  if (divisor <= 0) {
    throw new Error("El porcentaje de consultoría no puede ser 100% o más");
  }
  return Math.round(baseCost / divisor);
}

/**
 * Calculate French amortization for the loan
 * Reuses logic from existing loan-calculations.ts
 */
function calculateLoanAmortization(
  input: RanchingProjectionInput
): LoanAmortizationRow[] {
  const { loan } = input;
  const principal = loan.loanAmount * (1 - loan.downPaymentPercent / 100);
  const monthlyRate = loan.annualInterestRate / 12 / 100;

  // Adjust term for grace period
  const paymentMonths = loan.loanTermMonths - loan.gracePeriodMonths;

  // Calculate monthly payment using French amortization formula
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = principal / paymentMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, paymentMonths);
    monthlyPayment = principal * ((monthlyRate * factor) / (factor - 1));
  }

  // Generate amortization table
  const amortizationTable: LoanAmortizationRow[] = [];
  let balance = principal;
  const startDate = input.startDate || new Date();

  for (let i = 1; i <= paymentMonths; i++) {
    const paymentDate = new Date(startDate);
    // Add grace period to payment date
    paymentDate.setMonth(paymentDate.getMonth() + loan.gracePeriodMonths + i);

    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    const endingBalance = Math.max(0, balance - principalPayment);

    // Handle rounding on last payment
    const isLastPayment = i === paymentMonths;
    const adjustedPayment = isLastPayment ? balance + interestPayment : monthlyPayment;
    const adjustedPrincipal = isLastPayment ? balance : principalPayment;
    const adjustedEndingBalance = isLastPayment ? 0 : endingBalance;

    amortizationTable.push({
      paymentNumber: i,
      paymentDate: paymentDate.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      beginningBalance: balance,
      payment: adjustedPayment,
      principal: adjustedPrincipal,
      interest: interestPayment,
      endingBalance: adjustedEndingBalance,
    });

    balance = adjustedEndingBalance;
  }

  return amortizationTable;
}

/**
 * Calculate investment summary
 * Note: Using IATF - no bulls in cattle total
 */
function calculateInvestmentSummary(
  input: RanchingProjectionInput,
  loanAmortization: LoanAmortizationRow[]
): InvestmentSummary {
  const { loan, infrastructure, cattle, consultingFee } = input;

  // Infrastructure total
  const infrastructureTotal =
    infrastructure.warehouseCost +
    infrastructure.cattleHandlingCost +
    infrastructure.officeCost +
    infrastructure.otherInfrastructureCost;

  // Cattle total (cows only - using IATF instead of bulls)
  const cattleTotal = cattle.numberOfCows * cattle.costPerCow;

  // Consulting fee
  const consultingFeeAmount = loan.loanAmount * (consultingFee.feePercent / 100);

  // Working capital (residual after infrastructure, cattle, and fees)
  const totalInvestment = infrastructureTotal + cattleTotal + consultingFeeAmount;
  const workingCapital = Math.max(0, loan.loanAmount - totalInvestment);

  // Down payment (own contribution)
  const ownContribution = loan.loanAmount * (loan.downPaymentPercent / 100);

  // Loan payments
  const monthlyLoanPayment = loanAmortization[0]?.payment ?? 0;
  const totalLoanPayment = loanAmortization.reduce((sum, row) => sum + row.payment, 0);
  const totalInterest = loanAmortization.reduce((sum, row) => sum + row.interest, 0);

  return {
    totalInitialInvestment: loan.loanAmount,
    loanAmount: loan.loanAmount * (1 - loan.downPaymentPercent / 100),
    ownContribution,
    infrastructureTotal,
    cattleTotal,
    consultingFee: consultingFeeAmount,
    workingCapital,
    monthlyLoanPayment,
    totalLoanPayment,
    totalInterest,
  };
}

/**
 * Main function to generate the complete projection
 */
export function generateRanchingProjection(
  input: RanchingProjectionInput
): RanchingProjectionResult {
  // Validate input
  const validation = validateInput(input);
  if (!validation.isValid) {
    throw new Error(
      `Datos inválidos: ${validation.errors.map((e) => e.message).join(", ")}`
    );
  }

  // 1. Calculate loan amortization
  const loanAmortization = calculateLoanAmortization(input);

  // 2. Calculate investment summary
  const investmentSummary = calculateInvestmentSummary(input, loanAmortization);

  // 3. Calculate herd projections
  const herdProjections = calculateHerdProjections(input);

  // 4. Calculate monthly calf inventory
  const calfInventory = calculateMonthlyCalfInventory(input, herdProjections);

  // 5. Calculate monthly cash flows
  const monthlyCashFlows = calculateMonthlyCashFlows(
    input,
    herdProjections,
    calfInventory,
    loanAmortization
  );

  // 6. Generate income statements
  const incomeStatements = generateIncomeStatements(
    input,
    monthlyCashFlows,
    herdProjections
  );

  // 7. Generate balance sheets
  const balanceSheets = generateBalanceSheets(
    input,
    monthlyCashFlows,
    herdProjections,
    incomeStatements
  );

  // 8. Generate cash flow statements
  const cashFlowStatements = generateCashFlowStatements(
    input,
    monthlyCashFlows,
    incomeStatements
  );

  // 9. Calculate DSCR
  const dscr = calculateDSCR(incomeStatements, monthlyCashFlows);

  // 10. Calculate financial metrics
  const metrics = calculateFinancialMetrics(
    input,
    cashFlowStatements,
    incomeStatements,
    dscr
  );

  return {
    input,
    investmentSummary,
    monthlyCashFlows,
    herdProjections,
    incomeStatements,
    balanceSheets,
    cashFlowStatements,
    loanAmortization,
    metrics,
    generatedAt: new Date(),
    version: "1.0.0",
  };
}

/**
 * Generate projection with default values
 */
export function generateDefaultProjection(): RanchingProjectionResult {
  return generateRanchingProjection(getDefaultInput());
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-MX").format(Math.round(value));
}

// lib/ranching-projection/financial-statements.ts
// Generate Income Statement, Balance Sheet, and Cash Flow Statement

import type {
  RanchingProjectionInput,
  MonthlyCashFlowRow,
  YearlyHerdSnapshot,
  IncomeStatementRow,
  BalanceSheetRow,
  CashFlowStatementRow,
} from "./types";
import {
  aggregateCashFlowsByYear,
  getTotalInterestForYear,
} from "./monthly-cashflow";
import { calculateHerdValue } from "./herd-calculations";

// Depreciation period for infrastructure (years)
const INFRASTRUCTURE_DEPRECIATION_YEARS = 20;

// Tax rate - Primary activities (agricultura, ganadería) are exempt from ISR in Mexico
const TAX_RATE = 0; // 0% - Actividades primarias exentas

/**
 * Generate Income Statements for each year
 */
export function generateIncomeStatements(
  input: RanchingProjectionInput,
  monthlyCashFlows: MonthlyCashFlowRow[],
  herdSnapshots: YearlyHerdSnapshot[]
): IncomeStatementRow[] {
  const statements: IncomeStatementRow[] = [];
  const yearlyAggregates = aggregateCashFlowsByYear(monthlyCashFlows);
  const { infrastructure, operatingCosts, projectionYears } = input;

  // Calculate infrastructure value for depreciation
  const infrastructureTotal =
    infrastructure.warehouseCost +
    infrastructure.cattleHandlingCost +
    infrastructure.officeCost +
    infrastructure.otherInfrastructureCost;
  const annualDepreciation = infrastructureTotal / INFRASTRUCTURE_DEPRECIATION_YEARS;

  for (let year = 1; year <= projectionYears; year++) {
    const yearData = yearlyAggregates.get(year);
    if (!yearData) continue;

    // Revenue
    const calfSalesRevenue = yearData.calfSalesRevenue;
    const cullCowSalesRevenue = yearData.cullCowRevenue;
    const totalRevenue = calfSalesRevenue + cullCowSalesRevenue;

    // Cost of Sales (variable costs)
    const variableCosts = yearData.variableCowCost;
    const calfFeedingCosts = yearData.calfFeedingCost;
    const totalCostOfSales = variableCosts + calfFeedingCosts;

    const grossProfit = totalRevenue - totalCostOfSales;
    const grossMarginPercent = totalRevenue > 0
      ? (grossProfit / totalRevenue) * 100
      : 0;

    // Operating Expenses (fixed costs)
    const monthsOperating = year === 1 ? 12 - input.timeline.constructionEndMonth - 1 : 12;
    const payrollExpense = operatingCosts.monthlyPayroll * monthsOperating;
    const servicesExpense = operatingCosts.monthlyServices * monthsOperating;
    const travelExpense = operatingCosts.monthlyTravel * monthsOperating;
    const maintenanceExpense = operatingCosts.monthlyMaintenance * monthsOperating;
    const utilitiesExpense = operatingCosts.monthlyUtilities * monthsOperating;
    const insuranceExpense = operatingCosts.annualInsurance;
    const otherOperatingExpense = operatingCosts.otherMonthlyFixed * monthsOperating;

    // Only depreciate after construction is complete
    const depreciationExpense = year === 1
      ? annualDepreciation * (monthsOperating / 12)
      : annualDepreciation;

    const totalOperatingExpenses =
      payrollExpense +
      servicesExpense +
      travelExpense +
      maintenanceExpense +
      utilitiesExpense +
      insuranceExpense +
      otherOperatingExpense +
      depreciationExpense;

    const operatingIncome = grossProfit - totalOperatingExpenses;
    const operatingMarginPercent = totalRevenue > 0
      ? (operatingIncome / totalRevenue) * 100
      : 0;

    // Interest expense
    const interestExpense = getTotalInterestForYear(monthlyCashFlows, year);

    const earningsBeforeTax = operatingIncome - interestExpense;

    // Income tax (only if profitable)
    const incomeTax = earningsBeforeTax > 0 ? earningsBeforeTax * TAX_RATE : 0;

    const netIncome = earningsBeforeTax - incomeTax;
    const netMarginPercent = totalRevenue > 0
      ? (netIncome / totalRevenue) * 100
      : 0;

    statements.push({
      year,
      calfSalesRevenue,
      cullCowSalesRevenue,
      totalRevenue,
      variableCosts,
      calfFeedingCosts,
      totalCostOfSales,
      grossProfit,
      grossMarginPercent,
      payrollExpense,
      servicesExpense,
      travelExpense,
      maintenanceExpense,
      utilitiesExpense,
      insuranceExpense,
      otherOperatingExpense,
      depreciationExpense,
      totalOperatingExpenses,
      operatingIncome,
      operatingMarginPercent,
      interestExpense,
      earningsBeforeTax,
      incomeTax,
      netIncome,
      netMarginPercent,
    });
  }

  return statements;
}

/**
 * Generate Balance Sheets for each year
 */
export function generateBalanceSheets(
  input: RanchingProjectionInput,
  monthlyCashFlows: MonthlyCashFlowRow[],
  herdSnapshots: YearlyHerdSnapshot[],
  incomeStatements: IncomeStatementRow[]
): BalanceSheetRow[] {
  const sheets: BalanceSheetRow[] = [];
  const { loan, infrastructure, cattle, consultingFee, projectionYears } = input;

  // Calculate initial values
  const infrastructureTotal =
    infrastructure.warehouseCost +
    infrastructure.cattleHandlingCost +
    infrastructure.officeCost +
    infrastructure.otherInfrastructureCost;
  const annualDepreciation = infrastructureTotal / INFRASTRUCTURE_DEPRECIATION_YEARS;

  const downPayment = loan.loanAmount * (loan.downPaymentPercent / 100);
  const consultingFeeAmount = loan.loanAmount * (consultingFee.feePercent / 100);

  let accumulatedDepreciation = 0;
  let retainedEarnings = 0;

  for (let year = 1; year <= projectionYears; year++) {
    // Get year-end values from monthly cash flows
    const yearEndMonth = year * 12 - 1;
    const yearEndCashFlow = monthlyCashFlows.find((cf) => cf.month === yearEndMonth);
    const herdSnapshot = herdSnapshots[year - 1];
    const incomeStatement = incomeStatements[year - 1];

    // === ASSETS ===

    // Cash (cumulative cash flow)
    const cash = yearEndCashFlow?.cumulativeCashFlow ?? 0;

    // Accounts receivable (assume 1 month of sales)
    const monthlyRevenue = incomeStatement
      ? incomeStatement.totalRevenue / 12
      : 0;
    const accountsReceivable = monthlyRevenue;

    // Inventory (1 month of feed/supplies)
    const monthlyOperating = yearEndCashFlow
      ? (yearEndCashFlow.variableCowCost + yearEndCashFlow.calfFeedingCost)
      : 0;
    const inventory = monthlyOperating;

    const totalCurrentAssets = cash + accountsReceivable + inventory;

    // Fixed Assets
    const infrastructureGross = year === 1 ? infrastructureTotal : infrastructureTotal;

    // Livestock value (biological asset - cows only, using IATF)
    const livestockValue = herdSnapshot
      ? calculateHerdValue(herdSnapshot, cattle.costPerCow)
      : cattle.numberOfCows * cattle.costPerCow;

    const equipmentValue = 0; // Not modeled separately

    // Accumulated depreciation
    if (year === 1) {
      const monthsOperating = 12 - input.timeline.constructionEndMonth - 1;
      accumulatedDepreciation = annualDepreciation * (monthsOperating / 12);
    } else {
      accumulatedDepreciation += annualDepreciation;
    }

    const totalFixedAssets =
      infrastructureGross + livestockValue + equipmentValue - accumulatedDepreciation;

    const totalAssets = totalCurrentAssets + totalFixedAssets;

    // === LIABILITIES ===

    // Accounts payable (1 month of operating costs)
    const accountsPayable = yearEndCashFlow?.fixedOperatingCost ?? 0;

    // Current portion of long-term debt (next year's principal)
    const loanBalanceEnd = yearEndCashFlow?.loanBalanceEnd ?? 0;
    const currentPortionLongTermDebt =
      year < projectionYears && loanBalanceEnd > 0
        ? Math.min(loanBalanceEnd, loan.loanAmount / (loan.loanTermMonths / 12))
        : loanBalanceEnd;

    const totalCurrentLiabilities = accountsPayable + currentPortionLongTermDebt;

    // Long-term debt
    const longTermDebt = Math.max(0, loanBalanceEnd - currentPortionLongTermDebt);
    const totalLongTermLiabilities = longTermDebt;

    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

    // === EQUITY ===

    // Paid-in capital (down payment)
    const paidInCapital = downPayment;

    // Current year earnings
    const currentYearEarnings = incomeStatement?.netIncome ?? 0;

    // Retained earnings (cumulative from prior years)
    if (year > 1) {
      retainedEarnings += incomeStatements[year - 2]?.netIncome ?? 0;
    }

    const totalEquity = paidInCapital + retainedEarnings + currentYearEarnings;

    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    sheets.push({
      year,
      cash,
      accountsReceivable,
      inventory,
      totalCurrentAssets,
      infrastructureGross,
      livestockValue,
      equipmentValue,
      accumulatedDepreciation,
      totalFixedAssets,
      totalAssets,
      accountsPayable,
      currentPortionLongTermDebt,
      totalCurrentLiabilities,
      longTermDebt,
      totalLongTermLiabilities,
      totalLiabilities,
      paidInCapital,
      retainedEarnings,
      currentYearEarnings,
      totalEquity,
      totalLiabilitiesAndEquity,
    });
  }

  return sheets;
}

/**
 * Generate Cash Flow Statements for each year
 */
export function generateCashFlowStatements(
  input: RanchingProjectionInput,
  monthlyCashFlows: MonthlyCashFlowRow[],
  incomeStatements: IncomeStatementRow[]
): CashFlowStatementRow[] {
  const statements: CashFlowStatementRow[] = [];
  const { loan, infrastructure, cattle, consultingFee, projectionYears } = input;
  const yearlyAggregates = aggregateCashFlowsByYear(monthlyCashFlows);

  // Calculate totals for investing section
  const infrastructureTotal =
    infrastructure.warehouseCost +
    infrastructure.cattleHandlingCost +
    infrastructure.officeCost +
    infrastructure.otherInfrastructureCost;
  // Cattle total (cows only - using IATF)
  const cattleTotal = cattle.numberOfCows * cattle.costPerCow;
  const consultingFeeAmount = loan.loanAmount * (consultingFee.feePercent / 100);

  let beginningCash = 0;

  for (let year = 1; year <= projectionYears; year++) {
    const incomeStatement = incomeStatements[year - 1];
    const yearData = yearlyAggregates.get(year);

    // === OPERATING ACTIVITIES ===
    const netIncome = incomeStatement?.netIncome ?? 0;
    const depreciation = incomeStatement?.depreciationExpense ?? 0;

    // Changes in working capital (simplified)
    const changesInWorkingCapital = year === 1 ? -(yearData?.fixedOperatingCost ?? 0) : 0;

    const netCashFromOperating = netIncome + depreciation + changesInWorkingCapital;

    // === INVESTING ACTIVITIES ===
    let infrastructureInvestment = 0;
    let cattlePurchases = 0;

    if (year === 1) {
      infrastructureInvestment = -(infrastructureTotal + consultingFeeAmount);
      cattlePurchases = -cattleTotal;
    }

    const netCashFromInvesting = infrastructureInvestment + cattlePurchases;

    // === FINANCING ACTIVITIES ===
    let loanProceeds = 0;
    let ownerContributions = 0;

    if (year === 1) {
      loanProceeds = loan.loanAmount * (1 - loan.downPaymentPercent / 100);
      ownerContributions = loan.loanAmount * (loan.downPaymentPercent / 100);
    }

    const loanRepayments = -(yearData?.principalPayment ?? 0);

    const netCashFromFinancing = loanProceeds + loanRepayments + ownerContributions;

    // === NET CHANGE ===
    const netCashChange = netCashFromOperating + netCashFromInvesting + netCashFromFinancing;
    const endingCash = beginningCash + netCashChange;

    statements.push({
      year,
      netIncome,
      depreciation,
      changesInWorkingCapital,
      netCashFromOperating,
      infrastructureInvestment,
      cattlePurchases,
      netCashFromInvesting,
      loanProceeds,
      loanRepayments,
      ownerContributions,
      netCashFromFinancing,
      netCashChange,
      beginningCash,
      endingCash,
    });

    beginningCash = endingCash;
  }

  return statements;
}

/**
 * Calculate Debt Service Coverage Ratio for each year
 * DSCR = (Net Income + Depreciation + Interest) / (Principal + Interest)
 */
export function calculateDSCR(
  incomeStatements: IncomeStatementRow[],
  monthlyCashFlows: MonthlyCashFlowRow[]
): number[] {
  const dscr: number[] = [];
  const yearlyAggregates = aggregateCashFlowsByYear(monthlyCashFlows);

  for (const statement of incomeStatements) {
    const yearData = yearlyAggregates.get(statement.year);
    const totalDebtService = (yearData?.loanPayment ?? 0);

    if (totalDebtService === 0) {
      dscr.push(0);
    } else {
      const cashAvailable =
        statement.netIncome +
        statement.depreciationExpense +
        statement.interestExpense;
      dscr.push(cashAvailable / totalDebtService);
    }
  }

  return dscr;
}

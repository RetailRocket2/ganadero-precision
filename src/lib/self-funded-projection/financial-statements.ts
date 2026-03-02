// lib/self-funded-projection/financial-statements.ts
// Income Statement, Balance Sheet, Cash Flow Statement — self-funded (no debt)

import type {
  SelfFundedProjectionInput,
  SelfFundedMonthlyCashFlowRow,
  YearlyHerdSnapshot,
  IncomeStatementRow,
  BalanceSheetRow,
  CashFlowStatementRow,
} from "./types";
import { aggregateCashFlowsByYear } from "./monthly-cashflow";
import { calculateHerdValue } from "./herd-calculations";
import { sumInfrastructure } from "./utils";

const INFRASTRUCTURE_DEPRECIATION_YEARS = 20;
const TAX_RATE = 0; // Actividades primarias exentas

/**
 * Generate Income Statements — no interest expense
 */
export function generateIncomeStatements(
  input: SelfFundedProjectionInput,
  monthlyCashFlows: SelfFundedMonthlyCashFlowRow[],
  herdSnapshots: YearlyHerdSnapshot[]
): IncomeStatementRow[] {
  const statements: IncomeStatementRow[] = [];
  const yearlyAggregates = aggregateCashFlowsByYear(monthlyCashFlows);
  const { infrastructure, operatingCosts, projectionYears } = input;

  const infrastructureTotal = sumInfrastructure(infrastructure);
  const annualDepreciation = infrastructureTotal / INFRASTRUCTURE_DEPRECIATION_YEARS;

  for (let year = 1; year <= projectionYears; year++) {
    const yearData = yearlyAggregates.get(year);
    if (!yearData) continue;

    const calfSalesRevenue = yearData.calfSalesRevenue;
    const cullCowSalesRevenue = yearData.cullCowRevenue;
    const totalRevenue = calfSalesRevenue + cullCowSalesRevenue;

    const variableCosts = yearData.variableCowCost;
    const calfFeedingCosts = yearData.calfFeedingCost;
    const totalCostOfSales = variableCosts + calfFeedingCosts;

    const grossProfit = totalRevenue - totalCostOfSales;
    const grossMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const monthsOperating = year === 1 ? 12 - input.timeline.constructionEndMonth - 1 : 12;
    const payrollExpense = operatingCosts.monthlyPayroll * monthsOperating;
    const servicesExpense = operatingCosts.monthlyServices * monthsOperating;
    const travelExpense = operatingCosts.monthlyTravel * monthsOperating;
    const maintenanceExpense = operatingCosts.monthlyMaintenance * monthsOperating;
    const utilitiesExpense = operatingCosts.monthlyUtilities * monthsOperating;
    const insuranceExpense = operatingCosts.annualInsurance;
    const otherOperatingExpense = operatingCosts.otherMonthlyFixed * monthsOperating;

    const depreciationExpense = year === 1
      ? annualDepreciation * (monthsOperating / 12)
      : annualDepreciation;

    const totalOperatingExpenses =
      payrollExpense + servicesExpense + travelExpense +
      maintenanceExpense + utilitiesExpense + insuranceExpense +
      otherOperatingExpense + depreciationExpense;

    const operatingIncome = grossProfit - totalOperatingExpenses;
    const operatingMarginPercent = totalRevenue > 0 ? (operatingIncome / totalRevenue) * 100 : 0;

    // No interest expense — self-funded
    const earningsBeforeTax = operatingIncome;
    const incomeTax = earningsBeforeTax > 0 ? earningsBeforeTax * TAX_RATE : 0;
    const netIncome = earningsBeforeTax - incomeTax;
    const netMarginPercent = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

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
      earningsBeforeTax,
      incomeTax,
      netIncome,
      netMarginPercent,
    });
  }

  return statements;
}

/**
 * Generate Balance Sheets — no debt, paidInCapital = totalCashRequired
 *
 * The balance sheet MUST satisfy: Assets = Liabilities + Equity.
 * We compute Assets and Liabilities from the model, then derive
 * retainedEarnings as the plug so the identity always holds.
 */
export function generateBalanceSheets(
  input: SelfFundedProjectionInput,
  monthlyCashFlows: SelfFundedMonthlyCashFlowRow[],
  herdSnapshots: YearlyHerdSnapshot[],
  incomeStatements: IncomeStatementRow[],
  totalCashRequired: number
): BalanceSheetRow[] {
  const sheets: BalanceSheetRow[] = [];
  const { infrastructure, cattle, projectionYears } = input;

  const infrastructureTotal = sumInfrastructure(infrastructure);
  const annualDepreciation = infrastructureTotal / INFRASTRUCTURE_DEPRECIATION_YEARS;

  let accumulatedDepreciation = 0;

  for (let year = 1; year <= projectionYears; year++) {
    const yearEndMonth = year * 12 - 1;
    const yearEndCashFlow = monthlyCashFlows.find((cf) => cf.month === yearEndMonth);
    const herdSnapshot = herdSnapshots[year - 1];
    const incomeStatement = incomeStatements[year - 1];

    // === ASSETS ===
    const cash = yearEndCashFlow?.cumulativeCashFlow ?? 0;
    const accountsReceivable = 0; // cash-basis projection — no receivables
    const inventory = 0;          // livestock counted in fixed assets
    const totalCurrentAssets = cash;

    const infrastructureGross = infrastructureTotal;
    const livestockValue = herdSnapshot
      ? calculateHerdValue(herdSnapshot, cattle.costPerCow)
      : cattle.numberOfCows * cattle.costPerCow;
    const equipmentValue = 0;

    if (year === 1) {
      const monthsOperating = 12 - input.timeline.constructionEndMonth - 1;
      accumulatedDepreciation = annualDepreciation * (monthsOperating / 12);
    } else {
      accumulatedDepreciation += annualDepreciation;
    }

    const totalFixedAssets = infrastructureGross + livestockValue + equipmentValue - accumulatedDepreciation;
    const totalAssets = totalCurrentAssets + totalFixedAssets;

    // === LIABILITIES — no bank debt ===
    const accountsPayable = 0; // cash-basis — no payables
    const totalCurrentLiabilities = accountsPayable;
    const totalLiabilities = totalCurrentLiabilities;

    // === EQUITY ===
    // paidInCapital is fixed; retainedEarnings is the plug so Assets = L + E
    const paidInCapital = totalCashRequired;
    const currentYearEarnings = incomeStatement?.netIncome ?? 0;
    // retainedEarnings = totalAssets - totalLiabilities - paidInCapital - currentYearEarnings
    const retainedEarnings = totalAssets - totalLiabilities - paidInCapital - currentYearEarnings;
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
      totalCurrentLiabilities,
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
 * Generate Cash Flow Statements — no loan proceeds/repayments
 */
export function generateCashFlowStatements(
  input: SelfFundedProjectionInput,
  monthlyCashFlows: SelfFundedMonthlyCashFlowRow[],
  incomeStatements: IncomeStatementRow[],
  totalCashRequired: number
): CashFlowStatementRow[] {
  const statements: CashFlowStatementRow[] = [];
  const { infrastructure, cattle, consultingFee, projectionYears } = input;
  const yearlyAggregates = aggregateCashFlowsByYear(monthlyCashFlows);

  const infrastructureTotal = sumInfrastructure(infrastructure);
  const cattleTotal = cattle.numberOfCows * cattle.costPerCow;
  const baseCost = cattleTotal + infrastructureTotal;
  const consultingFeeAmount = baseCost * (consultingFee.feePercent / 100);

  let beginningCash = 0;

  for (let year = 1; year <= projectionYears; year++) {
    const incomeStatement = incomeStatements[year - 1];
    const yearData = yearlyAggregates.get(year);

    const netIncome = incomeStatement?.netIncome ?? 0;
    const depreciation = incomeStatement?.depreciationExpense ?? 0;
    const changesInWorkingCapital = year === 1 ? -(yearData?.fixedOperatingCost ?? 0) : 0;
    const netCashFromOperating = netIncome + depreciation + changesInWorkingCapital;

    let infrastructureInvestment = 0;
    let cattlePurchases = 0;
    if (year === 1) {
      infrastructureInvestment = -(infrastructureTotal + consultingFeeAmount);
      cattlePurchases = -cattleTotal;
    }
    const netCashFromInvesting = infrastructureInvestment + cattlePurchases;

    // Financing: owner contributes full capital in year 1
    const ownerContributions = year === 1 ? totalCashRequired : 0;
    const netCashFromFinancing = ownerContributions;

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

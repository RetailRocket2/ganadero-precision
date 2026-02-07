// lib/ranching-projection/monthly-cashflow.ts
// Monthly cash flow engine for detailed projection

import type {
  RanchingProjectionInput,
  MonthlyCashFlowRow,
  YearlyHerdSnapshot,
  LoanAmortizationRow,
} from "./types";
import type { MonthlyCalfInventory } from "./herd-calculations";

/**
 * Calculate monthly cash flows for the entire projection period
 */
export function calculateMonthlyCashFlows(
  input: RanchingProjectionInput,
  herdSnapshots: YearlyHerdSnapshot[],
  calfInventory: MonthlyCalfInventory[],
  loanAmortization: LoanAmortizationRow[]
): MonthlyCashFlowRow[] {
  const cashFlows: MonthlyCashFlowRow[] = [];
  const {
    loan,
    infrastructure,
    cattle,
    timeline,
    operatingCosts,
    revenue,
    consultingFee,
    projectionYears,
  } = input;

  const totalMonths = projectionYears * 12;
  let cumulativeCashFlow = 0;

  // Calculate infrastructure cost per construction month
  const infrastructureTotal =
    infrastructure.warehouseCost +
    infrastructure.cattleHandlingCost +
    infrastructure.officeCost +
    infrastructure.otherInfrastructureCost;
  const constructionMonths = infrastructure.constructionMonths;
  const infrastructureCostPerMonth = infrastructureTotal / constructionMonths;

  // Calculate cattle purchase cost (cows only - using IATF)
  const cattleTotal = cattle.numberOfCows * cattle.costPerCow;

  // Calculate consulting fee
  const consultingFeeAmount = loan.loanAmount * (consultingFee.feePercent / 100);

  // Calculate fixed operating costs per month
  const monthlyFixedCosts =
    operatingCosts.monthlyPayroll +
    operatingCosts.monthlyServices +
    operatingCosts.monthlyTravel +
    operatingCosts.monthlyMaintenance +
    operatingCosts.monthlyUtilities +
    operatingCosts.annualInsurance / 12 +
    operatingCosts.otherMonthlyFixed;

  // Calculate variable cow cost per month
  const variableCowCostPerMonth = operatingCosts.variableCostPerCowYear / 12;

  // Track loan balance
  let loanBalance = loan.loanAmount * (1 - loan.downPaymentPercent / 100);

  for (let month = 0; month < totalMonths; month++) {
    const year = Math.floor(month / 12) + 1;
    const monthInYear = (month % 12) + 1;

    // Get calf inventory for this month
    const calfInv = calfInventory.find((c) => c.month === month);
    const calvesStart = calfInv?.calvesStart ?? 0;
    const calvesBorn = calfInv?.calvesBorn ?? 0;
    const calvesSold = calfInv?.calvesSold ?? 0;
    const calvesEnd = calfInv?.calvesEnd ?? 0;
    const calfFeedingCost = calfInv?.calfFeedingCost ?? 0;

    // Get herd snapshot for this year
    const herdSnapshot = herdSnapshots[year - 1];
    const cowCount = herdSnapshot?.cowsStart ?? cattle.numberOfCows;

    // === REVENUES ===
    let calfSalesRevenue = 0;
    let cullCowRevenue = 0;

    // Price escalation for years 2+
    const priceMultiplier = Math.pow(
      1 + revenue.annualPriceIncreasePercent / 100,
      year - 1
    );
    // Fixed prices per head (breeding operation)
    const maleCalfPrice = revenue.maleCalfPrice * priceMultiplier;
    const femaleCalfPrice = revenue.femaleCalfPrice * priceMultiplier;
    const cullCowPrice = revenue.cullCowPrice * priceMultiplier;

    // Calf sales revenue - calculate based on male/female ratio from herd snapshot
    if (calvesSold > 0 && herdSnapshot) {
      const totalCalvesSoldYear = herdSnapshot.maleCalvesSold + herdSnapshot.femaleCalvesSold;
      if (totalCalvesSoldYear > 0) {
        const maleRatio = herdSnapshot.maleCalvesSold / totalCalvesSoldYear;
        const femaleRatio = herdSnapshot.femaleCalvesSold / totalCalvesSoldYear;
        const maleRevenue = calvesSold * maleRatio * maleCalfPrice;
        const femaleRevenue = calvesSold * femaleRatio * femaleCalfPrice;
        calfSalesRevenue = maleRevenue + femaleRevenue;
      }
    }

    // Cull cow revenue (distributed evenly during harvest season)
    if (herdSnapshot && year === 1) {
      // Year 1: Cull cows sold during harvest season
      if (month >= timeline.harvestSeasonStart && month <= timeline.harvestSeasonEnd) {
        const harvestMonths = timeline.harvestSeasonEnd - timeline.harvestSeasonStart + 1;
        const cullCowsThisMonth = herdSnapshot.cullCowsSold / harvestMonths;
        cullCowRevenue = cullCowsThisMonth * cullCowPrice;
      }
    } else if (herdSnapshot && year > 1) {
      // Years 2+: Cull cows sold in last 3 months of year
      if (monthInYear >= 10 && monthInYear <= 12) {
        const cullCowsThisMonth = herdSnapshot.cullCowsSold / 3;
        cullCowRevenue = cullCowsThisMonth * cullCowPrice;
      }
    }

    const totalRevenue = calfSalesRevenue + cullCowRevenue;

    // === COSTS ===
    let infrastructureCost = 0;
    let cattlePurchaseCost = 0;
    let variableCowCost = 0;
    let fixedOperatingCost = 0;
    let loanPayment = 0;
    let interestPayment = 0;
    let principalPayment = 0;

    // Infrastructure costs during construction (month 0 to constructionMonths-1)
    if (month >= timeline.constructionStartMonth && month <= timeline.constructionEndMonth) {
      infrastructureCost = infrastructureCostPerMonth;
    }

    // Consulting fee paid at month 0
    if (month === 0) {
      infrastructureCost += consultingFeeAmount;
    }

    // Cattle purchase in specified month
    if (month === timeline.cattlePurchaseMonth) {
      cattlePurchaseCost = cattleTotal;
    }

    // Variable cow costs start after cattle purchase
    if (month > timeline.cattlePurchaseMonth) {
      variableCowCost = cowCount * variableCowCostPerMonth;
    }

    // Fixed operating costs start after construction
    if (month > timeline.constructionEndMonth) {
      fixedOperatingCost = monthlyFixedCosts;
    }

    // Loan payments (after grace period)
    const loanBalanceStart = loanBalance;
    if (month >= loan.gracePeriodMonths && month < loan.loanTermMonths) {
      // Find the matching amortization row
      const amortRow = loanAmortization[month - loan.gracePeriodMonths];
      if (amortRow) {
        loanPayment = amortRow.payment;
        interestPayment = amortRow.interest;
        principalPayment = amortRow.principal;
        loanBalance = Math.max(0, loanBalance - principalPayment);
      }
    }

    const totalCosts =
      infrastructureCost +
      cattlePurchaseCost +
      variableCowCost +
      calfFeedingCost +
      fixedOperatingCost +
      loanPayment;

    // === NET CASH FLOW ===
    // Month 0 receives loan proceeds
    const loanProceeds = month === 0 ? loan.loanAmount * (1 - loan.downPaymentPercent / 100) : 0;
    const downPaymentContribution = month === 0 ? loan.loanAmount * (loan.downPaymentPercent / 100) : 0;

    const netCashFlow = totalRevenue - totalCosts + loanProceeds + downPaymentContribution;
    cumulativeCashFlow += netCashFlow;

    cashFlows.push({
      month,
      year,
      monthInYear,
      calvesStart,
      calvesBorn,
      calvesSold,
      calvesEnd,
      calfSalesRevenue,
      cullCowRevenue,
      totalRevenue,
      infrastructureCost,
      cattlePurchaseCost,
      variableCowCost,
      calfFeedingCost,
      fixedOperatingCost,
      loanPayment,
      interestPayment,
      principalPayment,
      totalCosts,
      netCashFlow,
      cumulativeCashFlow,
      loanBalanceStart,
      loanBalanceEnd: loanBalance,
    });
  }

  return cashFlows;
}

/**
 * Aggregate monthly cash flows by year
 */
export function aggregateCashFlowsByYear(
  monthlyCashFlows: MonthlyCashFlowRow[]
): Map<number, MonthlyCashFlowRow> {
  const yearlyAggregates = new Map<number, MonthlyCashFlowRow>();

  for (const monthly of monthlyCashFlows) {
    const existing = yearlyAggregates.get(monthly.year);

    if (!existing) {
      yearlyAggregates.set(monthly.year, {
        ...monthly,
        month: -1, // Indicates yearly aggregate
        monthInYear: -1,
      });
    } else {
      // Aggregate values
      existing.calvesBorn += monthly.calvesBorn;
      existing.calvesSold += monthly.calvesSold;
      existing.calvesEnd = monthly.calvesEnd; // Take last month's ending
      existing.calfSalesRevenue += monthly.calfSalesRevenue;
      existing.cullCowRevenue += monthly.cullCowRevenue;
      existing.totalRevenue += monthly.totalRevenue;
      existing.infrastructureCost += monthly.infrastructureCost;
      existing.cattlePurchaseCost += monthly.cattlePurchaseCost;
      existing.variableCowCost += monthly.variableCowCost;
      existing.calfFeedingCost += monthly.calfFeedingCost;
      existing.fixedOperatingCost += monthly.fixedOperatingCost;
      existing.loanPayment += monthly.loanPayment;
      existing.interestPayment += monthly.interestPayment;
      existing.principalPayment += monthly.principalPayment;
      existing.totalCosts += monthly.totalCosts;
      existing.netCashFlow += monthly.netCashFlow;
      existing.cumulativeCashFlow = monthly.cumulativeCashFlow;
      existing.loanBalanceEnd = monthly.loanBalanceEnd;
    }
  }

  return yearlyAggregates;
}

/**
 * Get cash flows for a specific year
 */
export function getCashFlowsForYear(
  monthlyCashFlows: MonthlyCashFlowRow[],
  year: number
): MonthlyCashFlowRow[] {
  return monthlyCashFlows.filter((cf) => cf.year === year);
}

/**
 * Calculate total revenue for a year
 */
export function getTotalRevenueForYear(
  monthlyCashFlows: MonthlyCashFlowRow[],
  year: number
): number {
  return getCashFlowsForYear(monthlyCashFlows, year).reduce(
    (sum, cf) => sum + cf.totalRevenue,
    0
  );
}

/**
 * Calculate total costs for a year
 */
export function getTotalCostsForYear(
  monthlyCashFlows: MonthlyCashFlowRow[],
  year: number
): number {
  return getCashFlowsForYear(monthlyCashFlows, year).reduce(
    (sum, cf) => sum + cf.totalCosts,
    0
  );
}

/**
 * Calculate total interest paid for a year
 */
export function getTotalInterestForYear(
  monthlyCashFlows: MonthlyCashFlowRow[],
  year: number
): number {
  return getCashFlowsForYear(monthlyCashFlows, year).reduce(
    (sum, cf) => sum + cf.interestPayment,
    0
  );
}

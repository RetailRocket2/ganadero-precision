// lib/self-funded-projection/monthly-cashflow.ts
// Monthly cash flow engine — self-funded (no loan)

import type {
  SelfFundedProjectionInput,
  SelfFundedMonthlyCashFlowRow,
  YearlyHerdSnapshot,
} from "./types";
import type { MonthlyCalfInventory } from "./herd-calculations";
import { sumInfrastructure } from "./utils";

/**
 * Calculate monthly cash flows for the entire projection period
 * Month 0: owner injects full capital. No loan.
 */
export function calculateMonthlyCashFlows(
  input: SelfFundedProjectionInput,
  herdSnapshots: YearlyHerdSnapshot[],
  calfInventory: MonthlyCalfInventory[]
): SelfFundedMonthlyCashFlowRow[] {
  const cashFlows: SelfFundedMonthlyCashFlowRow[] = [];
  const {
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

  // Infrastructure total via utility
  const infrastructureTotal = sumInfrastructure(infrastructure);
  const constructionMonths = infrastructure.constructionMonths;
  const infrastructureCostPerMonth = infrastructureTotal / constructionMonths;

  // Cattle total
  const cattleTotal = cattle.numberOfCows * cattle.costPerCow;

  // Consulting fee = % of (cattle + infra), not of loan
  const baseCost = cattleTotal + infrastructureTotal;
  const consultingFeeAmount = baseCost * (consultingFee.feePercent / 100);

  // Total capital the owner must inject
  const totalCashRequired = infrastructureTotal + cattleTotal + consultingFeeAmount;

  // Fixed operating costs per month
  const monthlyFixedCosts =
    operatingCosts.monthlyPayroll +
    operatingCosts.monthlyServices +
    operatingCosts.monthlyTravel +
    operatingCosts.monthlyMaintenance +
    operatingCosts.monthlyUtilities +
    operatingCosts.annualInsurance / 12 +
    operatingCosts.otherMonthlyFixed;

  const variableCowCostPerMonth = operatingCosts.variableCostPerCowYear / 12;

  for (let month = 0; month < totalMonths; month++) {
    const year = Math.floor(month / 12) + 1;
    const monthInYear = (month % 12) + 1;

    const calfInv = calfInventory.find((c) => c.month === month);
    const calvesStart = calfInv?.calvesStart ?? 0;
    const calvesBorn = calfInv?.calvesBorn ?? 0;
    const calvesSold = calfInv?.calvesSold ?? 0;
    const calvesEnd = calfInv?.calvesEnd ?? 0;
    const calfFeedingCost = calfInv?.calfFeedingCost ?? 0;

    const herdSnapshot = herdSnapshots[year - 1];
    const cowCount = herdSnapshot?.cowsStart ?? cattle.numberOfCows;

    // === REVENUES ===
    let calfSalesRevenue = 0;
    let cullCowRevenue = 0;

    const priceMultiplier = Math.pow(
      1 + revenue.annualPriceIncreasePercent / 100,
      year - 1
    );
    const maleCalfPrice = revenue.maleCalfPrice * priceMultiplier;
    const femaleCalfPrice = revenue.femaleCalfPrice * priceMultiplier;
    const cullCowPrice = revenue.cullCowPrice * priceMultiplier;

    if (calvesSold > 0 && herdSnapshot) {
      const totalCalvesSoldYear = herdSnapshot.maleCalvesSold + herdSnapshot.femaleCalvesSold;
      if (totalCalvesSoldYear > 0) {
        const maleRatio = herdSnapshot.maleCalvesSold / totalCalvesSoldYear;
        const femaleRatio = herdSnapshot.femaleCalvesSold / totalCalvesSoldYear;
        calfSalesRevenue = calvesSold * maleRatio * maleCalfPrice + calvesSold * femaleRatio * femaleCalfPrice;
      }
    }

    if (herdSnapshot && year === 1) {
      if (month >= timeline.harvestSeasonStart && month <= timeline.harvestSeasonEnd) {
        const harvestMonths = timeline.harvestSeasonEnd - timeline.harvestSeasonStart + 1;
        cullCowRevenue = (herdSnapshot.cullCowsSold / harvestMonths) * cullCowPrice;
      }
    } else if (herdSnapshot && year > 1) {
      if (monthInYear >= 10 && monthInYear <= 12) {
        cullCowRevenue = (herdSnapshot.cullCowsSold / 3) * cullCowPrice;
      }
    }

    const totalRevenue = calfSalesRevenue + cullCowRevenue;

    // === COSTS ===
    let infrastructureCost = 0;
    let cattlePurchaseCost = 0;
    let variableCowCost = 0;
    let fixedOperatingCost = 0;

    // Infrastructure during construction
    if (month >= timeline.constructionStartMonth && month <= timeline.constructionEndMonth) {
      infrastructureCost = infrastructureCostPerMonth;
    }

    // Consulting fee at month 0
    if (month === 0) {
      infrastructureCost += consultingFeeAmount;
    }

    // Cattle purchase
    if (month === timeline.cattlePurchaseMonth) {
      cattlePurchaseCost = cattleTotal;
    }

    // Variable costs after purchase
    if (month > timeline.cattlePurchaseMonth) {
      variableCowCost = cowCount * variableCowCostPerMonth;
    }

    // Fixed costs after construction
    if (month > timeline.constructionEndMonth) {
      fixedOperatingCost = monthlyFixedCosts;
    }

    const totalCosts =
      infrastructureCost +
      cattlePurchaseCost +
      variableCowCost +
      calfFeedingCost +
      fixedOperatingCost;

    // === NET CASH FLOW ===
    // Month 0: owner injects full capital
    const ownerInjection = month === 0 ? totalCashRequired : 0;

    const netCashFlow = totalRevenue - totalCosts + ownerInjection;
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
      totalCosts,
      netCashFlow,
      cumulativeCashFlow,
    });
  }

  return cashFlows;
}

/**
 * Aggregate monthly cash flows by year
 */
export function aggregateCashFlowsByYear(
  monthlyCashFlows: SelfFundedMonthlyCashFlowRow[]
): Map<number, SelfFundedMonthlyCashFlowRow> {
  const yearlyAggregates = new Map<number, SelfFundedMonthlyCashFlowRow>();

  for (const monthly of monthlyCashFlows) {
    const existing = yearlyAggregates.get(monthly.year);

    if (!existing) {
      yearlyAggregates.set(monthly.year, {
        ...monthly,
        month: -1,
        monthInYear: -1,
      });
    } else {
      existing.calvesBorn += monthly.calvesBorn;
      existing.calvesSold += monthly.calvesSold;
      existing.calvesEnd = monthly.calvesEnd;
      existing.calfSalesRevenue += monthly.calfSalesRevenue;
      existing.cullCowRevenue += monthly.cullCowRevenue;
      existing.totalRevenue += monthly.totalRevenue;
      existing.infrastructureCost += monthly.infrastructureCost;
      existing.cattlePurchaseCost += monthly.cattlePurchaseCost;
      existing.variableCowCost += monthly.variableCowCost;
      existing.calfFeedingCost += monthly.calfFeedingCost;
      existing.fixedOperatingCost += monthly.fixedOperatingCost;
      existing.totalCosts += monthly.totalCosts;
      existing.netCashFlow += monthly.netCashFlow;
      existing.cumulativeCashFlow = monthly.cumulativeCashFlow;
    }
  }

  return yearlyAggregates;
}

export function getCashFlowsForYear(
  monthlyCashFlows: SelfFundedMonthlyCashFlowRow[],
  year: number
): SelfFundedMonthlyCashFlowRow[] {
  return monthlyCashFlows.filter((cf) => cf.year === year);
}

export function getTotalRevenueForYear(
  monthlyCashFlows: SelfFundedMonthlyCashFlowRow[],
  year: number
): number {
  return getCashFlowsForYear(monthlyCashFlows, year).reduce(
    (sum, cf) => sum + cf.totalRevenue,
    0
  );
}

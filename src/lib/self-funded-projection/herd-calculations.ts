// lib/self-funded-projection/herd-calculations.ts
// Herd growth calculations with per-year heifersRetained and cowCullRate

import type {
  SelfFundedProjectionInput,
  YearlyHerdSnapshot,
} from "./types";

/**
 * Calculate yearly herd snapshots
 * Reads heifersRetained[year-1] and cowCullRate[year-1] per year
 */
export function calculateHerdProjections(
  input: SelfFundedProjectionInput
): YearlyHerdSnapshot[] {
  const snapshots: YearlyHerdSnapshot[] = [];
  const { cattle, herd, projectionYears } = input;

  let cows = cattle.numberOfCows;
  let heifers = 0;

  const heiferMaturityQueue: number[] = [0, 0];

  for (let year = 1; year <= projectionYears; year++) {
    const cowsStart = cows;
    const heifersStart = heifers;

    // Per-year calvingRate
    const yearCalvingRate = herd.calvingRate[year - 1] ?? 85;
    const calvesTotal = Math.round(cows * (yearCalvingRate / 100));
    const calfDeaths = Math.round(calvesTotal * (herd.calfMortalityRate / 100));
    const calvesAfterMortality = calvesTotal - calfDeaths;

    const maleCalves = Math.round(calvesAfterMortality * (herd.maleCalfPercent / 100));
    const femaleCalves = calvesAfterMortality - maleCalves;

    // Per-year heifersRetained (% of cowsStart)
    const yearHeifersRetainedPct = herd.heifersRetained[year - 1] ?? 0;
    const heifersRetained = Math.min(Math.round(cowsStart * (yearHeifersRetainedPct / 100)), femaleCalves);

    const heifersMaturing = year >= 3 ? heiferMaturityQueue[1] : 0;

    const adultDeaths = Math.round(cows * (herd.adultMortalityRate / 100));

    // Per-year cowCullRate — direct percentage
    const yearCullRate = herd.cowCullRate[year - 1] ?? 0;
    const cowsCulled = Math.round(cowsStart * (yearCullRate / 100));

    const maleCalvesSold = maleCalves;
    const femaleCalvesSold = femaleCalves - heifersRetained;
    const cullCowsSold = cowsCulled;

    const cowsEnd = Math.max(0, cowsStart + heifersMaturing - cowsCulled - adultDeaths);
    const heifersEnd = Math.max(0, heifersStart + heifersRetained - heifersMaturing);
    const totalHerdEnd = cowsEnd + heifersEnd;

    heiferMaturityQueue.unshift(heifersRetained);
    heiferMaturityQueue.pop();

    snapshots.push({
      year,
      cowsStart,
      heifersStart,
      calvesTotal,
      calvesAfterMortality,
      maleCalves,
      femaleCalves,
      heifersMaturing,
      cowsCulled,
      heifersRetained,
      calfDeaths,
      adultDeaths,
      cowsEnd,
      heifersEnd,
      totalHerdEnd,
      maleCalvesSold,
      femaleCalvesSold,
      cullCowsSold,
    });

    cows = cowsEnd;
    heifers = heifersEnd;
  }

  return snapshots;
}

/**
 * Monthly calf inventory
 */
export interface MonthlyCalfInventory {
  month: number;
  yearMonth: number;
  year: number;
  calvesStart: number;
  calvesBorn: number;
  calvesSold: number;
  calvesEnd: number;
  calfFeedingCost: number;
}

export function calculateMonthlyCalfInventory(
  input: SelfFundedProjectionInput,
  herdSnapshots: YearlyHerdSnapshot[]
): MonthlyCalfInventory[] {
  const inventory: MonthlyCalfInventory[] = [];
  const { timeline, operatingCosts, projectionYears } = input;
  const totalMonths = projectionYears * 12;

  let currentCalves = 0;

  for (let month = 0; month < totalMonths; month++) {
    const year = Math.floor(month / 12) + 1;
    const yearMonth = (month % 12) + 1;

    const yearSnapshot = herdSnapshots[year - 1];
    if (!yearSnapshot) continue;

    const calvesStart = currentCalves;
    let calvesBorn = 0;
    let calvesSold = 0;

    if (year === 1) {
      if (month >= timeline.calvingSeasonStart && month <= timeline.calvingSeasonEnd) {
        const calvingMonths = timeline.calvingSeasonEnd - timeline.calvingSeasonStart + 1;
        const sellableCalves = yearSnapshot.maleCalvesSold + yearSnapshot.femaleCalvesSold;
        calvesBorn = Math.round(sellableCalves / calvingMonths);
        if (month === timeline.calvingSeasonEnd) {
          const alreadyBorn = Math.round(sellableCalves / calvingMonths) * (calvingMonths - 1);
          calvesBorn = sellableCalves - alreadyBorn;
        }
      }
    } else {
      if (yearMonth >= 1 && yearMonth <= 6) {
        const calvingMonthsInYear = 6;
        const sellableCalves = yearSnapshot.maleCalvesSold + yearSnapshot.femaleCalvesSold;
        calvesBorn = Math.round(sellableCalves / calvingMonthsInYear);
        if (yearMonth === 6) {
          const alreadyBorn = Math.round(sellableCalves / calvingMonthsInYear) * 5;
          calvesBorn = sellableCalves - alreadyBorn;
        }
      }
    }

    if (year === 1) {
      if (month >= timeline.harvestSeasonStart && month <= timeline.harvestSeasonEnd) {
        const harvestMonths = timeline.harvestSeasonEnd - timeline.harvestSeasonStart + 1;
        const totalToSell = yearSnapshot.maleCalvesSold + yearSnapshot.femaleCalvesSold;
        calvesSold = Math.round(totalToSell / harvestMonths);
        if (month === timeline.harvestSeasonEnd) {
          const alreadySold = Math.round(totalToSell / harvestMonths) * (harvestMonths - 1);
          calvesSold = totalToSell - alreadySold;
        }
      }
    } else {
      if (yearMonth >= 7 && yearMonth <= 12) {
        const harvestMonthsInYear = 6;
        const totalToSell = yearSnapshot.maleCalvesSold + yearSnapshot.femaleCalvesSold;
        calvesSold = Math.round(totalToSell / harvestMonthsInYear);
        if (yearMonth === 12) {
          const alreadySold = Math.round(totalToSell / harvestMonthsInYear) * 5;
          calvesSold = totalToSell - alreadySold;
        }
      }
    }

    calvesSold = Math.min(calvesSold, calvesStart + calvesBorn);
    const calvesEnd = Math.max(0, calvesStart + calvesBorn - calvesSold);
    const avgCalves = (calvesStart + calvesEnd) / 2;
    const calfFeedingCost = Math.round(avgCalves * operatingCosts.calfFeedingCostMonth);

    inventory.push({
      month,
      yearMonth,
      year,
      calvesStart,
      calvesBorn,
      calvesSold,
      calvesEnd,
      calfFeedingCost,
    });

    currentCalves = calvesEnd;
  }

  return inventory;
}

export function calculateHerdValue(
  snapshot: YearlyHerdSnapshot,
  costPerCow: number
): number {
  const cowValue = snapshot.cowsEnd * costPerCow;
  const heiferValue = snapshot.heifersEnd * (costPerCow * 0.8);
  return cowValue + heiferValue;
}

export function getTotalCalvesSoldInYear(
  snapshot: YearlyHerdSnapshot
): number {
  return snapshot.maleCalvesSold + snapshot.femaleCalvesSold;
}

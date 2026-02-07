// lib/ranching-projection/herd-calculations.ts
// Herd growth and inventory calculations

import type {
  RanchingProjectionInput,
  YearlyHerdSnapshot,
} from "./types";

/**
 * Calculate yearly herd snapshots for the projection period
 * Tracks cow inventory, calving, retention, culling, and sales
 * Note: Using IATF (no bulls in herd)
 *
 * Culling strategy: Maintains target herd size (initial cow count).
 * - Years 1-2: No culling (no heifers mature yet)
 * - Year 3+: Cull only excess cows above target, capped by cull rate
 * - Formula: cull = max(0, cowsStart + heifersMaturing - mortality - targetSize)
 */
export function calculateHerdProjections(
  input: RanchingProjectionInput
): YearlyHerdSnapshot[] {
  const snapshots: YearlyHerdSnapshot[] = [];
  const { cattle, herd, projectionYears } = input;

  // Initial herd composition (no bulls - using IATF)
  let cows = cattle.numberOfCows;
  let heifers = 0; // Start with no heifers (purchased cows are mature)

  // Heifers maturing queue (takes ~2 years for heifer to become cow)
  const heiferMaturityQueue: number[] = [0, 0]; // [year-1, year-2]

  for (let year = 1; year <= projectionYears; year++) {
    // Beginning of year counts
    const cowsStart = cows;
    const heifersStart = heifers;

    // Calculate calves born based on calving rate
    const calvesTotal = Math.round(cows * (herd.calvingRate / 100));

    // Apply calf mortality
    const calfDeaths = Math.round(calvesTotal * (herd.calfMortalityRate / 100));
    const calvesAfterMortality = calvesTotal - calfDeaths;

    // Split by gender
    const maleCalves = Math.round(calvesAfterMortality * (herd.maleCalfPercent / 100));
    const femaleCalves = calvesAfterMortality - maleCalves;

    // Heifer retention (for herd replacement)
    // Use the specified number or the available female calves, whichever is less
    const heifersRetained = Math.min(herd.heifersRetained, femaleCalves);

    // Heifers maturing to cows (from 2 years ago)
    const heifersMaturing = year >= 3 ? heiferMaturityQueue[1] : 0;

    // Adult mortality (cows only - no bulls) - calculated first for culling decision
    const adultDeaths = Math.round(cows * (herd.adultMortalityRate / 100));

    // Cow culling - Only cull when heifers are available to replace
    // Goal: Maintain initial herd size (cattle.numberOfCows)
    // Formula: cull = max(0, cowsStart + heifersMaturing - mortality - targetSize)
    const targetCowCount = cattle.numberOfCows;
    const projectedWithoutCulling = cowsStart + heifersMaturing - adultDeaths;
    const maxCull = Math.round(cows * (herd.cowCullRate / 100));
    // Only cull the excess above target, but don't exceed normal cull rate
    const cowsCulled = Math.max(0, Math.min(projectedWithoutCulling - targetCowCount, maxCull));

    // Calculate sales
    // All male calves are sold
    const maleCalvesSold = maleCalves;
    // Female calves not retained are sold
    const femaleCalvesSold = femaleCalves - heifersRetained;
    // Culled cows are sold
    const cullCowsSold = cowsCulled;

    // Update end-of-year counts
    const cowsEnd = Math.max(0, cowsStart + heifersMaturing - cowsCulled - adultDeaths);
    const heifersEnd = Math.max(0, heifersStart + heifersRetained - heifersMaturing);

    const totalHerdEnd = cowsEnd + heifersEnd;

    // Update heifer maturity queue for next year
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

    // Prepare for next year
    cows = cowsEnd;
    heifers = heifersEnd;
  }

  return snapshots;
}

/**
 * Calculate monthly calf inventory for a given year
 * Tracks births during calving season and sales during harvest season
 *
 * Based on domain expert input:
 * - Calving months: 7-12 (births evenly distributed)
 * - Harvest months: 13-21 (sales evenly distributed)
 * - Retained heifers stay in inventory
 */
export interface MonthlyCalfInventory {
  month: number;           // Absolute month (0-59)
  yearMonth: number;       // Month within year (1-12)
  year: number;            // Year (1-5)
  calvesStart: number;     // Calves at start of month
  calvesBorn: number;      // New calves this month
  calvesSold: number;      // Calves sold this month
  calvesEnd: number;       // Calves at end of month
  calfFeedingCost: number; // Feeding cost for this month
}

/**
 * Calculate monthly calf inventory for all projection months
 *
 * IMPORTANT: This tracks only SELLABLE calves (male + female to sell).
 * Retained heifers are removed from inventory when they are "retained" (end of calving season)
 * because they transition to the heifer herd and don't need calf feeding.
 *
 * Calf feeding cost only applies to calves 0-6 months old awaiting sale.
 */
export function calculateMonthlyCalfInventory(
  input: RanchingProjectionInput,
  herdSnapshots: YearlyHerdSnapshot[]
): MonthlyCalfInventory[] {
  const inventory: MonthlyCalfInventory[] = [];
  const { timeline, operatingCosts, projectionYears } = input;
  const totalMonths = projectionYears * 12;

  let currentCalves = 0;

  for (let month = 0; month < totalMonths; month++) {
    const year = Math.floor(month / 12) + 1;
    const yearMonth = (month % 12) + 1;

    // Get the herd snapshot for this year
    const yearSnapshot = herdSnapshots[year - 1];
    if (!yearSnapshot) continue;

    const calvesStart = currentCalves;
    let calvesBorn = 0;
    let calvesSold = 0;
    let heifersRemovedToRetention = 0;

    // Calving season: births distributed evenly
    // Only count SELLABLE calves (total born - retained heifers)
    if (year === 1) {
      // Year 1: Use timeline months directly
      if (month >= timeline.calvingSeasonStart && month <= timeline.calvingSeasonEnd) {
        const calvingMonths = timeline.calvingSeasonEnd - timeline.calvingSeasonStart + 1;
        // Only add sellable calves to inventory (exclude retained heifers)
        const sellableCalves = yearSnapshot.maleCalvesSold + yearSnapshot.femaleCalvesSold;
        calvesBorn = Math.round(sellableCalves / calvingMonths);

        // Adjust last month to handle rounding
        if (month === timeline.calvingSeasonEnd) {
          const alreadyBorn = Math.round(sellableCalves / calvingMonths) * (calvingMonths - 1);
          calvesBorn = sellableCalves - alreadyBorn;
        }
      }
    } else {
      // Years 2+: Calving happens in months 1-6 of calendar year
      const annualMonth = yearMonth;
      if (annualMonth >= 1 && annualMonth <= 6) {
        const calvingMonthsInYear = 6;
        // Only add sellable calves to inventory
        const sellableCalves = yearSnapshot.maleCalvesSold + yearSnapshot.femaleCalvesSold;
        calvesBorn = Math.round(sellableCalves / calvingMonthsInYear);

        if (annualMonth === 6) {
          const alreadyBorn = Math.round(sellableCalves / calvingMonthsInYear) * 5;
          calvesBorn = sellableCalves - alreadyBorn;
        }
      }
    }

    // Harvest season: sales distributed evenly
    if (year === 1) {
      // Year 1: Use timeline months directly
      if (month >= timeline.harvestSeasonStart && month <= timeline.harvestSeasonEnd) {
        const harvestMonths = timeline.harvestSeasonEnd - timeline.harvestSeasonStart + 1;
        const totalToSell = yearSnapshot.maleCalvesSold + yearSnapshot.femaleCalvesSold;
        calvesSold = Math.round(totalToSell / harvestMonths);

        // Adjust last month to handle rounding
        if (month === timeline.harvestSeasonEnd) {
          const alreadySold = Math.round(totalToSell / harvestMonths) * (harvestMonths - 1);
          calvesSold = totalToSell - alreadySold;
        }
      }
    } else {
      // Years 2+: Harvest happens in months 7-12 of calendar year
      const annualMonth = yearMonth;
      if (annualMonth >= 7 && annualMonth <= 12) {
        const harvestMonthsInYear = 6; // Sell all within the year
        const totalToSell = yearSnapshot.maleCalvesSold + yearSnapshot.femaleCalvesSold;
        calvesSold = Math.round(totalToSell / harvestMonthsInYear);

        // Adjust last month to handle rounding
        if (annualMonth === 12) {
          const alreadySold = Math.round(totalToSell / harvestMonthsInYear) * 5;
          calvesSold = totalToSell - alreadySold;
        }
      }
    }

    // Don't sell more than we have
    calvesSold = Math.min(calvesSold, calvesStart + calvesBorn);

    const calvesEnd = Math.max(0, calvesStart + calvesBorn - calvesSold - heifersRemovedToRetention);

    // Feeding cost based on average calves during month
    // Only calves awaiting sale need feeding costs tracked here
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

/**
 * Get herd value at a point in time (for balance sheet)
 * Note: Using IATF - no bulls in herd
 */
export function calculateHerdValue(
  snapshot: YearlyHerdSnapshot,
  costPerCow: number
): number {
  // Value cows at purchase cost
  const cowValue = snapshot.cowsEnd * costPerCow;
  // Value heifers at 80% of cow cost
  const heiferValue = snapshot.heifersEnd * (costPerCow * 0.8);

  return cowValue + heiferValue;
}

/**
 * Calculate total calves sold in a year
 */
export function getTotalCalvesSoldInYear(
  snapshot: YearlyHerdSnapshot
): number {
  return snapshot.maleCalvesSold + snapshot.femaleCalvesSold;
}

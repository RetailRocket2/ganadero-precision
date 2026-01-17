// lib/workshop-calculations.ts
// Financial calculations for IATF Workshop profitability
// Ported from Python model_logic.py

export const WORKSHOP_CONSTANTS = {
  MAX_CAPACITY: 12,
  WORKSHOP_DURATION_DAYS: 3,

  // Seasonality factors (breeding seasons in Mexico)
  SEASONALITY: {
    1: { factor: 0.6, season: "Baja" },
    2: { factor: 0.7, season: "Baja" },
    3: { factor: 0.9, season: "Media" },
    4: { factor: 1.0, season: "Normal" },
    5: { factor: 1.1, season: "Alta" },
    6: { factor: 1.0, season: "Normal" },
    7: { factor: 0.8, season: "Media" },
    8: { factor: 0.7, season: "Baja" },
    9: { factor: 1.2, season: "Alta" },
    10: { factor: 1.3, season: "Pico" },
    11: { factor: 1.1, season: "Alta" },
    12: { factor: 0.5, season: "Baja" },
  } as Record<number, { factor: number; season: string }>,
};

export interface WorkshopParams {
  // Revenue
  workshopFee: number;
  certificateFee: number;

  // Trainers
  trainerCommissionPct: number;
  trainersPerWorkshop: number;

  // Per-participant costs
  welcomeKit: number;
  lodgingPerNight: number;
  lodgingNights: number;
  lunchPerDay: number;
  coffeeBreakPerDay: number;
  workshopDays: number;

  // Per-workshop costs
  vehicleRental: number;
  driverFee: number;
  fuelCost: number;
  venueRental: number;

  // Monthly costs
  accountingMonthly: number;
  taxRatePct: number;
  otherOverhead: number;

  // Supply upsell
  supplyConversionRate: number;
  avgMonthlySupplyOrder: number;
  supplyRetentionMonths: number;
}

export const DEFAULT_PARAMS: WorkshopParams = {
  workshopFee: 6000,
  certificateFee: 500,
  trainerCommissionPct: 0.2,
  trainersPerWorkshop: 2,
  welcomeKit: 300,
  lodgingPerNight: 400,
  lodgingNights: 2,
  lunchPerDay: 150,
  coffeeBreakPerDay: 100,
  workshopDays: 3,
  vehicleRental: 1500,
  driverFee: 1000,
  fuelCost: 800,
  venueRental: 0,
  accountingMonthly: 3000,
  taxRatePct: 0.3,
  otherOverhead: 0,
  supplyConversionRate: 0.3,
  avgMonthlySupplyOrder: 5000,
  supplyRetentionMonths: 12,
};

export interface WorkshopMetrics {
  participants: number;
  maxCapacity: number;
  pricePerParticipant: number;
  revenue: number;
  totalTrainerCost: number;
  totalVariableCost: number;
  totalFixedCost: number;
  totalCosts: number;
  profit: number;
  profitMargin: number;
  breakEven: number;
  safetyMargin: number;
  capacityUtilization: number;
  isProfitable: boolean;
}

export interface MonthlyMetrics {
  workshops: number;
  participants: number;
  revenue: number;
  workshopProfit: number;
  overhead: number;
  taxes: number;
  netProfit: number;
  netMargin: number;
  leadGeneration: {
    potentialSupplyCustomers: number;
    monthlySupplyRevenue: number;
    annualSupplyRevenue: number;
    ltvPerCustomer: number;
  };
}

export interface AnnualProjection {
  monthlyData: Array<{
    month: number;
    monthName: string;
    season: string;
    seasonFactor: number;
    workshops: number;
    participants: number;
    revenue: number;
    netProfit: number;
    netMargin: number;
  }>;
  summary: {
    totalRevenue: number;
    totalNetProfit: number;
    totalWorkshops: number;
    totalParticipants: number;
    totalPotentialCustomers: number;
    avgNetMargin: number;
  };
}

function calculatePerParticipantCosts(params: WorkshopParams): number {
  const lodgingTotal = params.lodgingPerNight * params.lodgingNights;
  const lunchTotal = params.lunchPerDay * params.workshopDays;
  const coffeeTotal = params.coffeeBreakPerDay * params.workshopDays;
  return (
    params.welcomeKit +
    lodgingTotal +
    lunchTotal +
    coffeeTotal +
    params.certificateFee
  );
}

function calculateWorkshopFixedCosts(params: WorkshopParams): number {
  return (
    params.vehicleRental +
    params.driverFee +
    params.fuelCost +
    params.venueRental
  );
}

export function calculateWorkshopMetrics(
  participants: number,
  params: WorkshopParams = DEFAULT_PARAMS
): WorkshopMetrics {
  const pricePerParticipant = params.workshopFee + params.certificateFee;
  const revenue = participants * pricePerParticipant;

  // Trainer costs (commission based)
  const totalTrainerCost =
    revenue * params.trainerCommissionPct * params.trainersPerWorkshop;

  // Variable costs per participant
  const perParticipantCost = calculatePerParticipantCosts(params);
  const totalVariableCost = perParticipantCost * participants;

  // Fixed costs per workshop
  const totalFixedCost = calculateWorkshopFixedCosts(params);

  // Totals
  const totalCosts = totalTrainerCost + totalVariableCost + totalFixedCost;
  const profit = revenue - totalCosts;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

  // Break-even calculation
  const commissionTotalPct =
    params.trainerCommissionPct * params.trainersPerWorkshop;
  const contributionPerParticipant =
    pricePerParticipant * (1 - commissionTotalPct) - perParticipantCost;

  let breakEven: number;
  if (contributionPerParticipant > 0) {
    breakEven = Math.ceil(totalFixedCost / contributionPerParticipant);
  } else {
    breakEven = 999; // Impossible
  }

  const safetyMargin = participants - breakEven;
  const capacityUtilization =
    (participants / WORKSHOP_CONSTANTS.MAX_CAPACITY) * 100;

  return {
    participants,
    maxCapacity: WORKSHOP_CONSTANTS.MAX_CAPACITY,
    pricePerParticipant,
    revenue,
    totalTrainerCost,
    totalVariableCost,
    totalFixedCost,
    totalCosts,
    profit,
    profitMargin: Math.round(profitMargin * 10) / 10,
    breakEven,
    safetyMargin,
    capacityUtilization: Math.round(capacityUtilization * 10) / 10,
    isProfitable: profit > 0,
  };
}

export function calculateMonthlyMetrics(
  workshopsPerMonth: number,
  avgParticipants: number,
  params: WorkshopParams = DEFAULT_PARAMS
): MonthlyMetrics {
  const workshopMetrics = calculateWorkshopMetrics(avgParticipants, params);

  const totalParticipants = workshopsPerMonth * avgParticipants;
  const totalRevenue = workshopMetrics.revenue * workshopsPerMonth;
  const totalWorkshopProfit = workshopMetrics.profit * workshopsPerMonth;

  // Monthly overhead
  const totalOverhead = params.accountingMonthly + params.otherOverhead;

  // Profit before tax
  const profitBeforeTax = totalWorkshopProfit - totalOverhead;

  // Taxes (only on positive profit)
  const taxes = Math.max(0, profitBeforeTax * params.taxRatePct);

  // Net profit
  const netProfit = profitBeforeTax - taxes;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Lead generation (supply customers)
  const potentialCustomers = Math.floor(
    totalParticipants * params.supplyConversionRate
  );
  const monthlySupplyRevenue = potentialCustomers * params.avgMonthlySupplyOrder;
  const annualSupplyRevenue = monthlySupplyRevenue * 12;
  const ltvPerCustomer =
    params.avgMonthlySupplyOrder * params.supplyRetentionMonths;

  return {
    workshops: workshopsPerMonth,
    participants: totalParticipants,
    revenue: totalRevenue,
    workshopProfit: totalWorkshopProfit,
    overhead: totalOverhead,
    taxes,
    netProfit,
    netMargin: Math.round(netMargin * 10) / 10,
    leadGeneration: {
      potentialSupplyCustomers: potentialCustomers,
      monthlySupplyRevenue,
      annualSupplyRevenue,
      ltvPerCustomer,
    },
  };
}

export function projectAnnual(
  workshopsPerMonth: number,
  avgParticipants: number,
  params: WorkshopParams = DEFAULT_PARAMS,
  applySeasonality: boolean = true
): AnnualProjection {
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const monthlyData: AnnualProjection["monthlyData"] = [];
  const totals = {
    revenue: 0,
    netProfit: 0,
    workshops: 0,
    participants: 0,
    potentialCustomers: 0,
  };

  for (let month = 1; month <= 12; month++) {
    const seasonData = WORKSHOP_CONSTANTS.SEASONALITY[month];
    const seasonFactor = applySeasonality ? seasonData.factor : 1.0;
    const seasonName = applySeasonality ? seasonData.season : "Normal";

    // Adjust participants by seasonality
    const adjustedParticipants = Math.min(
      WORKSHOP_CONSTANTS.MAX_CAPACITY,
      Math.max(1, Math.round(avgParticipants * seasonFactor))
    );

    const monthlyMetrics = calculateMonthlyMetrics(
      workshopsPerMonth,
      adjustedParticipants,
      params
    );

    monthlyData.push({
      month,
      monthName: monthNames[month - 1],
      season: seasonName,
      seasonFactor,
      workshops: monthlyMetrics.workshops,
      participants: monthlyMetrics.participants,
      revenue: monthlyMetrics.revenue,
      netProfit: monthlyMetrics.netProfit,
      netMargin: monthlyMetrics.netMargin,
    });

    totals.revenue += monthlyMetrics.revenue;
    totals.netProfit += monthlyMetrics.netProfit;
    totals.workshops += monthlyMetrics.workshops;
    totals.participants += monthlyMetrics.participants;
    totals.potentialCustomers +=
      monthlyMetrics.leadGeneration.potentialSupplyCustomers;
  }

  const avgNetMargin =
    totals.revenue > 0 ? (totals.netProfit / totals.revenue) * 100 : 0;

  return {
    monthlyData,
    summary: {
      totalRevenue: totals.revenue,
      totalNetProfit: totals.netProfit,
      totalWorkshops: totals.workshops,
      totalParticipants: totals.participants,
      totalPotentialCustomers: totals.potentialCustomers,
      avgNetMargin: Math.round(avgNetMargin * 10) / 10,
    },
  };
}

export function calculateProfitabilityTable(
  params: WorkshopParams = DEFAULT_PARAMS,
  minParticipants: number = 1,
  maxParticipants: number = 12
): Array<{
  participants: number;
  revenue: number;
  totalCosts: number;
  profit: number;
  margin: number;
  isProfitable: boolean;
}> {
  const table = [];
  for (let n = minParticipants; n <= maxParticipants; n++) {
    const metrics = calculateWorkshopMetrics(n, params);
    table.push({
      participants: n,
      revenue: metrics.revenue,
      totalCosts: metrics.totalCosts,
      profit: metrics.profit,
      margin: metrics.profitMargin,
      isProfitable: metrics.isProfitable,
    });
  }
  return table;
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  } else if (amount >= 1_000) {
    return `$${amount.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`;
  }
  return `$${amount.toFixed(0)}`;
}

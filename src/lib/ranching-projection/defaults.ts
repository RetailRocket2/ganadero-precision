// lib/ranching-projection/defaults.ts
// Default parameter values for Cattle Ranching Financial Projection
// Based on domain expert input (credit manager for agricultural loans)

import type {
  LoanInvestmentParams,
  InfrastructureParams,
  CattlePurchaseParams,
  HerdParams,
  TimelineParams,
  OperatingCostParams,
  RevenueParams,
  ConsultingFeeParams,
  RanchingProjectionInput,
} from "./types";

/**
 * Default loan and investment parameters
 * loanAmount is auto-calculated: (cattle + infrastructure) / (1 - consultingFee%)
 * Default: (100×$50K + $310K infra) / 0.97 = ~$5.47M
 */
export const DEFAULT_LOAN: LoanInvestmentParams = {
  loanAmount: 5_474_227,           // Auto-calculated from defaults
  annualInterestRate: 17,          // 17% commercial rate
  loanTermMonths: 60,              // 5 years
  gracePeriodMonths: 6,            // 6 months grace period
  downPaymentPercent: 20,          // 20% down payment
};

/**
 * Default infrastructure costs
 * Based on 2024-2026 research for 100-cow rural operation in Mexico
 * Using economical/rústico options with partial autoconstruction
 */
export const DEFAULT_INFRASTRUCTURE: InfrastructureParams = {
  warehouseCost: 200_000,          // Bodega rústica 100m² - $200K
  cattleHandlingCost: 60_000,      // Manga prefabricada básica - $60K
  officeCost: 50_000,              // Oficina básica - $50K
  otherInfrastructureCost: 0,      // Otros (bebederos, corrales adicionales)
  constructionMonths: 3,           // 3 months for basic structures
};

/**
 * Default cattle purchase parameters
 * Note: Using IATF (no bulls) - IATF cost included in variableCostPerCowYear
 */
export const DEFAULT_CATTLE: CattlePurchaseParams = {
  numberOfCows: 100,               // 100 vientres
  costPerCow: 50_000,              // $50K per head
  purchaseMonth: 3,                // Month 3 (right after 3-month construction)
};

/**
 * Default herd management parameters
 * Based on good management with IATF technology
 */
export const DEFAULT_HERD: HerdParams = {
  calvingRate: 85,                 // 85% calving rate
  calfMortalityRate: 4,            // 4% calf mortality
  adultMortalityRate: 2,           // 2% adult mortality
  heifersRetained: 16,             // 16 heifers retained for replacement
  cowCullRate: 16,                 // 16% cull rate (matches replacement)
  maleCalfPercent: 50,             // 50% males
};

/**
 * Default timeline parameters
 * Based on typical cattle operation cycle
 * With 3-month construction, cattle purchased month 3, calving ~9 months later
 */
export const DEFAULT_TIMELINE: TimelineParams = {
  constructionStartMonth: 0,       // Start immediately
  constructionEndMonth: 2,         // 3 months construction (months 0-2)
  cattlePurchaseMonth: 3,          // Buy cattle month 3 (right after construction)
  calvingSeasonStart: 12,          // Calving starts ~9 months after purchase
  calvingSeasonEnd: 15,            // Calving ends month 15
  harvestSeasonStart: 18,          // Sales start when calves are 6+ months
  harvestSeasonEnd: 24,            // Sales through year 2
};

/**
 * Default operating cost parameters
 */
export const DEFAULT_OPERATING_COSTS: OperatingCostParams = {
  // Variable costs
  variableCostPerCowYear: 4_500,   // $4,500/cow/year (feed, vet, etc.)
  calfFeedingCostMonth: 800,       // $800/calf/month

  // Fixed costs (monthly)
  monthlyPayroll: 25_000,          // Nómina - 2 workers + benefits
  monthlyServices: 5_000,          // Servicios (accounting, etc.)
  monthlyTravel: 3_000,            // Viáticos
  monthlyMaintenance: 4_000,       // Mantenimiento
  monthlyUtilities: 3_000,         // Luz, agua
  annualInsurance: 50_000,         // Seguro anual
  otherMonthlyFixed: 2_000,        // Otros gastos fijos
};

/**
 * Default revenue parameters
 * Breeding operation - fixed prices per head (not per kg)
 */
export const DEFAULT_REVENUE: RevenueParams = {
  maleCalfPrice: 70_000,           // $70K per male calf
  femaleCalfPrice: 40_000,         // $40K per female calf
  cullCowPrice: 20_000,            // $20K per cull cow
  annualPriceIncreasePercent: 4,   // 4% annual price inflation
};

/**
 * Default consulting fee (Ganadero de Precisión fee)
 */
export const DEFAULT_CONSULTING_FEE: ConsultingFeeParams = {
  feePercent: 3,                   // 3% of loan amount
};

/**
 * Get complete default input
 */
export function getDefaultInput(): RanchingProjectionInput {
  return {
    loan: { ...DEFAULT_LOAN },
    infrastructure: { ...DEFAULT_INFRASTRUCTURE },
    cattle: { ...DEFAULT_CATTLE },
    herd: { ...DEFAULT_HERD },
    timeline: { ...DEFAULT_TIMELINE },
    operatingCosts: { ...DEFAULT_OPERATING_COSTS },
    revenue: { ...DEFAULT_REVENUE },
    consultingFee: { ...DEFAULT_CONSULTING_FEE },
    projectionYears: 5,
    startDate: new Date(),
  };
}

/**
 * Parameter ranges for validation
 */
export const PARAM_RANGES = {
  loan: {
    loanAmount: { min: 1_000_000, max: 20_000_000 },
    annualInterestRate: { min: 0, max: 50 },
    loanTermMonths: { min: 12, max: 120 },
    gracePeriodMonths: { min: 0, max: 24 },
    downPaymentPercent: { min: 0, max: 80 },
  },
  infrastructure: {
    warehouseCost: { min: 0, max: 5_000_000 },
    cattleHandlingCost: { min: 0, max: 2_000_000 },
    officeCost: { min: 0, max: 1_000_000 },
    otherInfrastructureCost: { min: 0, max: 5_000_000 },
    constructionMonths: { min: 1, max: 12 },
  },
  cattle: {
    numberOfCows: { min: 10, max: 1000 },
    costPerCow: { min: 10_000, max: 200_000 },
    purchaseMonth: { min: 0, max: 24 },
  },
  herd: {
    calvingRate: { min: 50, max: 100 },
    calfMortalityRate: { min: 0, max: 30 },
    adultMortalityRate: { min: 0, max: 20 },
    heifersRetained: { min: 0, max: 100 },
    cowCullRate: { min: 0, max: 50 },
    maleCalfPercent: { min: 40, max: 60 },
  },
  operatingCosts: {
    variableCostPerCowYear: { min: 0, max: 50_000 },
    calfFeedingCostMonth: { min: 0, max: 5_000 },
    monthlyPayroll: { min: 0, max: 500_000 },
    monthlyServices: { min: 0, max: 100_000 },
    monthlyTravel: { min: 0, max: 50_000 },
    monthlyMaintenance: { min: 0, max: 100_000 },
    monthlyUtilities: { min: 0, max: 50_000 },
    annualInsurance: { min: 0, max: 500_000 },
    otherMonthlyFixed: { min: 0, max: 100_000 },
  },
  revenue: {
    maleCalfPrice: { min: 20_000, max: 200_000 },
    femaleCalfPrice: { min: 10_000, max: 150_000 },
    cullCowPrice: { min: 5_000, max: 100_000 },
    annualPriceIncreasePercent: { min: 0, max: 20 },
  },
  consultingFee: {
    feePercent: { min: 0, max: 10 },
  },
};

/**
 * Labels for UI (Spanish)
 */
export const PARAM_LABELS = {
  loan: {
    loanAmount: "Monto del crédito",
    annualInterestRate: "Tasa de interés anual",
    loanTermMonths: "Plazo en meses",
    gracePeriodMonths: "Período de gracia",
    downPaymentPercent: "Enganche",
  },
  infrastructure: {
    warehouseCost: "Bodega",
    cattleHandlingCost: "Manga de manejo",
    officeCost: "Oficina",
    otherInfrastructureCost: "Otra infraestructura",
    constructionMonths: "Meses de construcción",
  },
  cattle: {
    numberOfCows: "Cantidad de vacas",
    costPerCow: "Costo por vaca",
    purchaseMonth: "Mes de compra",
  },
  herd: {
    calvingRate: "Tasa de parición",
    calfMortalityRate: "Mortalidad de becerros",
    adultMortalityRate: "Mortalidad de adultos",
    heifersRetained: "Vaquillas retenidas",
    cowCullRate: "Tasa de desecho",
    maleCalfPercent: "Porcentaje de machos",
  },
  operatingCosts: {
    variableCostPerCowYear: "Costo variable por vaca/año",
    calfFeedingCostMonth: "Alimentación becerro/mes",
    monthlyPayroll: "Nómina mensual",
    monthlyServices: "Servicios mensuales",
    monthlyTravel: "Viáticos mensuales",
    monthlyMaintenance: "Mantenimiento mensual",
    monthlyUtilities: "Servicios públicos",
    annualInsurance: "Seguro anual",
    otherMonthlyFixed: "Otros gastos fijos",
  },
  revenue: {
    maleCalfPrice: "Precio por becerro macho",
    femaleCalfPrice: "Precio por becerra hembra",
    cullCowPrice: "Precio por vaca de desecho",
    annualPriceIncreasePercent: "Incremento anual de precios",
  },
  consultingFee: {
    feePercent: "Comisión de consultoría",
  },
};

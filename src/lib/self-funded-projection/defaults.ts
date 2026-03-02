// lib/self-funded-projection/defaults.ts
// Default parameter values for Self-Funded Cattle Ranching Investment

import type {
  SelfFundedInfrastructureParams,
  CattlePurchaseParams,
  SelfFundedHerdParams,
  TimelineParams,
  OperatingCostParams,
  RevenueParams,
  ConsultingFeeParams,
  SelfFundedProjectionInput,
} from "./types";

/**
 * Default infrastructure costs (9 items)
 * Total: $1,160,000
 */
export const DEFAULT_INFRASTRUCTURE: SelfFundedInfrastructureParams = {
  landCost: 500_000,             // Terreno
  warehouseCost: 200_000,        // Bodega
  cattleHandlingCost: 120_000,   // Corrales de Manejo
  officeCost: 50_000,            // Oficina
  waterWellCost: 80_000,         // Pozo Ganadero
  geomembraneCost: 60_000,       // Geomembrana
  housingCost: 150_000,          // Casa Habitación
  agriculturalAreaCost: 0,       // Área Agrícola (opcional)
  machineryCost: 0,              // Maquinaria/Implementos (opcional)
  agriculturalEngineerFee: 0,    // Honorarios Ingeniero Agrícola (6 meses, opcional)
  constructionMonths: 5,         // 5 meses de construcción
};

export const DEFAULT_CATTLE: CattlePurchaseParams = {
  numberOfCows: 100,
  costPerCow: 50_000,
  purchaseMonth: 5,              // Month 5 (after 5-month construction)
};

/**
 * Default herd parameters with per-year arrays
 */
export const DEFAULT_HERD: SelfFundedHerdParams = {
  calvingRate: [85, 85, 90, 90, 95, 95, 95, 95, 95, 95],
  calfMortalityRate: 4,
  adultMortalityRate: 2,
  heifersRetained: [16, 16, 18, 20, 20, 20, 20, 20, 20, 20],  // % of herd
  cowCullRate: [0, 0, 16, 18, 20, 20, 20, 20, 20, 20],
  maleCalfPercent: 50,
};

export const DEFAULT_TIMELINE: TimelineParams = {
  constructionStartMonth: 0,
  constructionEndMonth: 4,       // 5 months (0-4)
  cattlePurchaseMonth: 5,
  calvingSeasonStart: 14,        // ~9 months after purchase
  calvingSeasonEnd: 17,
  harvestSeasonStart: 20,
  harvestSeasonEnd: 26,
};

export const DEFAULT_OPERATING_COSTS: OperatingCostParams = {
  variableCostPerCowYear: 4_500,
  calfFeedingCostMonth: 800,
  monthlyPayroll: 25_000,
  monthlyServices: 5_000,
  monthlyTravel: 3_000,
  monthlyMaintenance: 4_000,
  monthlyUtilities: 3_000,
  annualInsurance: 50_000,
  otherMonthlyFixed: 2_000,
};

export const DEFAULT_REVENUE: RevenueParams = {
  maleCalfPrice: 70_000,
  femaleCalfPrice: 40_000,
  cullCowPrice: 20_000,
  annualPriceIncreasePercent: 4,
};

export const DEFAULT_CONSULTING_FEE: ConsultingFeeParams = {
  feePercent: 3,
};

export function getDefaultSelfFundedInput(): SelfFundedProjectionInput {
  return {
    infrastructure: { ...DEFAULT_INFRASTRUCTURE },
    cattle: { ...DEFAULT_CATTLE },
    herd: {
      ...DEFAULT_HERD,
      calvingRate: [...DEFAULT_HERD.calvingRate],
      heifersRetained: [...DEFAULT_HERD.heifersRetained],
      cowCullRate: [...DEFAULT_HERD.cowCullRate],
    },
    timeline: { ...DEFAULT_TIMELINE },
    operatingCosts: { ...DEFAULT_OPERATING_COSTS },
    revenue: { ...DEFAULT_REVENUE },
    consultingFee: { ...DEFAULT_CONSULTING_FEE },
    projectionYears: 10,
    startDate: new Date(),
  };
}

/**
 * Parameter ranges for validation
 */
export const PARAM_RANGES = {
  infrastructure: {
    landCost: { min: 0, max: 10_000_000 },
    warehouseCost: { min: 0, max: 5_000_000 },
    cattleHandlingCost: { min: 0, max: 2_000_000 },
    officeCost: { min: 0, max: 1_000_000 },
    waterWellCost: { min: 0, max: 2_000_000 },
    geomembraneCost: { min: 0, max: 1_000_000 },
    housingCost: { min: 0, max: 3_000_000 },
    agriculturalAreaCost: { min: 0, max: 5_000_000 },
    machineryCost: { min: 0, max: 5_000_000 },
    agriculturalEngineerFee: { min: 0, max: 2_000_000 },
    constructionMonths: { min: 1, max: 12 },
  },
  cattle: {
    numberOfCows: { min: 10, max: 1000 },
    costPerCow: { min: 10_000, max: 200_000 },
  },
  herd: {
    calvingRatePerYear: { min: 50, max: 100 },
    calfMortalityRate: { min: 0, max: 30 },
    adultMortalityRate: { min: 0, max: 20 },
    heifersRetainedPerYear: { min: 0, max: 50 },
    cowCullRatePerYear: { min: 0, max: 50 },
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

export const PARAM_LABELS = {
  infrastructure: {
    landCost: "Terreno",
    warehouseCost: "Bodega",
    cattleHandlingCost: "Corrales de Manejo",
    officeCost: "Oficina",
    waterWellCost: "Pozo Ganadero",
    geomembraneCost: "Geomembrana",
    housingCost: "Casa Habitación",
    agriculturalAreaCost: "Área Agrícola",
    machineryCost: "Maquinaria/Implementos",
    agriculturalEngineerFee: "Ingeniero Agrícola (6 meses)",
    constructionMonths: "Meses de construcción",
  },
  cattle: {
    numberOfCows: "Cantidad de vacas",
    costPerCow: "Costo por vaca",
  },
  herd: {
    calvingRate: "Tasa de parición",
    calfMortalityRate: "Mortalidad de becerros",
    adultMortalityRate: "Mortalidad de adultos",
    heifersRetained: "Reemplazos (%)",
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

/**
 * Infrastructure item tooltips for UI
 */
export const INFRA_TOOLTIPS: Record<string, string> = {
  landCost: "Valor del terreno. Si ya es tuyo, pon $0.",
  warehouseCost: "Almacén de insumos y equipo.",
  cattleHandlingCost: "Corral, embarcadero, báscula, cepo.",
  officeCost: "Espacio administrativo básico.",
  waterWellCost: "Perforación + bomba + cisterna.",
  geomembraneCost: "Revestimiento de jagüey para agua.",
  housingCost: "Vivienda para encargado del rancho.",
  agriculturalAreaCost: "Forraje propio (opcional).",
  machineryCost: "Tractor, remolque, implementos agrícolas. Opcional.",
  agriculturalEngineerFee: "Honorarios del ingeniero que diseña y supervisa el área agrícola. Contrato de 6 meses.",
};

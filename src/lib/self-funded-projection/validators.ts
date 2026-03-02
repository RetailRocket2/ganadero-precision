// lib/self-funded-projection/validators.ts
// Input validation for Self-Funded Cattle Ranching Investment

import type {
  SelfFundedProjectionInput,
  ValidationError,
  ValidationResult,
} from "./types";
import { PARAM_RANGES, PARAM_LABELS } from "./defaults";

function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string,
  label: string
): ValidationError | null {
  if (value === undefined || value === null || isNaN(value)) {
    return { field: fieldName, message: `${label} es requerido` };
  }
  if (value < min) {
    return {
      field: fieldName,
      message: `${label} debe ser al menos ${min.toLocaleString("es-MX")}`,
    };
  }
  if (value > max) {
    return {
      field: fieldName,
      message: `${label} no puede exceder ${max.toLocaleString("es-MX")}`,
    };
  }
  return null;
}

function validateInfrastructure(
  input: SelfFundedProjectionInput
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { infrastructure } = input;
  const ranges = PARAM_RANGES.infrastructure;
  const labels = PARAM_LABELS.infrastructure;

  const checks = [
    validateRange(infrastructure.landCost, ranges.landCost.min, ranges.landCost.max, "infrastructure.landCost", labels.landCost),
    validateRange(infrastructure.warehouseCost, ranges.warehouseCost.min, ranges.warehouseCost.max, "infrastructure.warehouseCost", labels.warehouseCost),
    validateRange(infrastructure.cattleHandlingCost, ranges.cattleHandlingCost.min, ranges.cattleHandlingCost.max, "infrastructure.cattleHandlingCost", labels.cattleHandlingCost),
    validateRange(infrastructure.officeCost, ranges.officeCost.min, ranges.officeCost.max, "infrastructure.officeCost", labels.officeCost),
    validateRange(infrastructure.waterWellCost, ranges.waterWellCost.min, ranges.waterWellCost.max, "infrastructure.waterWellCost", labels.waterWellCost),
    validateRange(infrastructure.geomembraneCost, ranges.geomembraneCost.min, ranges.geomembraneCost.max, "infrastructure.geomembraneCost", labels.geomembraneCost),
    validateRange(infrastructure.housingCost, ranges.housingCost.min, ranges.housingCost.max, "infrastructure.housingCost", labels.housingCost),
    validateRange(infrastructure.agriculturalAreaCost, ranges.agriculturalAreaCost.min, ranges.agriculturalAreaCost.max, "infrastructure.agriculturalAreaCost", labels.agriculturalAreaCost),
    validateRange(infrastructure.machineryCost, ranges.machineryCost.min, ranges.machineryCost.max, "infrastructure.machineryCost", labels.machineryCost),
    validateRange(infrastructure.agriculturalEngineerFee, ranges.agriculturalEngineerFee.min, ranges.agriculturalEngineerFee.max, "infrastructure.agriculturalEngineerFee", labels.agriculturalEngineerFee),
    validateRange(infrastructure.constructionMonths, ranges.constructionMonths.min, ranges.constructionMonths.max, "infrastructure.constructionMonths", labels.constructionMonths),
  ];

  checks.forEach((error) => { if (error) errors.push(error); });
  return errors;
}

function validateCattle(
  input: SelfFundedProjectionInput
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { cattle } = input;
  const ranges = PARAM_RANGES.cattle;
  const labels = PARAM_LABELS.cattle;

  const checks = [
    validateRange(cattle.numberOfCows, ranges.numberOfCows.min, ranges.numberOfCows.max, "cattle.numberOfCows", labels.numberOfCows),
    validateRange(cattle.costPerCow, ranges.costPerCow.min, ranges.costPerCow.max, "cattle.costPerCow", labels.costPerCow),
  ];

  checks.forEach((error) => { if (error) errors.push(error); });
  return errors;
}

function validateHerd(
  input: SelfFundedProjectionInput
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { herd } = input;
  const ranges = PARAM_RANGES.herd;
  const labels = PARAM_LABELS.herd;

  const checks = [
    validateRange(herd.calfMortalityRate, ranges.calfMortalityRate.min, ranges.calfMortalityRate.max, "herd.calfMortalityRate", labels.calfMortalityRate),
    validateRange(herd.adultMortalityRate, ranges.adultMortalityRate.min, ranges.adultMortalityRate.max, "herd.adultMortalityRate", labels.adultMortalityRate),
  ];

  checks.forEach((error) => { if (error) errors.push(error); });

  // Validate per-year calvingRate
  if (!Array.isArray(herd.calvingRate) || herd.calvingRate.length !== input.projectionYears) {
    errors.push({
      field: "herd.calvingRate",
      message: `Tasa de parición debe tener ${input.projectionYears} valores (uno por año)`,
    });
  } else {
    for (let i = 0; i < herd.calvingRate.length; i++) {
      const err = validateRange(
        herd.calvingRate[i],
        ranges.calvingRatePerYear.min,
        ranges.calvingRatePerYear.max,
        `herd.calvingRate[${i}]`,
        `${labels.calvingRate} Año ${i + 1}`
      );
      if (err) errors.push(err);
    }
  }

  // Validate per-year arrays
  if (!Array.isArray(herd.heifersRetained) || herd.heifersRetained.length !== input.projectionYears) {
    errors.push({
      field: "herd.heifersRetained",
      message: `Vaquillas retenidas debe tener ${input.projectionYears} valores (uno por año)`,
    });
  } else {
    for (let i = 0; i < herd.heifersRetained.length; i++) {
      const err = validateRange(
        herd.heifersRetained[i],
        ranges.heifersRetainedPerYear.min,
        ranges.heifersRetainedPerYear.max,
        `herd.heifersRetained[${i}]`,
        `${labels.heifersRetained} Año ${i + 1}`
      );
      if (err) errors.push(err);
    }
  }

  if (!Array.isArray(herd.cowCullRate) || herd.cowCullRate.length !== input.projectionYears) {
    errors.push({
      field: "herd.cowCullRate",
      message: `Tasa de desecho debe tener ${input.projectionYears} valores (uno por año)`,
    });
  } else {
    for (let i = 0; i < herd.cowCullRate.length; i++) {
      const err = validateRange(
        herd.cowCullRate[i],
        ranges.cowCullRatePerYear.min,
        ranges.cowCullRatePerYear.max,
        `herd.cowCullRate[${i}]`,
        `${labels.cowCullRate} Año ${i + 1}`
      );
      if (err) errors.push(err);
    }
  }

  return errors;
}

function validateTimeline(
  input: SelfFundedProjectionInput
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { timeline } = input;

  if (timeline.constructionEndMonth >= timeline.cattlePurchaseMonth) {
    errors.push({
      field: "timeline.cattlePurchaseMonth",
      message: "La compra de ganado debe ser después de terminar construcción",
    });
  }
  if (timeline.calvingSeasonStart <= timeline.cattlePurchaseMonth) {
    errors.push({
      field: "timeline.calvingSeasonStart",
      message: "La época de parición debe iniciar después de la compra de ganado",
    });
  }
  if (timeline.harvestSeasonStart <= timeline.calvingSeasonEnd) {
    errors.push({
      field: "timeline.harvestSeasonStart",
      message: "La época de cosecha debe iniciar después de la parición",
    });
  }
  if (timeline.harvestSeasonEnd > 36) {
    errors.push({
      field: "timeline.harvestSeasonEnd",
      message: "La época de cosecha no puede extenderse más allá del mes 36",
    });
  }

  return errors;
}

function validateOperatingCosts(
  input: SelfFundedProjectionInput
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { operatingCosts } = input;
  const ranges = PARAM_RANGES.operatingCosts;
  const labels = PARAM_LABELS.operatingCosts;

  const checks = [
    validateRange(operatingCosts.variableCostPerCowYear, ranges.variableCostPerCowYear.min, ranges.variableCostPerCowYear.max, "operatingCosts.variableCostPerCowYear", labels.variableCostPerCowYear),
    validateRange(operatingCosts.calfFeedingCostMonth, ranges.calfFeedingCostMonth.min, ranges.calfFeedingCostMonth.max, "operatingCosts.calfFeedingCostMonth", labels.calfFeedingCostMonth),
    validateRange(operatingCosts.monthlyPayroll, ranges.monthlyPayroll.min, ranges.monthlyPayroll.max, "operatingCosts.monthlyPayroll", labels.monthlyPayroll),
  ];

  checks.forEach((error) => { if (error) errors.push(error); });
  return errors;
}

function validateRevenue(
  input: SelfFundedProjectionInput
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { revenue } = input;
  const ranges = PARAM_RANGES.revenue;
  const labels = PARAM_LABELS.revenue;

  const checks = [
    validateRange(revenue.maleCalfPrice, ranges.maleCalfPrice.min, ranges.maleCalfPrice.max, "revenue.maleCalfPrice", labels.maleCalfPrice),
    validateRange(revenue.femaleCalfPrice, ranges.femaleCalfPrice.min, ranges.femaleCalfPrice.max, "revenue.femaleCalfPrice", labels.femaleCalfPrice),
    validateRange(revenue.cullCowPrice, ranges.cullCowPrice.min, ranges.cullCowPrice.max, "revenue.cullCowPrice", labels.cullCowPrice),
  ];

  checks.forEach((error) => { if (error) errors.push(error); });
  return errors;
}

export function validateSelfFundedInput(
  input: SelfFundedProjectionInput
): ValidationResult {
  const errors: ValidationError[] = [
    ...validateInfrastructure(input),
    ...validateCattle(input),
    ...validateHerd(input),
    ...validateTimeline(input),
    ...validateOperatingCosts(input),
    ...validateRevenue(input),
  ];

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getFieldErrors(
  result: ValidationResult,
  fieldPrefix: string
): ValidationError[] {
  return result.errors.filter((e) => e.field.startsWith(fieldPrefix));
}

export function hasFieldError(
  result: ValidationResult,
  field: string
): boolean {
  return result.errors.some((e) => e.field === field);
}

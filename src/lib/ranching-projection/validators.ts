// lib/ranching-projection/validators.ts
// Input validation for Cattle Ranching Financial Projection

import type {
  RanchingProjectionInput,
  ValidationError,
  ValidationResult,
} from "./types";
import { PARAM_RANGES, PARAM_LABELS } from "./defaults";

/**
 * Validate a numeric value against a range
 */
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

/**
 * Validate loan parameters
 */
function validateLoan(
  input: RanchingProjectionInput
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { loan } = input;
  const ranges = PARAM_RANGES.loan;
  const labels = PARAM_LABELS.loan;

  const checks = [
    validateRange(
      loan.loanAmount,
      ranges.loanAmount.min,
      ranges.loanAmount.max,
      "loan.loanAmount",
      labels.loanAmount
    ),
    validateRange(
      loan.annualInterestRate,
      ranges.annualInterestRate.min,
      ranges.annualInterestRate.max,
      "loan.annualInterestRate",
      labels.annualInterestRate
    ),
    validateRange(
      loan.loanTermMonths,
      ranges.loanTermMonths.min,
      ranges.loanTermMonths.max,
      "loan.loanTermMonths",
      labels.loanTermMonths
    ),
    validateRange(
      loan.gracePeriodMonths,
      ranges.gracePeriodMonths.min,
      ranges.gracePeriodMonths.max,
      "loan.gracePeriodMonths",
      labels.gracePeriodMonths
    ),
    validateRange(
      loan.downPaymentPercent,
      ranges.downPaymentPercent.min,
      ranges.downPaymentPercent.max,
      "loan.downPaymentPercent",
      labels.downPaymentPercent
    ),
  ];

  checks.forEach((error) => {
    if (error) errors.push(error);
  });

  // Grace period cannot exceed loan term
  if (loan.gracePeriodMonths >= loan.loanTermMonths) {
    errors.push({
      field: "loan.gracePeriodMonths",
      message: "El período de gracia debe ser menor al plazo del crédito",
    });
  }

  return errors;
}

/**
 * Validate infrastructure parameters
 */
function validateInfrastructure(
  input: RanchingProjectionInput
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { infrastructure } = input;
  const ranges = PARAM_RANGES.infrastructure;
  const labels = PARAM_LABELS.infrastructure;

  const checks = [
    validateRange(
      infrastructure.warehouseCost,
      ranges.warehouseCost.min,
      ranges.warehouseCost.max,
      "infrastructure.warehouseCost",
      labels.warehouseCost
    ),
    validateRange(
      infrastructure.cattleHandlingCost,
      ranges.cattleHandlingCost.min,
      ranges.cattleHandlingCost.max,
      "infrastructure.cattleHandlingCost",
      labels.cattleHandlingCost
    ),
    validateRange(
      infrastructure.officeCost,
      ranges.officeCost.min,
      ranges.officeCost.max,
      "infrastructure.officeCost",
      labels.officeCost
    ),
    validateRange(
      infrastructure.constructionMonths,
      ranges.constructionMonths.min,
      ranges.constructionMonths.max,
      "infrastructure.constructionMonths",
      labels.constructionMonths
    ),
  ];

  checks.forEach((error) => {
    if (error) errors.push(error);
  });

  return errors;
}

/**
 * Validate cattle purchase parameters
 * Note: Using IATF - no bulls validation needed
 */
function validateCattle(
  input: RanchingProjectionInput
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { cattle } = input;
  const ranges = PARAM_RANGES.cattle;
  const labels = PARAM_LABELS.cattle;

  const checks = [
    validateRange(
      cattle.numberOfCows,
      ranges.numberOfCows.min,
      ranges.numberOfCows.max,
      "cattle.numberOfCows",
      labels.numberOfCows
    ),
    validateRange(
      cattle.costPerCow,
      ranges.costPerCow.min,
      ranges.costPerCow.max,
      "cattle.costPerCow",
      labels.costPerCow
    ),
  ];

  checks.forEach((error) => {
    if (error) errors.push(error);
  });

  return errors;
}

/**
 * Validate herd parameters
 */
function validateHerd(
  input: RanchingProjectionInput
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { herd } = input;
  const ranges = PARAM_RANGES.herd;
  const labels = PARAM_LABELS.herd;

  const checks = [
    validateRange(
      herd.calvingRate,
      ranges.calvingRate.min,
      ranges.calvingRate.max,
      "herd.calvingRate",
      labels.calvingRate
    ),
    validateRange(
      herd.calfMortalityRate,
      ranges.calfMortalityRate.min,
      ranges.calfMortalityRate.max,
      "herd.calfMortalityRate",
      labels.calfMortalityRate
    ),
    validateRange(
      herd.adultMortalityRate,
      ranges.adultMortalityRate.min,
      ranges.adultMortalityRate.max,
      "herd.adultMortalityRate",
      labels.adultMortalityRate
    ),
    validateRange(
      herd.cowCullRate,
      ranges.cowCullRate.min,
      ranges.cowCullRate.max,
      "herd.cowCullRate",
      labels.cowCullRate
    ),
  ];

  checks.forEach((error) => {
    if (error) errors.push(error);
  });

  // Heifer retention should roughly match cull rate for stable herd
  const calvesPerYear = input.cattle.numberOfCows * (herd.calvingRate / 100);
  const femaleCalves = calvesPerYear * (1 - herd.maleCalfPercent / 100);
  if (herd.heifersRetained > femaleCalves) {
    errors.push({
      field: "herd.heifersRetained",
      message: `No puedes retener más vaquillas (${herd.heifersRetained}) que las hembras nacidas (~${Math.round(femaleCalves)})`,
    });
  }

  return errors;
}

/**
 * Validate timeline parameters
 */
function validateTimeline(
  input: RanchingProjectionInput
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { timeline } = input;

  // Construction must end before cattle purchase
  if (timeline.constructionEndMonth >= timeline.cattlePurchaseMonth) {
    errors.push({
      field: "timeline.cattlePurchaseMonth",
      message: "La compra de ganado debe ser después de terminar construcción",
    });
  }

  // Calving must start after purchase
  if (timeline.calvingSeasonStart <= timeline.cattlePurchaseMonth) {
    errors.push({
      field: "timeline.calvingSeasonStart",
      message: "La época de parición debe iniciar después de la compra de ganado",
    });
  }

  // Harvest must start after calving
  if (timeline.harvestSeasonStart <= timeline.calvingSeasonEnd) {
    errors.push({
      field: "timeline.harvestSeasonStart",
      message: "La época de cosecha debe iniciar después de la parición",
    });
  }

  // Harvest must end within reasonable time
  if (timeline.harvestSeasonEnd > 36) {
    errors.push({
      field: "timeline.harvestSeasonEnd",
      message: "La época de cosecha no puede extenderse más allá del mes 36",
    });
  }

  return errors;
}

/**
 * Validate operating costs
 */
function validateOperatingCosts(
  input: RanchingProjectionInput
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { operatingCosts } = input;
  const ranges = PARAM_RANGES.operatingCosts;
  const labels = PARAM_LABELS.operatingCosts;

  const checks = [
    validateRange(
      operatingCosts.variableCostPerCowYear,
      ranges.variableCostPerCowYear.min,
      ranges.variableCostPerCowYear.max,
      "operatingCosts.variableCostPerCowYear",
      labels.variableCostPerCowYear
    ),
    validateRange(
      operatingCosts.calfFeedingCostMonth,
      ranges.calfFeedingCostMonth.min,
      ranges.calfFeedingCostMonth.max,
      "operatingCosts.calfFeedingCostMonth",
      labels.calfFeedingCostMonth
    ),
    validateRange(
      operatingCosts.monthlyPayroll,
      ranges.monthlyPayroll.min,
      ranges.monthlyPayroll.max,
      "operatingCosts.monthlyPayroll",
      labels.monthlyPayroll
    ),
  ];

  checks.forEach((error) => {
    if (error) errors.push(error);
  });

  return errors;
}

/**
 * Validate revenue parameters
 * Note: Breeding operation - fixed prices per head
 */
function validateRevenue(
  input: RanchingProjectionInput
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { revenue } = input;
  const ranges = PARAM_RANGES.revenue;
  const labels = PARAM_LABELS.revenue;

  const checks = [
    validateRange(
      revenue.maleCalfPrice,
      ranges.maleCalfPrice.min,
      ranges.maleCalfPrice.max,
      "revenue.maleCalfPrice",
      labels.maleCalfPrice
    ),
    validateRange(
      revenue.femaleCalfPrice,
      ranges.femaleCalfPrice.min,
      ranges.femaleCalfPrice.max,
      "revenue.femaleCalfPrice",
      labels.femaleCalfPrice
    ),
    validateRange(
      revenue.cullCowPrice,
      ranges.cullCowPrice.min,
      ranges.cullCowPrice.max,
      "revenue.cullCowPrice",
      labels.cullCowPrice
    ),
  ];

  checks.forEach((error) => {
    if (error) errors.push(error);
  });

  return errors;
}

/**
 * Validate financial feasibility
 * Note: Loan amount is now auto-calculated, so this mainly checks consistency
 */
function validateFinancialFeasibility(
  input: RanchingProjectionInput
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Calculate total investment (should match auto-calculated loan)
  const infrastructureTotal =
    input.infrastructure.warehouseCost +
    input.infrastructure.cattleHandlingCost +
    input.infrastructure.officeCost +
    input.infrastructure.otherInfrastructureCost;

  const cattleTotal = input.cattle.numberOfCows * input.cattle.costPerCow;

  const consultingFee =
    input.loan.loanAmount * (input.consultingFee.feePercent / 100);

  const totalInvestment = infrastructureTotal + cattleTotal + consultingFee;

  // Check if loan covers investment (should always pass with auto-calculation)
  const downPayment = input.loan.loanAmount * (input.loan.downPaymentPercent / 100);
  const netLoan = input.loan.loanAmount - downPayment;
  const totalFunding = netLoan + downPayment;

  if (totalInvestment > totalFunding * 1.1) {
    errors.push({
      field: "loan.loanAmount",
      message: `La inversión total ($${totalInvestment.toLocaleString("es-MX")}) excede el financiamiento disponible ($${totalFunding.toLocaleString("es-MX")})`,
    });
  }

  return errors;
}

/**
 * Main validation function
 */
export function validateInput(
  input: RanchingProjectionInput
): ValidationResult {
  const errors: ValidationError[] = [
    ...validateLoan(input),
    ...validateInfrastructure(input),
    ...validateCattle(input),
    ...validateHerd(input),
    ...validateTimeline(input),
    ...validateOperatingCosts(input),
    ...validateRevenue(input),
    ...validateFinancialFeasibility(input),
  ];

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get errors for a specific field
 */
export function getFieldErrors(
  result: ValidationResult,
  fieldPrefix: string
): ValidationError[] {
  return result.errors.filter((e) => e.field.startsWith(fieldPrefix));
}

/**
 * Check if a specific field has errors
 */
export function hasFieldError(
  result: ValidationResult,
  field: string
): boolean {
  return result.errors.some((e) => e.field === field);
}

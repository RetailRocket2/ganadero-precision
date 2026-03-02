// lib/self-funded-projection/types.ts
// TypeScript interfaces for Self-Funded Cattle Ranching Investment Simulator
// No loan — owner provides 100% of capital

// ===== INPUT PARAMETERS =====

/**
 * Expanded infrastructure costs (9 items for self-funded ranch)
 */
export interface SelfFundedInfrastructureParams {
  landCost: number;              // Terreno
  warehouseCost: number;         // Bodega
  cattleHandlingCost: number;    // Corrales de Manejo (corral, embarcadero, báscula, cepo)
  officeCost: number;            // Oficina
  waterWellCost: number;         // Pozo Ganadero (perforación + bomba + cisterna)
  geomembraneCost: number;       // Geomembrana (revestimiento de jagüey)
  housingCost: number;           // Casa Habitación (vivienda para encargado)
  agriculturalAreaCost: number;  // Área Agrícola (forraje propio, opcional)
  machineryCost: number;         // Maquinaria/Implementos (tractor, remolque, etc.)
  agriculturalEngineerFee: number; // Honorarios Ingeniero Agrícola (6 meses)
  constructionMonths: number;    // Meses de construcción (default: 5)
}

/**
 * Cattle purchase parameters
 * Note: Using IATF (Inseminación Artificial a Tiempo Fijo) instead of bulls
 * IATF costs are included in variableCostPerCowYear
 */
export interface CattlePurchaseParams {
  numberOfCows: number;          // Cantidad de vientres
  costPerCow: number;            // Precio por vaca
  purchaseMonth: number;         // Mes de compra (default: 6)
}

/**
 * Herd management parameters
 * heifersRetained and cowCullRate are per-year arrays (5 values)
 */
export interface SelfFundedHerdParams {
  calvingRate: number[];          // Tasa de parición (%) per year - default [85,85,90,90,95]
  calfMortalityRate: number;     // Mortalidad de becerros (%) - default 4
  adultMortalityRate: number;    // Mortalidad de adultos (%) - default 2
  heifersRetained: number[];     // % del hato retenido como reemplazo por año
  cowCullRate: number[];         // Tasa de desecho por año (%) [0, 0, 16, 18, 20]
  maleCalfPercent: number;       // Porcentaje de machos (default: 50)
}

/**
 * Timeline parameters for cattle operations
 */
export interface TimelineParams {
  constructionStartMonth: number;
  constructionEndMonth: number;
  cattlePurchaseMonth: number;
  calvingSeasonStart: number;
  calvingSeasonEnd: number;
  harvestSeasonStart: number;
  harvestSeasonEnd: number;
}

/**
 * Operating cost parameters
 */
export interface OperatingCostParams {
  variableCostPerCowYear: number;
  calfFeedingCostMonth: number;
  monthlyPayroll: number;
  monthlyServices: number;
  monthlyTravel: number;
  monthlyMaintenance: number;
  monthlyUtilities: number;
  annualInsurance: number;
  otherMonthlyFixed: number;
}

/**
 * Revenue parameters
 */
export interface RevenueParams {
  maleCalfPrice: number;
  femaleCalfPrice: number;
  cullCowPrice: number;
  annualPriceIncreasePercent: number;
}

/**
 * Consulting fee parameters
 * Fee is % of (cattle + infrastructure), NOT of a loan
 */
export interface ConsultingFeeParams {
  feePercent: number;
}

/**
 * Complete input for self-funded projection
 */
export interface SelfFundedProjectionInput {
  infrastructure: SelfFundedInfrastructureParams;
  cattle: CattlePurchaseParams;
  herd: SelfFundedHerdParams;
  timeline: TimelineParams;
  operatingCosts: OperatingCostParams;
  revenue: RevenueParams;
  consultingFee: ConsultingFeeParams;
  projectionYears: number;
  startDate: Date;
}

// ===== OUTPUT STRUCTURES =====

/**
 * Monthly cash flow row — no loan fields
 */
export interface SelfFundedMonthlyCashFlowRow {
  month: number;
  year: number;
  monthInYear: number;

  // Calf inventory
  calvesStart: number;
  calvesBorn: number;
  calvesSold: number;
  calvesEnd: number;

  // Revenues
  calfSalesRevenue: number;
  cullCowRevenue: number;
  totalRevenue: number;

  // Costs
  infrastructureCost: number;
  cattlePurchaseCost: number;
  variableCowCost: number;
  calfFeedingCost: number;
  fixedOperatingCost: number;
  totalCosts: number;

  // Net cash flow
  netCashFlow: number;
  cumulativeCashFlow: number;
}

/**
 * Yearly herd snapshot (same structure as original)
 */
export interface YearlyHerdSnapshot {
  year: number;
  cowsStart: number;
  heifersStart: number;
  calvesTotal: number;
  calvesAfterMortality: number;
  maleCalves: number;
  femaleCalves: number;
  heifersMaturing: number;
  cowsCulled: number;
  heifersRetained: number;
  calfDeaths: number;
  adultDeaths: number;
  cowsEnd: number;
  heifersEnd: number;
  totalHerdEnd: number;
  maleCalvesSold: number;
  femaleCalvesSold: number;
  cullCowsSold: number;
}

/**
 * Annual income statement — no interest expense
 */
export interface IncomeStatementRow {
  year: number;
  calfSalesRevenue: number;
  cullCowSalesRevenue: number;
  totalRevenue: number;
  variableCosts: number;
  calfFeedingCosts: number;
  totalCostOfSales: number;
  grossProfit: number;
  grossMarginPercent: number;
  payrollExpense: number;
  servicesExpense: number;
  travelExpense: number;
  maintenanceExpense: number;
  utilitiesExpense: number;
  insuranceExpense: number;
  otherOperatingExpense: number;
  depreciationExpense: number;
  totalOperatingExpenses: number;
  operatingIncome: number;
  operatingMarginPercent: number;
  earningsBeforeTax: number;
  incomeTax: number;
  netIncome: number;
  netMarginPercent: number;
}

/**
 * Annual balance sheet — no debt
 */
export interface BalanceSheetRow {
  year: number;
  cash: number;
  accountsReceivable: number;
  inventory: number;
  totalCurrentAssets: number;
  infrastructureGross: number;
  livestockValue: number;
  equipmentValue: number;
  accumulatedDepreciation: number;
  totalFixedAssets: number;
  totalAssets: number;
  accountsPayable: number;
  totalCurrentLiabilities: number;
  totalLiabilities: number;
  paidInCapital: number;
  retainedEarnings: number;
  currentYearEarnings: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
}

/**
 * Annual cash flow statement — no loan proceeds/repayments
 */
export interface CashFlowStatementRow {
  year: number;
  netIncome: number;
  depreciation: number;
  changesInWorkingCapital: number;
  netCashFromOperating: number;
  infrastructureInvestment: number;
  cattlePurchases: number;
  netCashFromInvesting: number;
  ownerContributions: number;
  netCashFromFinancing: number;
  netCashChange: number;
  beginningCash: number;
  endingCash: number;
}

/**
 * Financial metrics — no DSCR
 */
export interface SelfFundedFinancialMetrics {
  paybackPeriodYears: number;
  irr: number;
  npv: number;
  roiTotal: number;
  breakEvenYear: number;
  averageNetMargin: number;
}

/**
 * Investment summary — no loan
 */
export interface SelfFundedInvestmentSummary {
  totalCashRequired: number;
  infrastructureTotal: number;
  cattleTotal: number;
  consultingFee: number;
}

/**
 * Complete projection result
 */
export interface SelfFundedProjectionResult {
  input: SelfFundedProjectionInput;
  investmentSummary: SelfFundedInvestmentSummary;
  monthlyCashFlows: SelfFundedMonthlyCashFlowRow[];
  herdProjections: YearlyHerdSnapshot[];
  incomeStatements: IncomeStatementRow[];
  balanceSheets: BalanceSheetRow[];
  cashFlowStatements: CashFlowStatementRow[];
  metrics: SelfFundedFinancialMetrics;
  generatedAt: Date;
  version: string;
}

// ===== VALIDATION =====

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

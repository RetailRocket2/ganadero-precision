// lib/ranching-projection/types.ts
// TypeScript interfaces for Cattle Ranching Financial Projection Simulator

// ===== INPUT PARAMETERS =====

/**
 * Loan and investment parameters
 * Note: loanAmount is auto-calculated from cattle + infrastructure + consulting
 */
export interface LoanInvestmentParams {
  loanAmount: number;              // Auto-calculated: (cattle + infrastructure) / (1 - consultingFee%)
  annualInterestRate: number;      // Tasa anual (e.g., 17 for 17%)
  loanTermMonths: number;          // Plazo en meses (e.g., 60)
  gracePeriodMonths: number;       // Periodo de gracia (0-12)
  downPaymentPercent: number;      // Enganche en porcentaje
}

/**
 * Infrastructure costs breakdown
 */
export interface InfrastructureParams {
  warehouseCost: number;           // Bodega
  cattleHandlingCost: number;      // Manga/Squeeze Chute
  officeCost: number;              // Oficina administrativa
  otherInfrastructureCost: number; // Otros
  constructionMonths: number;      // Meses de construcción (default: 5)
}

/**
 * Cattle purchase parameters
 * Note: Using IATF (Inseminación Artificial a Tiempo Fijo) instead of bulls
 * IATF costs are included in variableCostPerCowYear
 */
export interface CattlePurchaseParams {
  numberOfCows: number;            // Cantidad de vientres
  costPerCow: number;              // Precio por vaca
  purchaseMonth: number;           // Mes de compra (default: 6)
}

/**
 * Herd management parameters
 */
export interface HerdParams {
  calvingRate: number;             // Tasa de parición (%) - default 85
  calfMortalityRate: number;       // Mortalidad de becerros (%) - default 4
  adultMortalityRate: number;      // Mortalidad de adultos (%) - default 2
  heifersRetained: number;         // Vaquillas retenidas para reemplazo
  cowCullRate: number;             // Tasa de desecho de vacas (%)
  maleCalfPercent: number;         // Porcentaje de machos (default: 50)
}

/**
 * Timeline parameters for cattle operations
 */
export interface TimelineParams {
  constructionStartMonth: number;  // Mes inicio construcción (default: 0)
  constructionEndMonth: number;    // Mes fin construcción (default: 5)
  cattlePurchaseMonth: number;     // Mes compra ganado (default: 6)
  calvingSeasonStart: number;      // Inicio época de parición (default: 7)
  calvingSeasonEnd: number;        // Fin época de parición (default: 12)
  harvestSeasonStart: number;      // Inicio época de cosecha (default: 13)
  harvestSeasonEnd: number;        // Fin época de cosecha (default: 21)
}

/**
 * Operating cost parameters
 */
export interface OperatingCostParams {
  // Variable costs
  variableCostPerCowYear: number;  // Costo variable por vaca/año ($4,500)
  calfFeedingCostMonth: number;    // Costo alimentación becerro/mes ($800)

  // Fixed costs
  monthlyPayroll: number;          // Nómina mensual
  monthlyServices: number;         // Servicios mensuales
  monthlyTravel: number;           // Viáticos mensuales
  monthlyMaintenance: number;      // Mantenimiento mensual
  monthlyUtilities: number;        // Servicios públicos mensuales
  annualInsurance: number;         // Seguro anual
  otherMonthlyFixed: number;       // Otros gastos fijos mensuales
}

/**
 * Revenue parameters
 * Note: Breeding operation - calves sold at fixed prices (not per kg)
 */
export interface RevenueParams {
  maleCalfPrice: number;           // Precio fijo por becerro macho
  femaleCalfPrice: number;         // Precio fijo por becerra hembra
  cullCowPrice: number;            // Precio fijo por vaca de desecho
  annualPriceIncreasePercent: number; // Incremento anual de precios (%)
}

/**
 * Consulting fee parameters
 */
export interface ConsultingFeeParams {
  feePercent: number;              // Porcentaje del crédito (e.g., 3 for 3%)
}

/**
 * Complete input for the projection
 */
export interface RanchingProjectionInput {
  loan: LoanInvestmentParams;
  infrastructure: InfrastructureParams;
  cattle: CattlePurchaseParams;
  herd: HerdParams;
  timeline: TimelineParams;
  operatingCosts: OperatingCostParams;
  revenue: RevenueParams;
  consultingFee: ConsultingFeeParams;
  projectionYears: number;         // Default: 5
  startDate: Date;
}

// ===== OUTPUT STRUCTURES =====

/**
 * Monthly cash flow row for detailed tracking
 */
export interface MonthlyCashFlowRow {
  month: number;                   // Month number (0-59 for 5 years)
  year: number;                    // Year (1-5)
  monthInYear: number;             // Month within year (1-12)

  // Calf inventory tracking
  calvesStart: number;             // Becerros al inicio del mes
  calvesBorn: number;              // Nacimientos en el mes
  calvesSold: number;              // Ventas en el mes
  calvesEnd: number;               // Becerros al final del mes

  // Revenues
  calfSalesRevenue: number;        // Ingresos por venta de becerros
  cullCowRevenue: number;          // Ingresos por vacas de desecho
  totalRevenue: number;

  // Costs
  infrastructureCost: number;      // Costo de construcción
  cattlePurchaseCost: number;      // Compra de ganado
  variableCowCost: number;         // Costo variable de vacas
  calfFeedingCost: number;         // Costo de alimentación de becerros
  fixedOperatingCost: number;      // Gastos fijos operativos
  loanPayment: number;             // Pago del crédito
  interestPayment: number;         // Parte de interés del pago
  principalPayment: number;        // Parte de capital del pago
  totalCosts: number;

  // Net cash flow
  netCashFlow: number;
  cumulativeCashFlow: number;

  // Loan balance
  loanBalanceStart: number;
  loanBalanceEnd: number;
}

/**
 * Yearly herd snapshot
 * Note: Using IATF - no bulls in herd
 */
export interface YearlyHerdSnapshot {
  year: number;

  // Beginning of year
  cowsStart: number;
  heifersStart: number;

  // During year
  calvesTotal: number;             // Total nacidos
  calvesAfterMortality: number;    // Después de mortalidad
  maleCalves: number;
  femaleCalves: number;

  // Movements
  heifersMaturing: number;         // Vaquillas que se vuelven vacas
  cowsCulled: number;              // Vacas de desecho
  heifersRetained: number;         // Vaquillas retenidas

  // Deaths
  calfDeaths: number;
  adultDeaths: number;

  // End of year
  cowsEnd: number;
  heifersEnd: number;
  totalHerdEnd: number;

  // Sales
  maleCalvesSold: number;
  femaleCalvesSold: number;
  cullCowsSold: number;
}

/**
 * Annual income statement
 */
export interface IncomeStatementRow {
  year: number;

  // Revenues
  calfSalesRevenue: number;
  cullCowSalesRevenue: number;
  totalRevenue: number;

  // Cost of sales
  variableCosts: number;           // Costos variables (alimentación, veterinario)
  calfFeedingCosts: number;        // Alimentación de becerros
  totalCostOfSales: number;

  grossProfit: number;
  grossMarginPercent: number;

  // Operating expenses
  payrollExpense: number;
  servicesExpense: number;
  travelExpense: number;
  maintenanceExpense: number;
  utilitiesExpense: number;
  insuranceExpense: number;
  otherOperatingExpense: number;
  depreciationExpense: number;
  totalOperatingExpenses: number;

  operatingIncome: number;         // EBIT
  operatingMarginPercent: number;

  // Interest and taxes
  interestExpense: number;
  earningsBeforeTax: number;

  incomeTax: number;               // Estimated at 30%
  netIncome: number;
  netMarginPercent: number;
}

/**
 * Annual balance sheet
 */
export interface BalanceSheetRow {
  year: number;

  // Current assets
  cash: number;
  accountsReceivable: number;
  inventory: number;               // Feed, supplies
  totalCurrentAssets: number;

  // Fixed assets
  infrastructureGross: number;
  livestockValue: number;          // Biological assets
  equipmentValue: number;
  accumulatedDepreciation: number;
  totalFixedAssets: number;

  totalAssets: number;

  // Current liabilities
  accountsPayable: number;
  currentPortionLongTermDebt: number;
  totalCurrentLiabilities: number;

  // Long-term liabilities
  longTermDebt: number;
  totalLongTermLiabilities: number;

  totalLiabilities: number;

  // Equity
  paidInCapital: number;           // Down payment + consulting fee
  retainedEarnings: number;
  currentYearEarnings: number;
  totalEquity: number;

  totalLiabilitiesAndEquity: number;
}

/**
 * Annual cash flow statement
 */
export interface CashFlowStatementRow {
  year: number;

  // Operating activities
  netIncome: number;
  depreciation: number;
  changesInWorkingCapital: number;
  netCashFromOperating: number;

  // Investing activities
  infrastructureInvestment: number;
  cattlePurchases: number;
  netCashFromInvesting: number;

  // Financing activities
  loanProceeds: number;
  loanRepayments: number;
  ownerContributions: number;
  netCashFromFinancing: number;

  netCashChange: number;
  beginningCash: number;
  endingCash: number;
}

/**
 * Loan amortization row (reused from existing)
 */
export interface LoanAmortizationRow {
  paymentNumber: number;
  paymentDate: string;
  beginningBalance: number;
  payment: number;
  principal: number;
  interest: number;
  endingBalance: number;
}

/**
 * Key financial metrics
 */
export interface FinancialMetrics {
  paybackPeriodYears: number;      // Periodo de recuperación
  irr: number;                      // TIR - Tasa Interna de Retorno
  npv: number;                      // VPN - Valor Presente Neto (at 10%)
  roiYear5: number;                 // ROI al año 5
  breakEvenYear: number;            // Año de punto de equilibrio
  debtServiceCoverageRatio: number[]; // Cobertura de deuda por año
  averageNetMargin: number;         // Margen neto promedio
}

/**
 * Investment summary breakdown
 */
export interface InvestmentSummary {
  // Totals
  totalInitialInvestment: number;
  loanAmount: number;
  ownContribution: number;         // Down payment

  // Breakdown
  infrastructureTotal: number;
  cattleTotal: number;
  consultingFee: number;
  workingCapital: number;

  // Monthly payment
  monthlyLoanPayment: number;
  totalLoanPayment: number;
  totalInterest: number;
}

/**
 * Complete projection result
 */
export interface RanchingProjectionResult {
  input: RanchingProjectionInput;

  investmentSummary: InvestmentSummary;

  monthlyCashFlows: MonthlyCashFlowRow[];
  herdProjections: YearlyHerdSnapshot[];
  incomeStatements: IncomeStatementRow[];
  balanceSheets: BalanceSheetRow[];
  cashFlowStatements: CashFlowStatementRow[];
  loanAmortization: LoanAmortizationRow[];

  metrics: FinancialMetrics;

  // Metadata
  generatedAt: Date;
  version: string;
}

// ===== VALIDATION =====

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// lib/ranching-projection/ranching-export.ts
// Multi-sheet Excel export for Cattle Ranching Financial Projection

import type { RanchingProjectionResult } from "./types";
import { formatMetrics, evaluateInvestment } from "./metrics";
import {
  HERD_FORMULAS,
  INCOME_FORMULAS,
  BALANCE_FORMULAS,
  CASHFLOW_FORMULAS,
  METRICS_FORMULAS,
  INVESTMENT_FORMULAS,
  AMORTIZATION_FORMULAS,
} from "./formula-definitions";

/**
 * Format currency for Excel display
 */
function formatMXN(value: number): string {
  return `$${value.toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Format percentage for Excel
 */
function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Build Executive Summary sheet
 */
function buildSummarySheet(
  result: RanchingProjectionResult
): (string | number)[][] {
  const { investmentSummary, metrics, input } = result;
  const formattedMetrics = formatMetrics(metrics);
  const evaluation = evaluateInvestment(metrics);

  return [
    ["SIMULADOR DE PROYECCIÓN GANADERA"],
    ["Ganadero de Precisión - ganaderodeprecision.lat"],
    [],
    ["RESUMEN EJECUTIVO"],
    [],
    ["EVALUACIÓN DEL PROYECTO"],
    ["Calificación:", evaluation.rating.toUpperCase()],
    ["Análisis:", evaluation.summary],
    [],
    ["MÉTRICAS CLAVE"],
    ["Período de Recuperación:", formattedMetrics.paybackPeriod],
    ["TIR (Tasa Interna de Retorno):", formattedMetrics.irr],
    ["VPN (Valor Presente Neto al 10%):", formattedMetrics.npv],
    ["ROI a 5 años:", formattedMetrics.roi],
    ["Año de Equilibrio:", formattedMetrics.breakEven],
    ["Margen Neto Promedio:", formattedMetrics.avgMargin],
    [],
    ["INVERSIÓN INICIAL"],
    ["Monto del Crédito:", formatMXN(input.loan.loanAmount)],
    ["Enganche (Aportación Propia):", formatMXN(investmentSummary.ownContribution)],
    ["Monto Financiado:", formatMXN(investmentSummary.loanAmount)],
    [],
    ["DESGLOSE DE INVERSIÓN"],
    ["Infraestructura:", formatMXN(investmentSummary.infrastructureTotal)],
    ["  - Bodega:", formatMXN(input.infrastructure.warehouseCost)],
    ["  - Manga de Manejo:", formatMXN(input.infrastructure.cattleHandlingCost)],
    ["  - Oficina:", formatMXN(input.infrastructure.officeCost)],
    ["Ganado:", formatMXN(investmentSummary.cattleTotal)],
    ["  - Vacas:", `${input.cattle.numberOfCows} × ${formatMXN(input.cattle.costPerCow)}`],
    ["  - Reproducción:", "IATF (Inseminación Artificial a Tiempo Fijo)"],
    ["Comisión Consultoría:", formatMXN(investmentSummary.consultingFee)],
    ["Capital de Trabajo:", formatMXN(investmentSummary.workingCapital)],
    [],
    ["CONDICIONES DEL CRÉDITO"],
    ["Tasa de Interés Anual:", `${input.loan.annualInterestRate}%`],
    ["Plazo:", `${input.loan.loanTermMonths} meses`],
    ["Período de Gracia:", `${input.loan.gracePeriodMonths} meses`],
    ["Pago Mensual:", formatMXN(investmentSummary.monthlyLoanPayment)],
    ["Total a Pagar:", formatMXN(investmentSummary.totalLoanPayment)],
    ["Total Intereses:", formatMXN(investmentSummary.totalInterest)],
    [],
    ["PROYECCIÓN A 5 AÑOS"],
    [
      "Año",
      "Hato Total",
      "Ingresos",
      "Utilidad Bruta",
      "Utilidad Neta",
      "Margen Neto",
    ],
    ...result.incomeStatements.map((stmt) => [
      `Año ${stmt.year}`,
      result.herdProjections[stmt.year - 1]?.totalHerdEnd ?? 0,
      formatMXN(stmt.totalRevenue),
      formatMXN(stmt.grossProfit),
      formatMXN(stmt.netIncome),
      formatPct(stmt.netMarginPercent),
    ]),
  ];
}

/**
 * Build Investment Details sheet
 */
function buildInvestmentSheet(
  result: RanchingProjectionResult
): (string | number)[][] {
  const { input, investmentSummary } = result;

  return [
    ["DETALLE DE INVERSIÓN INICIAL"],
    [],
    ["INFRAESTRUCTURA"],
    ["Concepto", "Monto"],
    ["Bodega", formatMXN(input.infrastructure.warehouseCost)],
    ["Manga de Manejo (Squeeze Chute)", formatMXN(input.infrastructure.cattleHandlingCost)],
    ["Oficina Administrativa", formatMXN(input.infrastructure.officeCost)],
    ["Otra Infraestructura", formatMXN(input.infrastructure.otherInfrastructureCost)],
    ["SUBTOTAL INFRAESTRUCTURA", formatMXN(investmentSummary.infrastructureTotal)],
    [],
    ["COMPRA DE GANADO"],
    ["Concepto", "Cantidad", "Precio Unitario", "Total"],
    [
      "Vacas (Vientres)",
      input.cattle.numberOfCows,
      formatMXN(input.cattle.costPerCow),
      formatMXN(input.cattle.numberOfCows * input.cattle.costPerCow),
    ],
    ["Reproducción", "IATF", "(Incluido en costos variables)", ""],
    ["SUBTOTAL GANADO", "", "", formatMXN(investmentSummary.cattleTotal)],
    [],
    ["OTROS COSTOS INICIALES"],
    ["Concepto", "Monto"],
    ["Comisión de Consultoría", formatMXN(investmentSummary.consultingFee)],
    ["Capital de Trabajo", formatMXN(investmentSummary.workingCapital)],
    [],
    ["INVERSIÓN TOTAL", formatMXN(input.loan.loanAmount)],
    [],
    ["FINANCIAMIENTO"],
    ["Fuente", "Monto", "Porcentaje"],
    ["Crédito Bancario", formatMXN(investmentSummary.loanAmount), formatPct(100 - input.loan.downPaymentPercent)],
    ["Aportación Propia (Enganche)", formatMXN(investmentSummary.ownContribution), formatPct(input.loan.downPaymentPercent)],
  ];
}

/**
 * Build Herd Projection sheet
 */
function buildHerdSheet(
  result: RanchingProjectionResult
): (string | number)[][] {
  return [
    ["PROYECCIÓN DEL HATO - 5 AÑOS"],
    [],
    [
      "Año",
      "Vacas Inicio",
      "Vaquillas Inicio",
      "Nacimientos",
      "Mortalidad",
      "Becerros Vendidos",
      "Vaquillas Retenidas",
      "Vacas Desecho",
      "Vacas Fin",
      "Vaquillas Fin",
      "Total Hato",
    ],
    ...result.herdProjections.map((snap) => [
      `Año ${snap.year}`,
      snap.cowsStart,
      snap.heifersStart,
      snap.calvesTotal,
      snap.calfDeaths + snap.adultDeaths,
      snap.maleCalvesSold + snap.femaleCalvesSold,
      snap.heifersRetained,
      snap.cullCowsSold,
      snap.cowsEnd,
      snap.heifersEnd,
      snap.totalHerdEnd,
    ]),
  ];
}

/**
 * Build Income Statement sheet
 */
function buildIncomeStatementSheet(
  result: RanchingProjectionResult
): (string | number)[][] {
  const rows: (string | number)[][] = [
    ["ESTADO DE RESULTADOS - PROYECCIÓN 5 AÑOS"],
    [],
    ["Concepto", ...result.incomeStatements.map((s) => `Año ${s.year}`)],
    [],
    ["INGRESOS"],
    ["Venta de Becerros", ...result.incomeStatements.map((s) => formatMXN(s.calfSalesRevenue))],
    ["Venta de Vacas Desecho", ...result.incomeStatements.map((s) => formatMXN(s.cullCowSalesRevenue))],
    ["TOTAL INGRESOS", ...result.incomeStatements.map((s) => formatMXN(s.totalRevenue))],
    [],
    ["COSTO DE VENTAS"],
    ["Costos Variables (Alimentación, Veterinario)", ...result.incomeStatements.map((s) => formatMXN(s.variableCosts))],
    ["Alimentación de Becerros", ...result.incomeStatements.map((s) => formatMXN(s.calfFeedingCosts))],
    ["TOTAL COSTO DE VENTAS", ...result.incomeStatements.map((s) => formatMXN(s.totalCostOfSales))],
    [],
    ["UTILIDAD BRUTA", ...result.incomeStatements.map((s) => formatMXN(s.grossProfit))],
    ["Margen Bruto (%)", ...result.incomeStatements.map((s) => formatPct(s.grossMarginPercent))],
    [],
    ["GASTOS OPERATIVOS"],
    ["Nómina", ...result.incomeStatements.map((s) => formatMXN(s.payrollExpense))],
    ["Servicios", ...result.incomeStatements.map((s) => formatMXN(s.servicesExpense))],
    ["Viáticos", ...result.incomeStatements.map((s) => formatMXN(s.travelExpense))],
    ["Mantenimiento", ...result.incomeStatements.map((s) => formatMXN(s.maintenanceExpense))],
    ["Servicios Públicos", ...result.incomeStatements.map((s) => formatMXN(s.utilitiesExpense))],
    ["Seguro", ...result.incomeStatements.map((s) => formatMXN(s.insuranceExpense))],
    ["Otros Gastos", ...result.incomeStatements.map((s) => formatMXN(s.otherOperatingExpense))],
    ["Depreciación", ...result.incomeStatements.map((s) => formatMXN(s.depreciationExpense))],
    ["TOTAL GASTOS OPERATIVOS", ...result.incomeStatements.map((s) => formatMXN(s.totalOperatingExpenses))],
    [],
    ["UTILIDAD OPERATIVA (EBIT)", ...result.incomeStatements.map((s) => formatMXN(s.operatingIncome))],
    ["Margen Operativo (%)", ...result.incomeStatements.map((s) => formatPct(s.operatingMarginPercent))],
    [],
    ["Gastos Financieros (Intereses)", ...result.incomeStatements.map((s) => formatMXN(s.interestExpense))],
    ["UTILIDAD ANTES DE IMPUESTOS", ...result.incomeStatements.map((s) => formatMXN(s.earningsBeforeTax))],
    [],
    ["Impuesto sobre la Renta (30%)", ...result.incomeStatements.map((s) => formatMXN(s.incomeTax))],
    ["UTILIDAD NETA", ...result.incomeStatements.map((s) => formatMXN(s.netIncome))],
    ["Margen Neto (%)", ...result.incomeStatements.map((s) => formatPct(s.netMarginPercent))],
  ];

  return rows;
}

/**
 * Build Balance Sheet
 */
function buildBalanceSheetSheet(
  result: RanchingProjectionResult
): (string | number)[][] {
  return [
    ["BALANCE GENERAL - PROYECCIÓN 5 AÑOS"],
    [],
    ["Concepto", ...result.balanceSheets.map((s) => `Año ${s.year}`)],
    [],
    ["ACTIVOS"],
    ["Activo Circulante"],
    ["  Efectivo", ...result.balanceSheets.map((s) => formatMXN(s.cash))],
    ["  Cuentas por Cobrar", ...result.balanceSheets.map((s) => formatMXN(s.accountsReceivable))],
    ["  Inventarios", ...result.balanceSheets.map((s) => formatMXN(s.inventory))],
    ["Total Activo Circulante", ...result.balanceSheets.map((s) => formatMXN(s.totalCurrentAssets))],
    [],
    ["Activo Fijo"],
    ["  Infraestructura", ...result.balanceSheets.map((s) => formatMXN(s.infrastructureGross))],
    ["  Ganado (Activo Biológico)", ...result.balanceSheets.map((s) => formatMXN(s.livestockValue))],
    ["  (-) Depreciación Acumulada", ...result.balanceSheets.map((s) => formatMXN(-s.accumulatedDepreciation))],
    ["Total Activo Fijo", ...result.balanceSheets.map((s) => formatMXN(s.totalFixedAssets))],
    [],
    ["TOTAL ACTIVOS", ...result.balanceSheets.map((s) => formatMXN(s.totalAssets))],
    [],
    ["PASIVOS"],
    ["Pasivo Circulante"],
    ["  Cuentas por Pagar", ...result.balanceSheets.map((s) => formatMXN(s.accountsPayable))],
    ["  Porción Circulante Deuda LP", ...result.balanceSheets.map((s) => formatMXN(s.currentPortionLongTermDebt))],
    ["Total Pasivo Circulante", ...result.balanceSheets.map((s) => formatMXN(s.totalCurrentLiabilities))],
    [],
    ["Pasivo a Largo Plazo"],
    ["  Deuda Bancaria LP", ...result.balanceSheets.map((s) => formatMXN(s.longTermDebt))],
    ["Total Pasivo LP", ...result.balanceSheets.map((s) => formatMXN(s.totalLongTermLiabilities))],
    [],
    ["TOTAL PASIVOS", ...result.balanceSheets.map((s) => formatMXN(s.totalLiabilities))],
    [],
    ["CAPITAL CONTABLE"],
    ["  Capital Aportado", ...result.balanceSheets.map((s) => formatMXN(s.paidInCapital))],
    ["  Utilidades Retenidas", ...result.balanceSheets.map((s) => formatMXN(s.retainedEarnings))],
    ["  Utilidad del Ejercicio", ...result.balanceSheets.map((s) => formatMXN(s.currentYearEarnings))],
    ["TOTAL CAPITAL", ...result.balanceSheets.map((s) => formatMXN(s.totalEquity))],
    [],
    ["TOTAL PASIVO + CAPITAL", ...result.balanceSheets.map((s) => formatMXN(s.totalLiabilitiesAndEquity))],
  ];
}

/**
 * Build Cash Flow Statement sheet
 */
function buildCashFlowSheet(
  result: RanchingProjectionResult
): (string | number)[][] {
  return [
    ["ESTADO DE FLUJO DE EFECTIVO - PROYECCIÓN 5 AÑOS"],
    [],
    ["Concepto", ...result.cashFlowStatements.map((s) => `Año ${s.year}`)],
    [],
    ["ACTIVIDADES DE OPERACIÓN"],
    ["Utilidad Neta", ...result.cashFlowStatements.map((s) => formatMXN(s.netIncome))],
    ["(+) Depreciación", ...result.cashFlowStatements.map((s) => formatMXN(s.depreciation))],
    ["(+/-) Cambios en Capital de Trabajo", ...result.cashFlowStatements.map((s) => formatMXN(s.changesInWorkingCapital))],
    ["Flujo de Operación", ...result.cashFlowStatements.map((s) => formatMXN(s.netCashFromOperating))],
    [],
    ["ACTIVIDADES DE INVERSIÓN"],
    ["Inversión en Infraestructura", ...result.cashFlowStatements.map((s) => formatMXN(s.infrastructureInvestment))],
    ["Compra de Ganado", ...result.cashFlowStatements.map((s) => formatMXN(s.cattlePurchases))],
    ["Flujo de Inversión", ...result.cashFlowStatements.map((s) => formatMXN(s.netCashFromInvesting))],
    [],
    ["ACTIVIDADES DE FINANCIAMIENTO"],
    ["Recursos del Crédito", ...result.cashFlowStatements.map((s) => formatMXN(s.loanProceeds))],
    ["Aportación del Propietario", ...result.cashFlowStatements.map((s) => formatMXN(s.ownerContributions))],
    ["Pago de Capital del Crédito", ...result.cashFlowStatements.map((s) => formatMXN(s.loanRepayments))],
    ["Flujo de Financiamiento", ...result.cashFlowStatements.map((s) => formatMXN(s.netCashFromFinancing))],
    [],
    ["CAMBIO NETO EN EFECTIVO", ...result.cashFlowStatements.map((s) => formatMXN(s.netCashChange))],
    ["Efectivo Inicial", ...result.cashFlowStatements.map((s) => formatMXN(s.beginningCash))],
    ["EFECTIVO FINAL", ...result.cashFlowStatements.map((s) => formatMXN(s.endingCash))],
  ];
}

/**
 * Build Amortization sheet
 */
function buildAmortizationSheet(
  result: RanchingProjectionResult
): (string | number)[][] {
  return [
    ["TABLA DE AMORTIZACIÓN DEL CRÉDITO"],
    [],
    [
      "#",
      "Fecha",
      "Saldo Inicial",
      "Pago",
      "Capital",
      "Interés",
      "Saldo Final",
    ],
    ...result.loanAmortization.map((row) => [
      row.paymentNumber,
      row.paymentDate,
      formatMXN(row.beginningBalance),
      formatMXN(row.payment),
      formatMXN(row.principal),
      formatMXN(row.interest),
      formatMXN(row.endingBalance),
    ]),
    [],
    [
      "",
      "TOTALES:",
      "",
      formatMXN(result.investmentSummary.totalLoanPayment),
      formatMXN(result.investmentSummary.loanAmount),
      formatMXN(result.investmentSummary.totalInterest),
      "",
    ],
  ];
}

/**
 * Build Parameters sheet
 * Contains all input parameters used in the projection
 */
function buildParametersSheet(result: RanchingProjectionResult): (string | number)[][] {
  const { loan, infrastructure, cattle, herd, revenue, operatingCosts, consultingFee } = result.input;

  const formatMoney = (v: number) => formatMXN(v);
  const formatPct = (v: number) => `${v}%`;

  const rows: (string | number)[][] = [
    ["PARÁMETROS DE LA PROYECCIÓN"],
    ["Valores utilizados en este modelo"],
    [],
    ["CRÉDITO"],
    ["Parámetro", "Valor", "Descripción"],
    ["Monto del Crédito", formatMoney(loan.loanAmount), "Auto-calculado: (ganado + infraestructura) / (1 - consultoría%)"],
    ["Tasa de Interés Anual", formatPct(loan.annualInterestRate), "Tasa comercial anual"],
    ["Plazo", `${loan.loanTermMonths} meses`, `${loan.loanTermMonths / 12} años`],
    ["Período de Gracia", `${loan.gracePeriodMonths} meses`, "Sin pagos iniciales"],
    ["Enganche", formatPct(loan.downPaymentPercent), "Aportación del productor"],
    [],
    ["INFRAESTRUCTURA"],
    ["Parámetro", "Valor", "Descripción"],
    ["Bodega", formatMoney(infrastructure.warehouseCost), "Bodega rústica"],
    ["Manga de Manejo", formatMoney(infrastructure.cattleHandlingCost), "Manga prefabricada"],
    ["Oficina", formatMoney(infrastructure.officeCost), "Oficina básica"],
    ["Otra Infraestructura", formatMoney(infrastructure.otherInfrastructureCost), "Adicional"],
    ["Meses de Construcción", infrastructure.constructionMonths, ""],
    ["Total Infraestructura", formatMoney(
      infrastructure.warehouseCost + infrastructure.cattleHandlingCost +
      infrastructure.officeCost + infrastructure.otherInfrastructureCost
    ), ""],
    [],
    ["GANADO"],
    ["Parámetro", "Valor", "Descripción"],
    ["Cantidad de Vacas", cattle.numberOfCows, "Vientres productivos"],
    ["Costo por Vaca", formatMoney(cattle.costPerCow), "Precio unitario"],
    ["Mes de Compra", cattle.purchaseMonth, "Después de construcción"],
    ["Total Ganado", formatMoney(cattle.numberOfCows * cattle.costPerCow), ""],
    [],
    ["MANEJO DEL HATO"],
    ["Parámetro", "Valor", "Descripción"],
    ["Tasa de Parición", formatPct(herd.calvingRate), "Usando IATF (sin toros)"],
    ["Mortalidad Becerros", formatPct(herd.calfMortalityRate), ""],
    ["Mortalidad Adultos", formatPct(herd.adultMortalityRate), ""],
    ["Vaquillas Retenidas", herd.heifersRetained, "Para reemplazo anual"],
    ["Tasa de Desecho", formatPct(herd.cowCullRate), "Vacas vendidas por edad"],
    ["% Machos", formatPct(herd.maleCalfPercent), "Distribución natural"],
    [],
    ["PRECIOS DE VENTA"],
    ["Parámetro", "Valor", "Descripción"],
    ["Becerro Macho", formatMoney(revenue.maleCalfPrice), "Por cabeza"],
    ["Becerra Hembra", formatMoney(revenue.femaleCalfPrice), "Por cabeza"],
    ["Vaca de Desecho", formatMoney(revenue.cullCowPrice), "Por cabeza"],
    ["Inflación Anual", formatPct(revenue.annualPriceIncreasePercent), "Incremento de precios"],
    [],
    ["COSTOS DE OPERACIÓN"],
    ["Parámetro", "Valor", "Descripción"],
    ["Costo Variable/Vaca/Año", formatMoney(operatingCosts.variableCostPerCowYear), "Alimento, veterinario, reproducción"],
    ["Alimentación Becerro/Mes", formatMoney(operatingCosts.calfFeedingCostMonth), "Durante crianza"],
    ["Nómina Mensual", formatMoney(operatingCosts.monthlyPayroll), "Trabajadores + prestaciones"],
    ["Servicios Mensuales", formatMoney(operatingCosts.monthlyServices), "Contabilidad, etc."],
    ["Viáticos Mensuales", formatMoney(operatingCosts.monthlyTravel), ""],
    ["Mantenimiento Mensual", formatMoney(operatingCosts.monthlyMaintenance), ""],
    ["Servicios Públicos", formatMoney(operatingCosts.monthlyUtilities), "Luz, agua"],
    ["Seguro Anual", formatMoney(operatingCosts.annualInsurance), ""],
    ["Otros Gastos Fijos", formatMoney(operatingCosts.otherMonthlyFixed), "Mensuales"],
    [],
    ["CONSULTORÍA"],
    ["Parámetro", "Valor", "Descripción"],
    ["Comisión", formatPct(consultingFee.feePercent), "Del monto del crédito"],
    ["Monto Consultoría", formatMoney(loan.loanAmount * (consultingFee.feePercent / 100)), "Ganadero de Precisión"],
  ];

  return rows;
}

/**
 * Build Formulas Reference sheet
 * Contains all formula definitions for transparency
 */
function buildFormulasSheet(): (string | number)[][] {
  const rows: (string | number)[][] = [
    ["GLOSARIO DE FÓRMULAS"],
    ["Descripción de cálculos utilizados en la proyección"],
    [],
  ];

  // Helper to add a section
  const addSection = (
    title: string,
    formulas: Record<string, { name: string; formula: string; description?: string }>
  ) => {
    rows.push([title.toUpperCase()]);
    rows.push(["Campo", "Fórmula", "Descripción"]);
    Object.values(formulas).forEach((f) => {
      rows.push([f.name, f.formula, f.description || ""]);
    });
    rows.push([]);
  };

  addSection("Métricas Clave", METRICS_FORMULAS);
  addSection("Inversión Inicial", INVESTMENT_FORMULAS);
  addSection("Proyección del Hato", HERD_FORMULAS);
  addSection("Estado de Resultados", INCOME_FORMULAS);
  addSection("Balance General", BALANCE_FORMULAS);
  addSection("Flujo de Efectivo", CASHFLOW_FORMULAS);
  addSection("Amortización del Crédito", AMORTIZATION_FORMULAS);

  return rows;
}

/**
 * Export projection to multi-sheet XLSX file
 */
export async function exportProjectionToXLSX(
  result: RanchingProjectionResult
): Promise<void> {
  // Dynamic import of xlsx library
  const XLSX = await import("xlsx");

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Executive Summary
  const summaryData = buildSummarySheet(result);
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet["!cols"] = [{ wch: 35 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen Ejecutivo");

  // Sheet 2: Investment Details
  const investmentData = buildInvestmentSheet(result);
  const investmentSheet = XLSX.utils.aoa_to_sheet(investmentData);
  investmentSheet["!cols"] = [{ wch: 35 }, { wch: 15 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(workbook, investmentSheet, "Inversión Inicial");

  // Sheet 3: Herd Projection
  const herdData = buildHerdSheet(result);
  const herdSheet = XLSX.utils.aoa_to_sheet(herdData);
  herdSheet["!cols"] = Array(12).fill({ wch: 15 });
  XLSX.utils.book_append_sheet(workbook, herdSheet, "Proyección Hato");

  // Sheet 4: Income Statement
  const incomeData = buildIncomeStatementSheet(result);
  const incomeSheet = XLSX.utils.aoa_to_sheet(incomeData);
  incomeSheet["!cols"] = [{ wch: 40 }, ...Array(5).fill({ wch: 18 })];
  XLSX.utils.book_append_sheet(workbook, incomeSheet, "Estado Resultados");

  // Sheet 5: Balance Sheet
  const balanceData = buildBalanceSheetSheet(result);
  const balanceSheet = XLSX.utils.aoa_to_sheet(balanceData);
  balanceSheet["!cols"] = [{ wch: 35 }, ...Array(5).fill({ wch: 18 })];
  XLSX.utils.book_append_sheet(workbook, balanceSheet, "Balance General");

  // Sheet 6: Cash Flow
  const cashFlowData = buildCashFlowSheet(result);
  const cashFlowSheet = XLSX.utils.aoa_to_sheet(cashFlowData);
  cashFlowSheet["!cols"] = [{ wch: 35 }, ...Array(5).fill({ wch: 18 })];
  XLSX.utils.book_append_sheet(workbook, cashFlowSheet, "Flujo Efectivo");

  // Sheet 7: Amortization
  const amortizationData = buildAmortizationSheet(result);
  const amortizationSheet = XLSX.utils.aoa_to_sheet(amortizationData);
  amortizationSheet["!cols"] = [
    { wch: 5 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(workbook, amortizationSheet, "Amortización");

  // Sheet 8: Parameters
  const parametersData = buildParametersSheet(result);
  const parametersSheet = XLSX.utils.aoa_to_sheet(parametersData);
  parametersSheet["!cols"] = [{ wch: 30 }, { wch: 18 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(workbook, parametersSheet, "Parámetros");

  // Sheet 9: Formulas Reference
  const formulasData = buildFormulasSheet();
  const formulasSheet = XLSX.utils.aoa_to_sheet(formulasData);
  formulasSheet["!cols"] = [{ wch: 35 }, { wch: 45 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(workbook, formulasSheet, "Glosario Fórmulas");

  // Generate filename
  const today = new Date().toISOString().split("T")[0];
  const cowCount = result.input.cattle.numberOfCows;
  const filename = `proyeccion-ganadera-${cowCount}cabezas-${today}.xlsx`;

  // Trigger download
  XLSX.writeFile(workbook, filename);
}

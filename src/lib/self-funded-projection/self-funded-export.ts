// lib/self-funded-projection/self-funded-export.ts
// Multi-sheet Excel export for Self-Funded Cattle Ranching Investment (8 sheets, no Amortización)

import type { SelfFundedProjectionResult } from "./types";
import { formatSelfFundedMetrics, evaluateSelfFundedInvestment } from "./index";
import {
  HERD_FORMULAS,
  INCOME_FORMULAS,
  BALANCE_FORMULAS,
  CASHFLOW_FORMULAS,
  METRICS_FORMULAS,
  INVESTMENT_FORMULAS,
} from "./formula-definitions";

function formatMXN(value: number): string {
  return `$${value.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

function buildSummarySheet(result: SelfFundedProjectionResult): (string | number)[][] {
  const { investmentSummary, metrics } = result;
  const formattedMetrics = formatSelfFundedMetrics(metrics);
  const evaluation = evaluateSelfFundedInvestment(metrics);

  return [
    ["SIMULADOR DE INVERSIÓN GANADERA — CAPITAL PROPIO"],
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
    ["ROI a 10 años:", formattedMetrics.roi],
    ["Año de Equilibrio:", formattedMetrics.breakEven],
    ["Margen Neto Promedio:", formattedMetrics.avgMargin],
    [],
    ["INVERSIÓN TOTAL (CAPITAL PROPIO)"],
    ["Infraestructura:", formatMXN(investmentSummary.infrastructureTotal)],
    ["Ganado:", formatMXN(investmentSummary.cattleTotal)],
    ["Consultoría:", formatMXN(investmentSummary.consultingFee)],
    ["CAPITAL TOTAL REQUERIDO:", formatMXN(investmentSummary.totalCashRequired)],
    [],
    ["Nota: Inversión 100% capital propio. Sin deuda bancaria."],
    [],
    ["PROYECCIÓN A 10 AÑOS"],
    ["Año", "Hato Total", "Ingresos", "Utilidad Bruta", "Utilidad Neta", "Margen Neto"],
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

function buildInvestmentSheet(result: SelfFundedProjectionResult): (string | number)[][] {
  const { input, investmentSummary } = result;
  const infra = input.infrastructure;

  return [
    ["DETALLE DE INVERSIÓN INICIAL — CAPITAL PROPIO"],
    [],
    ["INFRAESTRUCTURA (9 Conceptos)"],
    ["Concepto", "Monto"],
    ["Terreno", formatMXN(infra.landCost)],
    ["Bodega", formatMXN(infra.warehouseCost)],
    ["Corrales de Manejo", formatMXN(infra.cattleHandlingCost)],
    ["Oficina", formatMXN(infra.officeCost)],
    ["Pozo Ganadero", formatMXN(infra.waterWellCost)],
    ["Geomembrana", formatMXN(infra.geomembraneCost)],
    ["Casa Habitación", formatMXN(infra.housingCost)],
    ["Área Agrícola", formatMXN(infra.agriculturalAreaCost)],
    ["Maquinaria/Implementos", formatMXN(infra.machineryCost)],
    ["Ingeniero Agrícola (6 meses)", formatMXN(infra.agriculturalEngineerFee)],
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
    ["CONSULTORÍA"],
    ["Comisión Ganadero de Precisión", formatMXN(investmentSummary.consultingFee)],
    [],
    ["CAPITAL TOTAL REQUERIDO", formatMXN(investmentSummary.totalCashRequired)],
    [],
    ["FUENTE DE FINANCIAMIENTO"],
    ["100% Capital Propio del Productor", formatMXN(investmentSummary.totalCashRequired)],
  ];
}

function buildHerdSheet(result: SelfFundedProjectionResult): (string | number)[][] {
  return [
    ["PROYECCIÓN DEL HATO - 10 AÑOS (Parámetros variables por año)"],
    [],
    [
      "Año", "Vacas Inicio", "Vaquillas Inicio", "Nacimientos", "Mortalidad",
      "Becerros Vendidos", "Vaquillas Retenidas", "Vacas Desecho",
      "Vacas Fin", "Vaquillas Fin", "Total Hato",
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

function buildIncomeStatementSheet(result: SelfFundedProjectionResult): (string | number)[][] {
  return [
    ["ESTADO DE RESULTADOS - PROYECCIÓN 10 AÑOS (Sin intereses — Capital Propio)"],
    [],
    ["Concepto", ...result.incomeStatements.map((s) => `Año ${s.year}`)],
    [],
    ["INGRESOS"],
    ["Venta de Becerros", ...result.incomeStatements.map((s) => formatMXN(s.calfSalesRevenue))],
    ["Venta de Vacas Desecho", ...result.incomeStatements.map((s) => formatMXN(s.cullCowSalesRevenue))],
    ["TOTAL INGRESOS", ...result.incomeStatements.map((s) => formatMXN(s.totalRevenue))],
    [],
    ["COSTO DE VENTAS"],
    ["Costos Variables", ...result.incomeStatements.map((s) => formatMXN(s.variableCosts))],
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
    ["(Sin gastos financieros — Capital Propio)"],
    ["UTILIDAD ANTES DE IMPUESTOS", ...result.incomeStatements.map((s) => formatMXN(s.earningsBeforeTax))],
    [],
    ["Impuesto sobre la Renta (Exento)", ...result.incomeStatements.map((s) => formatMXN(s.incomeTax))],
    ["UTILIDAD NETA", ...result.incomeStatements.map((s) => formatMXN(s.netIncome))],
    ["Margen Neto (%)", ...result.incomeStatements.map((s) => formatPct(s.netMarginPercent))],
  ];
}

function buildBalanceSheetSheet(result: SelfFundedProjectionResult): (string | number)[][] {
  return [
    ["BALANCE GENERAL - PROYECCIÓN 10 AÑOS (Sin deuda bancaria)"],
    [],
    ["Concepto", ...result.balanceSheets.map((s) => `Año ${s.year}`)],
    [],
    ["ACTIVOS"],
    ["  Efectivo", ...result.balanceSheets.map((s) => formatMXN(s.cash))],
    ["  Cuentas por Cobrar", ...result.balanceSheets.map((s) => formatMXN(s.accountsReceivable))],
    ["  Inventarios", ...result.balanceSheets.map((s) => formatMXN(s.inventory))],
    ["Total Activo Circulante", ...result.balanceSheets.map((s) => formatMXN(s.totalCurrentAssets))],
    [],
    ["  Infraestructura", ...result.balanceSheets.map((s) => formatMXN(s.infrastructureGross))],
    ["  Ganado (Activo Biológico)", ...result.balanceSheets.map((s) => formatMXN(s.livestockValue))],
    ["  (-) Depreciación Acumulada", ...result.balanceSheets.map((s) => formatMXN(-s.accumulatedDepreciation))],
    ["Total Activo Fijo", ...result.balanceSheets.map((s) => formatMXN(s.totalFixedAssets))],
    [],
    ["TOTAL ACTIVOS", ...result.balanceSheets.map((s) => formatMXN(s.totalAssets))],
    [],
    ["PASIVOS"],
    ["  Cuentas por Pagar", ...result.balanceSheets.map((s) => formatMXN(s.accountsPayable))],
    ["TOTAL PASIVOS", ...result.balanceSheets.map((s) => formatMXN(s.totalLiabilities))],
    [],
    ["CAPITAL CONTABLE"],
    ["  Capital Aportado (Propietario)", ...result.balanceSheets.map((s) => formatMXN(s.paidInCapital))],
    ["  Utilidades Retenidas", ...result.balanceSheets.map((s) => formatMXN(s.retainedEarnings))],
    ["  Utilidad del Ejercicio", ...result.balanceSheets.map((s) => formatMXN(s.currentYearEarnings))],
    ["TOTAL CAPITAL", ...result.balanceSheets.map((s) => formatMXN(s.totalEquity))],
    [],
    ["TOTAL PASIVO + CAPITAL", ...result.balanceSheets.map((s) => formatMXN(s.totalLiabilitiesAndEquity))],
  ];
}

function buildCashFlowSheet(result: SelfFundedProjectionResult): (string | number)[][] {
  return [
    ["ESTADO DE FLUJO DE EFECTIVO - PROYECCIÓN 10 AÑOS (Capital Propio)"],
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
    ["Aportación del Propietario", ...result.cashFlowStatements.map((s) => formatMXN(s.ownerContributions))],
    ["Flujo de Financiamiento", ...result.cashFlowStatements.map((s) => formatMXN(s.netCashFromFinancing))],
    [],
    ["CAMBIO NETO EN EFECTIVO", ...result.cashFlowStatements.map((s) => formatMXN(s.netCashChange))],
    ["Efectivo Inicial", ...result.cashFlowStatements.map((s) => formatMXN(s.beginningCash))],
    ["EFECTIVO FINAL", ...result.cashFlowStatements.map((s) => formatMXN(s.endingCash))],
  ];
}

function buildParametersSheet(result: SelfFundedProjectionResult): (string | number)[][] {
  const { infrastructure, cattle, herd, revenue, operatingCosts, consultingFee } = result.input;
  const fmt = (v: number) => formatMXN(v);
  const pct = (v: number) => `${v}%`;

  return [
    ["PARÁMETROS DE LA PROYECCIÓN — CAPITAL PROPIO"],
    [],
    ["INFRAESTRUCTURA (9 Conceptos)"],
    ["Parámetro", "Valor", "Descripción"],
    ["Terreno", fmt(infrastructure.landCost), "Valor del terreno. $0 si ya es propio."],
    ["Bodega", fmt(infrastructure.warehouseCost), "Almacén de insumos"],
    ["Corrales de Manejo", fmt(infrastructure.cattleHandlingCost), "Corral, embarcadero, báscula, cepo"],
    ["Oficina", fmt(infrastructure.officeCost), "Espacio administrativo"],
    ["Pozo Ganadero", fmt(infrastructure.waterWellCost), "Perforación + bomba + cisterna"],
    ["Geomembrana", fmt(infrastructure.geomembraneCost), "Revestimiento de jagüey"],
    ["Casa Habitación", fmt(infrastructure.housingCost), "Vivienda para encargado"],
    ["Área Agrícola", fmt(infrastructure.agriculturalAreaCost), "Forraje propio (opcional)"],
    ["Maquinaria/Implementos", fmt(infrastructure.machineryCost), "Tractor, remolque (opcional)"],
    ["Ingeniero Agrícola (6 meses)", fmt(infrastructure.agriculturalEngineerFee), "Honorarios ingeniero área agrícola"],
    ["Meses de Construcción", infrastructure.constructionMonths, ""],
    [],
    ["GANADO"],
    ["Parámetro", "Valor", "Descripción"],
    ["Cantidad de Vacas", cattle.numberOfCows, "Vientres productivos"],
    ["Costo por Vaca", fmt(cattle.costPerCow), "Precio unitario"],
    [],
    ["MANEJO DEL HATO (Parámetros por Año)"],
    ["Parámetro", ...herd.heifersRetained.map((_, i) => `Año ${i + 1}`)],
    ["Reemplazos (%)", ...herd.heifersRetained.map((v) => `${v}%`)],
    ["Tasa de Desecho (%)", ...herd.cowCullRate.map((v) => `${v}%`)],
    ["Tasa de Parición (%)", ...herd.calvingRate.map((v) => `${v}%`)],
    [],
    ["Parámetro", "Valor"],
    ["Mortalidad Becerros", pct(herd.calfMortalityRate)],
    ["Mortalidad Adultos", pct(herd.adultMortalityRate)],
    ["% Machos", pct(herd.maleCalfPercent)],
    [],
    ["PRECIOS DE VENTA"],
    ["Parámetro", "Valor"],
    ["Becerro Macho", fmt(revenue.maleCalfPrice)],
    ["Becerra Hembra", fmt(revenue.femaleCalfPrice)],
    ["Vaca de Desecho", fmt(revenue.cullCowPrice)],
    ["Inflación Anual", pct(revenue.annualPriceIncreasePercent)],
    [],
    ["COSTOS DE OPERACIÓN"],
    ["Parámetro", "Valor"],
    ["Costo Variable/Vaca/Año", fmt(operatingCosts.variableCostPerCowYear)],
    ["Alimentación Becerro/Mes", fmt(operatingCosts.calfFeedingCostMonth)],
    ["Nómina Mensual", fmt(operatingCosts.monthlyPayroll)],
    ["Servicios", fmt(operatingCosts.monthlyServices)],
    ["Viáticos", fmt(operatingCosts.monthlyTravel)],
    ["Mantenimiento", fmt(operatingCosts.monthlyMaintenance)],
    ["Servicios Públicos", fmt(operatingCosts.monthlyUtilities)],
    ["Seguro Anual", fmt(operatingCosts.annualInsurance)],
    ["Otros Gastos Fijos", fmt(operatingCosts.otherMonthlyFixed)],
    [],
    ["CONSULTORÍA"],
    ["Comisión", pct(consultingFee.feePercent), "Del total (ganado + infraestructura)"],
  ];
}

function buildFormulasSheet(): (string | number)[][] {
  const rows: (string | number)[][] = [
    ["GLOSARIO DE FÓRMULAS — CAPITAL PROPIO"],
    ["Descripción de cálculos (sin amortización de crédito)"],
    [],
  ];

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

  return rows;
}

/**
 * Export self-funded projection to 8-sheet XLSX
 */
export async function exportSelfFundedToXLSX(
  result: SelfFundedProjectionResult
): Promise<void> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  const sheets: { data: (string | number)[][]; name: string; cols: { wch: number }[] }[] = [
    { data: buildSummarySheet(result), name: "Resumen Ejecutivo", cols: [{ wch: 35 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }] },
    { data: buildInvestmentSheet(result), name: "Inversión Inicial", cols: [{ wch: 35 }, { wch: 15 }, { wch: 18 }, { wch: 18 }] },
    { data: buildHerdSheet(result), name: "Proyección Hato", cols: Array(12).fill({ wch: 15 }) },
    { data: buildIncomeStatementSheet(result), name: "Estado Resultados", cols: [{ wch: 40 }, ...Array(5).fill({ wch: 18 })] },
    { data: buildBalanceSheetSheet(result), name: "Balance General", cols: [{ wch: 35 }, ...Array(5).fill({ wch: 18 })] },
    { data: buildCashFlowSheet(result), name: "Flujo Efectivo", cols: [{ wch: 35 }, ...Array(5).fill({ wch: 18 })] },
    { data: buildParametersSheet(result), name: "Parámetros", cols: [{ wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 50 }] },
    { data: buildFormulasSheet(), name: "Glosario Fórmulas", cols: [{ wch: 35 }, { wch: 45 }, { wch: 40 }] },
  ];

  for (const s of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(s.data);
    ws["!cols"] = s.cols;
    XLSX.utils.book_append_sheet(workbook, ws, s.name);
  }

  const today = new Date().toISOString().split("T")[0];
  const cowCount = result.input.cattle.numberOfCows;
  const filename = `inversion-ganadera-${cowCount}cabezas-${today}.xlsx`;

  XLSX.writeFile(workbook, filename);
}

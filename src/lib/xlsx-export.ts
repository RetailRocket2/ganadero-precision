// lib/xlsx-export.ts
// Excel export utilities for loan amortization tables

import type { LoanParams, LoanSummary } from "./loan-calculations";

/**
 * Export loan summary and amortization table to XLSX file
 * Uses dynamic import to reduce initial bundle size
 */
export async function exportToXLSX(
  summary: LoanSummary,
  params: LoanParams
): Promise<void> {
  // Dynamic import of xlsx library
  const XLSX = await import("xlsx");

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Format currency for display
  const formatMXN = (value: number) =>
    `$${value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Build worksheet data
  const wsData: (string | number)[][] = [
    // Title
    ["SIMULADOR DE CRÉDITO GANADERO"],
    ["Ganadero de Precisión - ganaderodeprecision.lat"],
    [],
    // Cattle details
    ["DETALLE DE LA COMPRA"],
    ["Cantidad de Vacas:", `${params.cattleCount} cabezas`],
    ["Costo por Cabeza:", formatMXN(params.costPerHead)],
    ["Monto Total:", formatMXN(params.principal)],
    [],
    // Loan parameters
    ["PARÁMETROS DEL CRÉDITO"],
    ["Tasa de Interés Anual:", `${params.annualRate.toFixed(2)}%`],
    ["Plazo:", `${params.termMonths} meses`],
    [],
    // Summary
    ["RESUMEN"],
    ["Pago Mensual:", formatMXN(summary.monthlyPayment)],
    ["Total a Pagar:", formatMXN(summary.totalPayment)],
    ["Total de Intereses:", formatMXN(summary.totalInterest)],
    [],
    // Table header
    ["TABLA DE AMORTIZACIÓN"],
    [
      "#",
      "Fecha",
      "Saldo Inicial",
      "Pago",
      "Capital",
      "Interés",
      "Saldo Final",
    ],
  ];

  // Add amortization rows
  for (const row of summary.amortizationTable) {
    wsData.push([
      row.paymentNumber,
      row.paymentDate,
      formatMXN(row.beginningBalance),
      formatMXN(row.payment),
      formatMXN(row.principal),
      formatMXN(row.interest),
      formatMXN(row.endingBalance),
    ]);
  }

  // Add totals row
  wsData.push([]);
  wsData.push([
    "",
    "TOTALES:",
    "",
    formatMXN(summary.totalPayment),
    formatMXN(params.principal),
    formatMXN(summary.totalInterest),
    "",
  ]);

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 5 }, // #
    { wch: 15 }, // Fecha
    { wch: 18 }, // Saldo Inicial
    { wch: 18 }, // Pago
    { wch: 18 }, // Capital
    { wch: 18 }, // Interés
    { wch: 18 }, // Saldo Final
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Amortización");

  // Generate filename with date
  const today = new Date().toISOString().split("T")[0];
  const filename = `credito-ganadero-${params.cattleCount}cabezas-${params.termMonths}meses-${today}.xlsx`;

  // Trigger download
  XLSX.writeFile(workbook, filename);
}

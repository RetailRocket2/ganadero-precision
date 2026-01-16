"use client";

import type { LoanParams, LoanSummary } from "@/lib/loan-calculations";
import { formatCurrency } from "@/lib/loan-calculations";
import { exportToXLSX } from "@/lib/xlsx-export";
import { trackCustomEvent } from "@/lib/meta-pixel";
import { useState } from "react";

interface AmortizationTableProps {
  summary: LoanSummary;
  params: LoanParams;
  onModify: () => void;
}

export function AmortizationTable({
  summary,
  params,
  onModify,
}: AmortizationTableProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToXLSX(summary, params);
      trackCustomEvent("DownloadXLSX", {
        cattleCount: params.cattleCount,
        costPerHead: params.costPerHead,
        principal: params.principal,
        rate: params.annualRate,
        term: params.termMonths,
        monthlyPayment: summary.monthlyPayment,
      });
    } catch (error) {
      console.error("Error exporting to XLSX:", error);
      alert("Hubo un error al generar el archivo. Por favor intenta de nuevo.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-primary-50 rounded-xl p-4 text-center">
          <p className="text-sm text-primary-700 mb-1">Pago Mensual</p>
          <p className="text-2xl font-bold text-primary-900">
            {formatCurrency(summary.monthlyPayment)}
          </p>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Total a Pagar</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.totalPayment)}
          </p>
        </div>
        <div className="bg-earth-50 rounded-xl p-4 text-center">
          <p className="text-sm text-earth-700 mb-1">Total Intereses</p>
          <p className="text-2xl font-bold text-earth-900">
            {formatCurrency(summary.totalInterest)}
          </p>
        </div>
      </div>

      {/* Loan Parameters Summary */}
      <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap gap-3 justify-center text-sm">
        <span className="text-gray-600">
          <strong>{params.cattleCount}</strong> cabezas
        </span>
        <span className="text-gray-400">×</span>
        <span className="text-gray-600">
          <strong>{formatCurrency(params.costPerHead)}</strong>/cabeza
        </span>
        <span className="text-gray-400">=</span>
        <span className="text-gray-600">
          <strong>{formatCurrency(params.principal)}</strong>
        </span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">
          <strong>{params.annualRate}%</strong> anual
        </span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">
          <strong>{params.termMonths}</strong> meses
        </span>
      </div>

      {/* Amortization Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-primary-600 text-white">
              <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Fecha
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold">
                Saldo Inicial
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold">
                Pago
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold">
                Capital
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold">
                Interés
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold">
                Saldo Final
              </th>
            </tr>
          </thead>
          <tbody>
            {summary.amortizationTable.map((row, index) => (
              <tr
                key={row.paymentNumber}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-primary-50 transition-colors`}
              >
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {row.paymentNumber}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {row.paymentDate}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  {formatCurrency(row.beginningBalance)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                  {formatCurrency(row.payment)}
                </td>
                <td className="px-4 py-3 text-sm text-primary-700 text-right">
                  {formatCurrency(row.principal)}
                </td>
                <td className="px-4 py-3 text-sm text-earth-700 text-right">
                  {formatCurrency(row.interest)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  {formatCurrency(row.endingBalance)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={3} className="px-4 py-3 text-sm text-gray-700">
                TOTALES
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 text-right">
                {formatCurrency(summary.totalPayment)}
              </td>
              <td className="px-4 py-3 text-sm text-primary-700 text-right">
                {formatCurrency(params.principal)}
              </td>
              <td className="px-4 py-3 text-sm text-earth-700 text-right">
                {formatCurrency(summary.totalInterest)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 text-right">
                {formatCurrency(0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onModify}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors duration-300 flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 17l-5-5m0 0l5-5m-5 5h12"
            />
          </svg>
          Modificar Datos
        </button>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-300 flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Generando...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Descargar Excel
            </>
          )}
        </button>
      </div>
    </div>
  );
}

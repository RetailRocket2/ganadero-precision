"use client";

import { useState } from "react";
import { LoanForm } from "./LoanForm";
import { AmortizationTable } from "./AmortizationTable";
import type { LoanParams, LoanSummary } from "@/lib/loan-calculations";
import { calculateLoan } from "@/lib/loan-calculations";
import { trackCustomEvent } from "@/lib/meta-pixel";

export function LoanSimulator() {
  const [loanParams, setLoanParams] = useState<LoanParams | null>(null);
  const [result, setResult] = useState<LoanSummary | null>(null);

  const handleCalculate = (params: LoanParams) => {
    const summary = calculateLoan(params);
    setLoanParams(params);
    setResult(summary);

    // Track simulator usage
    trackCustomEvent("SimulatorUsed", {
      cattleCount: params.cattleCount,
      costPerHead: params.costPerHead,
      principal: params.principal,
      rate: params.annualRate,
      term: params.termMonths,
      monthlyPayment: summary.monthlyPayment,
    });
  };

  const handleModify = () => {
    setResult(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
      {!result ? (
        <>
          {/* Form Header */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ingresa los Datos del Crédito
            </h3>
            <p className="text-gray-600 text-sm">
              Completa los campos para calcular tu tabla de amortización
            </p>
          </div>

          <LoanForm
            onSubmit={handleCalculate}
            initialValues={loanParams || undefined}
          />

          {/* Info Box */}
          <div className="mt-6 bg-primary-50 rounded-xl p-4">
            <h4 className="font-medium text-primary-900 mb-2 flex items-center gap-2">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Método de Amortización Francés
            </h4>
            <p className="text-sm text-primary-800">
              Este simulador utiliza el método francés, donde el pago mensual es
              fijo durante toda la vida del crédito. Al inicio, pagas más
              intereses y menos capital. Conforme avanza el tiempo, pagas más
              capital y menos intereses.
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Results Header */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Tu Tabla de Amortización
            </h3>
            <p className="text-gray-600 text-sm">
              Descarga el archivo Excel para tener un registro completo
            </p>
          </div>

          <AmortizationTable
            summary={result}
            params={loanParams!}
            onModify={handleModify}
          />
        </>
      )}
    </div>
  );
}

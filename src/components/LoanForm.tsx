"use client";

import { useState, useMemo } from "react";
import type { LoanParams } from "@/lib/loan-calculations";
import { validateLoanParams, formatCurrency } from "@/lib/loan-calculations";

interface LoanFormProps {
  onSubmit: (params: LoanParams) => void;
  initialValues?: Partial<LoanParams>;
}

const TERM_OPTIONS = [
  { value: 6, label: "6 meses" },
  { value: 12, label: "12 meses (1 año)" },
  { value: 18, label: "18 meses" },
  { value: 24, label: "24 meses (2 años)" },
  { value: 36, label: "36 meses (3 años)" },
  { value: 48, label: "48 meses (4 años)" },
  { value: 60, label: "60 meses (5 años)" },
];

export function LoanForm({ onSubmit, initialValues }: LoanFormProps) {
  const [cattleCount, setCattleCount] = useState(
    initialValues?.cattleCount?.toString() || "10"
  );
  const [costPerHead, setCostPerHead] = useState(
    initialValues?.costPerHead?.toString() || "18,000"
  );
  const [annualRate, setAnnualRate] = useState(
    initialValues?.annualRate?.toString() || "12"
  );
  const [termMonths, setTermMonths] = useState(
    initialValues?.termMonths?.toString() || "24"
  );
  const [errors, setErrors] = useState<string[]>([]);

  // Calculate principal from cattle count and cost per head
  const calculatedPrincipal = useMemo(() => {
    const count = parseInt(cattleCount) || 0;
    const cost = parseFloat(costPerHead.replace(/,/g, "")) || 0;
    return count * cost;
  }, [cattleCount, costPerHead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const count = parseInt(cattleCount) || 0;
    const cost = parseFloat(costPerHead.replace(/,/g, "")) || 0;

    const params: Partial<LoanParams> = {
      cattleCount: count,
      costPerHead: cost,
      principal: count * cost,
      annualRate: parseFloat(annualRate) || 0,
      termMonths: parseInt(termMonths) || 0,
    };

    const validationErrors = validateLoanParams(params);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    onSubmit(params as LoanParams);
  };

  const formatCostInput = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue) {
      return parseInt(numericValue).toLocaleString("es-MX");
    }
    return "";
  };

  const handleCostPerHeadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCostInput(e.target.value);
    setCostPerHead(formatted);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cattle Inputs - Side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cantidad de Vacas */}
        <div>
          <label
            htmlFor="cattleCount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Cantidad de Vacas
          </label>
          <div className="relative">
            <input
              type="number"
              id="cattleCount"
              value={cattleCount}
              onChange={(e) => setCattleCount(e.target.value)}
              min="1"
              max="500"
              placeholder="10"
              className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              cabezas
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Mínimo: 1 - Máximo: 500</p>
        </div>

        {/* Costo por Vaca */}
        <div>
          <label
            htmlFor="costPerHead"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Costo por Vaca
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <input
              type="text"
              id="costPerHead"
              value={costPerHead}
              onChange={handleCostPerHeadChange}
              placeholder="18,000"
              className="w-full pl-8 pr-16 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              MXN
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            $5,000 - $100,000 por cabeza
          </p>
        </div>
      </div>

      {/* Calculated Principal Display */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-700 font-medium">
              Monto Total del Crédito
            </p>
            <p className="text-xs text-primary-600 mt-1">
              {parseInt(cattleCount) || 0} cabezas ×{" "}
              {formatCurrency(parseFloat(costPerHead.replace(/,/g, "")) || 0)}
            </p>
          </div>
          <p className="text-2xl font-bold text-primary-900">
            {formatCurrency(calculatedPrincipal)}
          </p>
        </div>
      </div>

      {/* Annual Rate / Tasa */}
      <div>
        <label
          htmlFor="annualRate"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Tasa de Interés Anual (%)
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            id="annualRate"
            value={annualRate}
            onChange={(e) => {
              // Allow only numbers and decimal point
              const value = e.target.value.replace(/[^0-9.]/g, "");
              // Prevent multiple decimal points
              const parts = value.split(".");
              if (parts.length > 2) return;
              setAnnualRate(value);
            }}
            placeholder="12"
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
            %
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Tasa anual típica: 10% - 24%
        </p>
      </div>

      {/* Term / Plazo */}
      <div>
        <label
          htmlFor="termMonths"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Plazo en Meses
        </label>
        <select
          id="termMonths"
          value={termMonths}
          onChange={(e) => setTermMonths(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg bg-white"
        >
          {TERM_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-300 text-lg flex items-center justify-center gap-2"
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
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        Calcular Crédito
      </button>
    </form>
  );
}

"use client";

import { useState, useCallback } from "react";
import type {
  SelfFundedProjectionInput,
  SelfFundedProjectionResult,
} from "@/lib/self-funded-projection/types";
import {
  getDefaultSelfFundedInput,
  INFRA_TOOLTIPS,
} from "@/lib/self-funded-projection/defaults";
import {
  generateSelfFundedProjection,
  formatSelfFundedMetrics,
  evaluateSelfFundedInvestment,
} from "@/lib/self-funded-projection/index";
import {
  sumInfrastructure,
  calculateTotalInvestment,
  formatCurrency,
} from "@/lib/self-funded-projection/utils";
import { exportSelfFundedToXLSX } from "@/lib/self-funded-projection/self-funded-export";
import { trackCustomEvent } from "@/lib/meta-pixel";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  HERD_FORMULAS,
  INCOME_FORMULAS,
  BALANCE_FORMULAS,
  CASHFLOW_FORMULAS,
  METRICS_FORMULAS,
  INVESTMENT_FORMULAS,
} from "@/lib/self-funded-projection/formula-definitions";

type WizardStep = "investment" | "cattle" | "costs" | "revenue" | "results";

const STEPS: { id: WizardStep; label: string; icon: string }[] = [
  { id: "investment", label: "Inversión", icon: "1" },
  { id: "cattle", label: "Ganado", icon: "2" },
  { id: "costs", label: "Costos", icon: "3" },
  { id: "revenue", label: "Ingresos", icon: "4" },
];

export function SelfFundedSimulator() {
  const [input, setInput] = useState<SelfFundedProjectionInput>(getDefaultSelfFundedInput());
  const [currentStep, setCurrentStep] = useState<WizardStep>("investment");
  const [result, setResult] = useState<SelfFundedProjectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("summary");

  const handleCalculate = useCallback(() => {
    try {
      setError(null);
      const projection = generateSelfFundedProjection(input);
      setResult(projection);
      setCurrentStep("results");

      trackCustomEvent("SelfFundedProjectionCalculated", {
        numberOfCows: input.cattle.numberOfCows,
        totalInvestment: calculateTotalInvestment(
          input.cattle.numberOfCows,
          input.cattle.costPerCow,
          sumInfrastructure(input.infrastructure),
          input.consultingFee.feePercent
        ),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al calcular proyección");
    }
  }, [input]);

  const handleExport = useCallback(async () => {
    if (!result) return;
    setIsExporting(true);
    try {
      await exportSelfFundedToXLSX(result);
      trackCustomEvent("DownloadXLSX", {
        type: "self-funded",
        numberOfCows: input.cattle.numberOfCows,
      });
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  }, [result, input]);

  const goToStep = (step: WizardStep) => setCurrentStep(step);
  const nextStep = () => {
    const stepIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (stepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[stepIndex + 1].id);
    } else {
      handleCalculate();
    }
  };
  const prevStep = () => {
    const stepIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1].id);
  };

  // Live totals
  const infraTotal = sumInfrastructure(input.infrastructure);
  const cattleTotal = input.cattle.numberOfCows * input.cattle.costPerCow;
  const baseCost = cattleTotal + infraTotal;
  const consultingFee = baseCost * (input.consultingFee.feePercent / 100);
  const totalCashRequired = baseCost + consultingFee;

  return (
    <div className="max-w-6xl mx-auto">
      {currentStep !== "results" ? (
        <>
          {/* Step Indicators */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              {STEPS.map((step, idx) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => goToStep(step.id)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${
                      currentStep === step.id
                        ? "bg-primary-600 text-white"
                        : STEPS.findIndex((s) => s.id === currentStep) > idx
                        ? "bg-primary-200 text-primary-800"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step.icon}
                  </button>
                  <span className={`ml-2 text-sm font-medium hidden sm:block ${
                    currentStep === step.id ? "text-primary-700" : "text-gray-500"
                  }`}>
                    {step.label}
                  </span>
                  {idx < STEPS.length - 1 && (
                    <div className="w-8 sm:w-16 h-0.5 bg-gray-200 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Container */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {STEPS.find((s) => s.id === currentStep)?.label}
              </h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {currentStep === "investment" && <InvestmentForm input={input} setInput={setInput} />}
              {currentStep === "cattle" && <CattleForm input={input} setInput={setInput} />}
              {currentStep === "costs" && <CostsForm input={input} setInput={setInput} />}
              {currentStep === "revenue" && <RevenueForm input={input} setInput={setInput} />}

              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevStep}
                  disabled={currentStep === "investment"}
                  className="px-6 py-2 text-gray-600 font-medium disabled:opacity-50"
                >
                  &larr; Anterior
                </button>
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {currentStep === "revenue" ? "Calcular Proyección" : "Siguiente \u2192"}
                </button>
              </div>
            </div>

            {/* Live Summary */}
            <div className="bg-earth-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-earth-800 mb-4">Resumen en Vivo</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-earth-600">Ganado ({input.cattle.numberOfCows} vacas):</span>
                  <span className="font-semibold text-earth-800">{formatCurrency(cattleTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-600">Infraestructura:</span>
                  <span className="font-semibold text-earth-800">{formatCurrency(infraTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-600">Consultoría ({input.consultingFee.feePercent}%):</span>
                  <span className="font-semibold text-earth-800">{formatCurrency(consultingFee)}</span>
                </div>
                <hr className="border-earth-200" />
                <div className="flex justify-between text-base">
                  <span className="text-earth-700 font-medium">Capital Total Requerido:</span>
                  <span className="font-bold text-earth-900">{formatCurrency(totalCashRequired)}</span>
                </div>
                <div className="mt-2 p-2 bg-earth-100 rounded-lg">
                  <p className="text-xs text-earth-600">100% capital propio. Sin deuda bancaria.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <ResultsView
          result={result!}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onModify={() => setCurrentStep("investment")}
          onExport={handleExport}
          isExporting={isExporting}
        />
      )}
    </div>
  );
}

// === FORM COMPONENTS ===

interface FormProps {
  input: SelfFundedProjectionInput;
  setInput: React.Dispatch<React.SetStateAction<SelfFundedProjectionInput>>;
}

function InvestmentForm({ input, setInput }: FormProps) {
  const updateCattle = (field: string, value: number) => {
    setInput((prev) => ({ ...prev, cattle: { ...prev.cattle, [field]: value } }));
  };
  const updateInfra = (field: string, value: number) => {
    setInput((prev) => ({ ...prev, infrastructure: { ...prev.infrastructure, [field]: value } }));
  };

  const infraTotal = sumInfrastructure(input.infrastructure);
  const cattleTotal = input.cattle.numberOfCows * input.cattle.costPerCow;
  const baseCost = cattleTotal + infraTotal;
  const consultingFee = baseCost * (input.consultingFee.feePercent / 100);
  const totalCashRequired = baseCost + consultingFee;

  return (
    <div className="space-y-6">
      {/* Ganado */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Ganado</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Cantidad de Vacas" value={input.cattle.numberOfCows} onChange={(v) => updateCattle("numberOfCows", v)} min={10} max={1000} />
          <NumberInput label="Costo por Vaca" value={input.cattle.costPerCow} onChange={(v) => updateCattle("costPerCow", v)} min={10000} max={200000} step={5000} prefix="$" />
        </div>
      </div>

      {/* Infraestructura - 9 items */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Infraestructura</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {([
            ["landCost", "Terreno", input.infrastructure.landCost],
            ["warehouseCost", "Bodega", input.infrastructure.warehouseCost],
            ["cattleHandlingCost", "Corrales de Manejo", input.infrastructure.cattleHandlingCost],
            ["officeCost", "Oficina", input.infrastructure.officeCost],
            ["waterWellCost", "Pozo Ganadero", input.infrastructure.waterWellCost],
            ["geomembraneCost", "Geomembrana", input.infrastructure.geomembraneCost],
            ["housingCost", "Casa Habitación", input.infrastructure.housingCost],
            ["agriculturalAreaCost", "Área Agrícola", input.infrastructure.agriculturalAreaCost],
            ["machineryCost", "Maquinaria/Implementos", input.infrastructure.machineryCost],
            ["agriculturalEngineerFee", "Ingeniero Agrícola (6 meses)", input.infrastructure.agriculturalEngineerFee],
          ] as [string, string, number][]).map(([field, label, value]) => (
            <NumberInput
              key={field}
              label={label}
              value={value}
              onChange={(v) => updateInfra(field, v)}
              min={0}
              max={10000000}
              step={50000}
              prefix="$"
              tooltip={INFRA_TOOLTIPS[field]}
            />
          ))}
          <NumberInput
            label="Meses de Construcción"
            value={input.infrastructure.constructionMonths}
            onChange={(v) => updateInfra("constructionMonths", v)}
            min={1}
            max={12}
          />
        </div>
      </div>

      {/* Consultoría */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Consultoría</h3>
        <NumberInput
          label="Comisión Ganadero de Precisión"
          value={input.consultingFee.feePercent}
          onChange={(v) => setInput((prev) => ({ ...prev, consultingFee: { feePercent: v } }))}
          min={0}
          max={10}
          step={0.5}
          suffix="%"
        />
      </div>

      {/* Read-only Total */}
      <div className="p-4 bg-primary-50 rounded-xl">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-primary-800">Capital Total Requerido</span>
          <span className="text-2xl font-bold text-primary-900">{formatCurrency(totalCashRequired)}</span>
        </div>
        <p className="text-xs text-primary-600 mt-1">= Ganado + Infraestructura + Consultoría</p>
      </div>
    </div>
  );
}

function CattleForm({ input, setInput }: FormProps) {
  const updateHerd = (field: string, value: number) => {
    setInput((prev) => ({ ...prev, herd: { ...prev.herd, [field]: value } }));
  };
  const updateHerdArray = (field: "calvingRate" | "heifersRetained" | "cowCullRate", yearIndex: number, value: number) => {
    setInput((prev) => {
      const arr = [...prev.herd[field]];
      arr[yearIndex] = value;
      return { ...prev, herd: { ...prev.herd, [field]: arr } };
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Nota:</strong> La cantidad y costo de vacas se configuran en el paso anterior (Inversión).
          Aquí se configuran los parámetros del hato con valores <strong>por año</strong>.
        </p>
      </div>

      {/* Basic herd params */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Parámetros del Hato</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Mortalidad de Becerros" value={input.herd.calfMortalityRate} onChange={(v) => updateHerd("calfMortalityRate", v)} min={0} max={30} suffix="%" />
          <NumberInput label="Mortalidad de Adultos" value={input.herd.adultMortalityRate} onChange={(v) => updateHerd("adultMortalityRate", v)} min={0} max={20} suffix="%" />
        </div>
      </div>

      {/* Per-year calvingRate */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-2">Tasa de Parición (%) / Año</h3>
        <p className="text-xs text-gray-500 mb-3">Porcentaje de vacas que paren cada año. Mejora con el manejo reproductivo (IATF, nutrición, genética).</p>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {input.herd.calvingRate.map((val, i) => (
            <div key={i}>
              <label className="block text-xs font-medium text-gray-500 mb-1 text-center">Año {i + 1}</label>
              <input
                type="number"
                value={val ?? 85}
                onChange={(e) => updateHerdArray("calvingRate", i, Number(e.target.value))}
                min={50}
                max={100}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Per-year heifersRetained (%) */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-2">Reemplazos (%) / Año</h3>
        <p className="text-xs text-gray-500 mb-3">Porcentaje del hato que retienes como vaquillas de reemplazo. Más retención = más crecimiento a largo plazo, menos ventas a corto plazo.</p>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {input.herd.heifersRetained.map((val, i) => (
            <div key={i}>
              <label className="block text-xs font-medium text-gray-500 mb-1 text-center">Año {i + 1}</label>
              <div className="relative">
                <input
                  type="number"
                  value={val ?? 0}
                  onChange={(e) => updateHerdArray("heifersRetained", i, Number(e.target.value))}
                  min={0}
                  max={50}
                  className="w-full px-2 py-2 pr-6 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-year cowCullRate */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-2">Tasa de Desecho (%) / Año</h3>
        <p className="text-xs text-gray-500 mb-3">Porcentaje de vacas que se venden por edad. Años 1-2 son 0% porque no hay vaquillas maduras aún.</p>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {input.herd.cowCullRate.map((val, i) => (
            <div key={i}>
              <label className="block text-xs font-medium text-gray-500 mb-1 text-center">Año {i + 1}</label>
              <input
                type="number"
                value={val}
                onChange={(e) => updateHerdArray("cowCullRate", i, Number(e.target.value))}
                min={0}
                max={50}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {val > 0 && i < 2 && (
                <p className="text-xs text-amber-600 mt-1 text-center">Sin efecto</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CostsForm({ input, setInput }: FormProps) {
  const updateCosts = (field: string, value: number) => {
    setInput((prev) => ({ ...prev, operatingCosts: { ...prev.operatingCosts, [field]: value } }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Costos Variables</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Costo Variable por Vaca/Año" value={input.operatingCosts.variableCostPerCowYear} onChange={(v) => updateCosts("variableCostPerCowYear", v)} min={0} max={50000} step={500} prefix="$" />
          <NumberInput label="Alimentación Becerro/Mes" value={input.operatingCosts.calfFeedingCostMonth} onChange={(v) => updateCosts("calfFeedingCostMonth", v)} min={0} max={5000} step={100} prefix="$" />
        </div>
      </div>
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Costos Fijos Mensuales</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Nómina" value={input.operatingCosts.monthlyPayroll} onChange={(v) => updateCosts("monthlyPayroll", v)} min={0} max={500000} step={1000} prefix="$" />
          <NumberInput label="Servicios" value={input.operatingCosts.monthlyServices} onChange={(v) => updateCosts("monthlyServices", v)} min={0} max={100000} step={500} prefix="$" />
          <NumberInput label="Viáticos" value={input.operatingCosts.monthlyTravel} onChange={(v) => updateCosts("monthlyTravel", v)} min={0} max={50000} step={500} prefix="$" />
          <NumberInput label="Mantenimiento" value={input.operatingCosts.monthlyMaintenance} onChange={(v) => updateCosts("monthlyMaintenance", v)} min={0} max={100000} step={500} prefix="$" />
          <NumberInput label="Servicios Públicos" value={input.operatingCosts.monthlyUtilities} onChange={(v) => updateCosts("monthlyUtilities", v)} min={0} max={50000} step={500} prefix="$" />
          <NumberInput label="Seguro Anual" value={input.operatingCosts.annualInsurance} onChange={(v) => updateCosts("annualInsurance", v)} min={0} max={500000} step={5000} prefix="$" />
        </div>
      </div>
    </div>
  );
}

function RevenueForm({ input, setInput }: FormProps) {
  const updateRevenue = (field: string, value: number) => {
    setInput((prev) => ({ ...prev, revenue: { ...prev.revenue, [field]: value } }));
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg mb-4">
        <p className="text-sm text-blue-700">
          <strong>Operación de cría:</strong> Los becerros se venden a precio fijo por cabeza, no por kilo.
        </p>
      </div>
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Venta de Becerros</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Precio por Becerro Macho" value={input.revenue.maleCalfPrice} onChange={(v) => updateRevenue("maleCalfPrice", v)} min={20000} max={200000} step={5000} prefix="$" />
          <NumberInput label="Precio por Becerra Hembra" value={input.revenue.femaleCalfPrice} onChange={(v) => updateRevenue("femaleCalfPrice", v)} min={10000} max={150000} step={5000} prefix="$" />
        </div>
      </div>
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Venta de Vacas de Desecho</h3>
        <NumberInput label="Precio por Vaca de Desecho" value={input.revenue.cullCowPrice} onChange={(v) => updateRevenue("cullCowPrice", v)} min={5000} max={100000} step={5000} prefix="$" />
      </div>
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Proyecciones</h3>
        <NumberInput label="Incremento Anual de Precios" value={input.revenue.annualPriceIncreasePercent} onChange={(v) => updateRevenue("annualPriceIncreasePercent", v)} min={0} max={20} step={1} suffix="%" />
      </div>
    </div>
  );
}

// === SHARED COMPONENTS ===

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
}

function NumberInput({ label, value, onChange, min = 0, max = 100000000, step = 1, prefix, suffix, tooltip }: NumberInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {tooltip ? (
          <Tooltip content={<span className="text-xs">{tooltip}</span>}>
            <span className="underline decoration-dotted decoration-gray-400 cursor-help">{label}</span>
          </Tooltip>
        ) : label}
      </label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{prefix}</span>}
        <input
          type="number"
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${prefix ? "pl-8" : ""} ${suffix ? "pr-12" : ""}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{suffix}</span>}
      </div>
    </div>
  );
}

// === RESULTS VIEW ===

interface ResultsViewProps {
  result: SelfFundedProjectionResult;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onModify: () => void;
  onExport: () => void;
  isExporting: boolean;
}

function ResultsView({ result, activeTab, setActiveTab, onModify, onExport, isExporting }: ResultsViewProps) {
  const formattedMetrics = formatSelfFundedMetrics(result.metrics);
  const evaluation = evaluateSelfFundedInvestment(result.metrics);

  const tabs = [
    { id: "summary", label: "Resumen" },
    { id: "herd", label: "Hato" },
    { id: "income", label: "Resultados" },
    { id: "balance", label: "Balance" },
    { id: "cashflow", label: "Flujo" },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Período de Recuperación" value={formattedMetrics.paybackPeriod} color="blue" formulaKey="paybackPeriod" />
        <MetricCard label="TIR" value={formattedMetrics.irr} color="green" formulaKey="irr" />
        <MetricCard label="VPN (al 10%)" value={formattedMetrics.npv} color="purple" formulaKey="npv" />
        <MetricCard label="ROI a 10 Años" value={formattedMetrics.roi} color="orange" formulaKey="roi" />
      </div>

      {/* Evaluation Badge */}
      <div className={`p-4 rounded-xl ${
        evaluation.rating === "excelente" ? "bg-green-50 border border-green-200"
        : evaluation.rating === "bueno" ? "bg-blue-50 border border-blue-200"
        : evaluation.rating === "aceptable" ? "bg-yellow-50 border border-yellow-200"
        : "bg-red-50 border border-red-200"
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg capitalize">{evaluation.rating}</span>
          <span className="text-gray-600">&mdash; {evaluation.summary}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6 overflow-x-auto">
          {activeTab === "summary" && <SummaryTab result={result} />}
          {activeTab === "herd" && <HerdTab result={result} />}
          {activeTab === "income" && <IncomeTab result={result} />}
          {activeTab === "balance" && <BalanceTab result={result} />}
          {activeTab === "cashflow" && <CashFlowTab result={result} />}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button onClick={onModify} className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          &larr; Modificar Datos
        </button>
        <button onClick={onExport} disabled={isExporting} className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
          {isExporting ? "Generando..." : "Descargar Excel"}
        </button>
      </div>
    </div>
  );
}

// Tooltip helpers
function FormulaTooltip({ formula, description, calculation }: { formula: string; description?: string; calculation?: string }) {
  return (
    <div>
      <div className="text-gray-300 text-xs">{formula}</div>
      {calculation && <div className="text-green-300 text-xs mt-1 font-mono">{calculation}</div>}
      {description && <div className="text-gray-400 text-xs mt-1 italic">{description}</div>}
    </div>
  );
}

function TipValue({ value, formula, description, calculation, className = "", position = "top" }: {
  value: string | number; formula: string; description?: string; calculation?: string; className?: string; position?: "top" | "bottom";
}) {
  return (
    <Tooltip content={<FormulaTooltip formula={formula} description={description} calculation={calculation} />} position={position}>
      <span className={`underline decoration-dotted decoration-gray-400 ${className}`}>{value}</span>
    </Tooltip>
  );
}

function MetricCard({ label, value, color, formulaKey }: {
  label: string; value: string; color: string; formulaKey?: keyof typeof METRICS_FORMULAS;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
  };
  const formula = formulaKey ? METRICS_FORMULAS[formulaKey] : null;

  return (
    <div className={`${colors[color]} rounded-xl p-4`}>
      <div className="text-sm opacity-75">{label}</div>
      {formula ? (
        <Tooltip content={<FormulaTooltip formula={formula.formula} description={formula.description} />}>
          <div className="text-xl font-bold mt-1 cursor-help underline decoration-dotted decoration-current/30">{value}</div>
        </Tooltip>
      ) : (
        <div className="text-xl font-bold mt-1">{value}</div>
      )}
    </div>
  );
}

// === TAB COMPONENTS ===

function SummaryTab({ result }: { result: SelfFundedProjectionResult }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Inversión (Capital Propio)</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <TipValue value="Infraestructura:" formula={INVESTMENT_FORMULAS.infrastructureTotal.formula} description={INVESTMENT_FORMULAS.infrastructureTotal.description} className="text-gray-600" position="bottom" />
            <span className="font-medium">{formatCurrency(result.investmentSummary.infrastructureTotal)}</span>
          </div>
          <div className="flex justify-between">
            <TipValue value="Ganado:" formula={INVESTMENT_FORMULAS.cattleTotal.formula} description={INVESTMENT_FORMULAS.cattleTotal.description} className="text-gray-600" position="bottom" />
            <span className="font-medium">{formatCurrency(result.investmentSummary.cattleTotal)}</span>
          </div>
          <div className="flex justify-between">
            <TipValue value="Consultoría:" formula={INVESTMENT_FORMULAS.consultingFee.formula} description={INVESTMENT_FORMULAS.consultingFee.description} className="text-gray-600" position="bottom" />
            <span className="font-medium">{formatCurrency(result.investmentSummary.consultingFee)}</span>
          </div>
          <div className="flex justify-between">
            <TipValue value="Capital Total:" formula={INVESTMENT_FORMULAS.totalCashRequired.formula} description={INVESTMENT_FORMULAS.totalCashRequired.description} className="text-gray-600" position="bottom" />
            <span className="font-bold">{formatCurrency(result.investmentSummary.totalCashRequired)}</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Proyección a 10 Años</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Año</th>
              <th className="pb-2 text-right"><TipValue value="Ingresos" formula={INCOME_FORMULAS.totalRevenue.formula} position="bottom" /></th>
              <th className="pb-2 text-right"><TipValue value="Utilidad Neta" formula={INCOME_FORMULAS.netIncome.formula} position="bottom" /></th>
              <th className="pb-2 text-right"><TipValue value="Margen" formula={INCOME_FORMULAS.netMarginPercent.formula} position="bottom" /></th>
            </tr>
          </thead>
          <tbody>
            {result.incomeStatements.map((stmt) => (
              <tr key={stmt.year} className="border-b border-gray-100">
                <td className="py-2">Año {stmt.year}</td>
                <td className="py-2 text-right">{formatCurrency(stmt.totalRevenue)}</td>
                <td className="py-2 text-right">{formatCurrency(stmt.netIncome)}</td>
                <td className="py-2 text-right">{stmt.netMarginPercent.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HerdTab({ result }: { result: SelfFundedProjectionResult }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500 border-b">
          <th className="pb-2">Año</th>
          <th className="pb-2 text-right"><TipValue value="Vacas" formula={HERD_FORMULAS.cowsStart.formula} position="bottom" /></th>
          <th className="pb-2 text-right"><TipValue value="Nacimientos" formula={HERD_FORMULAS.calvesTotal.formula} position="bottom" /></th>
          <th className="pb-2 text-right"><TipValue value="Machos Vend." formula={HERD_FORMULAS.maleCalvesSold.formula} position="bottom" /></th>
          <th className="pb-2 text-right"><TipValue value="Hembras Vend." formula={HERD_FORMULAS.femaleCalvesSold.formula} position="bottom" /></th>
          <th className="pb-2 text-right"><TipValue value="Reemplazo" formula={HERD_FORMULAS.heifersRetained.formula} position="bottom" /></th>
          <th className="pb-2 text-right"><TipValue value="Desecho" formula={HERD_FORMULAS.cowsCulled.formula} position="bottom" /></th>
          <th className="pb-2 text-right"><TipValue value="Total Hato" formula={HERD_FORMULAS.totalHerdEnd.formula} position="bottom" /></th>
        </tr>
      </thead>
      <tbody>
        {result.herdProjections.map((snap) => (
          <tr key={snap.year} className="border-b border-gray-100">
            <td className="py-2">Año {snap.year}</td>
            <td className="py-2 text-right">{snap.cowsStart}</td>
            <td className="py-2 text-right">{snap.calvesTotal}</td>
            <td className="py-2 text-right">{snap.maleCalvesSold}</td>
            <td className="py-2 text-right">{snap.femaleCalvesSold}</td>
            <td className="py-2 text-right">{snap.heifersRetained}</td>
            <td className="py-2 text-right">{snap.cullCowsSold}</td>
            <td className="py-2 text-right font-medium">{snap.totalHerdEnd}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function IncomeTab({ result }: { result: SelfFundedProjectionResult }) {
  const { revenue } = result.input;
  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500 border-b">
          <th className="pb-2">Concepto</th>
          {result.incomeStatements.map((s) => <th key={s.year} className="pb-2 text-right">Año {s.year}</th>)}
        </tr>
      </thead>
      <tbody>
        <tr className="border-b bg-gray-50"><td className="py-2 font-medium" colSpan={6}>Ingresos</td></tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Venta Becerros</td>
          {result.incomeStatements.map((s, i) => {
            const herd = result.herdProjections[i];
            const calc = `${herd.maleCalvesSold} × ${fmt(revenue.maleCalfPrice)} + ${herd.femaleCalvesSold} × ${fmt(revenue.femaleCalfPrice)}`;
            return <td key={s.year} className="py-1 text-right"><TipValue value={formatCurrency(s.calfSalesRevenue)} formula={calc} position="bottom" /></td>;
          })}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Venta Vacas Desecho</td>
          {result.incomeStatements.map((s, i) => {
            const herd = result.herdProjections[i];
            return <td key={s.year} className="py-1 text-right"><TipValue value={formatCurrency(s.cullCowSalesRevenue)} formula={`${herd.cullCowsSold} × ${fmt(revenue.cullCowPrice)}`} position="bottom" /></td>;
          })}
        </tr>
        <tr className="border-b bg-green-50">
          <td className="py-2 font-medium">Total Ingresos</td>
          {result.incomeStatements.map((s) => <td key={s.year} className="py-2 text-right font-medium">{formatCurrency(s.totalRevenue)}</td>)}
        </tr>

        <tr className="border-b bg-gray-50"><td className="py-2 font-medium" colSpan={6}>Costo de Ventas</td></tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4"><TipValue value="Costos Variables" formula={INCOME_FORMULAS.variableCosts.formula} /></td>
          {result.incomeStatements.map((s) => <td key={s.year} className="py-1 text-right text-red-600">-{formatCurrency(s.variableCosts)}</td>)}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4"><TipValue value="Alimentación Becerros" formula={INCOME_FORMULAS.calfFeedingCosts.formula} /></td>
          {result.incomeStatements.map((s) => <td key={s.year} className="py-1 text-right text-red-600">-{formatCurrency(s.calfFeedingCosts)}</td>)}
        </tr>
        <tr className="border-b bg-blue-100">
          <td className="py-2 font-bold"><TipValue value="Utilidad Bruta" formula={INCOME_FORMULAS.grossProfit.formula} /></td>
          {result.incomeStatements.map((s) => <td key={s.year} className="py-2 text-right font-bold">{formatCurrency(s.grossProfit)}</td>)}
        </tr>

        <tr className="border-b bg-gray-50"><td className="py-2 font-medium" colSpan={6}>Gastos Operativos</td></tr>
        {[
          ["Nómina", "payrollExpense"],
          ["Servicios", "servicesExpense"],
          ["Viáticos", "travelExpense"],
          ["Mantenimiento", "maintenanceExpense"],
          ["Servicios Públicos", "utilitiesExpense"],
          ["Seguros", "insuranceExpense"],
          ["Otros", "otherOperatingExpense"],
          ["Depreciación", "depreciationExpense"],
        ].map(([label, key]) => (
          <tr key={key} className="border-b border-gray-100">
            <td className="py-1 pl-4">{label}</td>
            {result.incomeStatements.map((s) => (
              <td key={s.year} className="py-1 text-right text-red-600">-{formatCurrency((s as unknown as Record<string, number>)[key])}</td>
            ))}
          </tr>
        ))}
        <tr className="border-b bg-red-50">
          <td className="py-2 font-medium">Total Gastos Operativos</td>
          {result.incomeStatements.map((s) => <td key={s.year} className="py-2 text-right font-medium text-red-700">-{formatCurrency(s.totalOperatingExpenses)}</td>)}
        </tr>

        <tr className="border-b bg-blue-100">
          <td className="py-2 font-bold"><TipValue value="Utilidad Operativa (EBIT)" formula={INCOME_FORMULAS.operatingIncome.formula} /></td>
          {result.incomeStatements.map((s) => <td key={s.year} className="py-2 text-right font-bold">{formatCurrency(s.operatingIncome)}</td>)}
        </tr>

        {/* No interest section — self-funded */}
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4 text-gray-400 italic" colSpan={6}>Sin gastos financieros — Capital propio</td>
        </tr>

        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4 text-gray-500">ISR (Exento - Actividad Primaria)</td>
          {result.incomeStatements.map((s) => <td key={s.year} className="py-1 text-right text-gray-500">$0</td>)}
        </tr>

        <tr className="bg-primary-100">
          <td className="py-3 font-bold text-base"><TipValue value="Utilidad Neta" formula={INCOME_FORMULAS.netIncome.formula} /></td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className={`py-3 text-right font-bold text-base ${s.netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(s.netIncome)}
            </td>
          ))}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4 text-xs text-gray-500">Margen Neto</td>
          {result.incomeStatements.map((s) => <td key={s.year} className="py-1 text-right text-xs text-gray-500">{s.netMarginPercent.toFixed(1)}%</td>)}
        </tr>
      </tbody>
    </table>
  );
}

function BalanceTab({ result }: { result: SelfFundedProjectionResult }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500 border-b">
          <th className="pb-2">Concepto</th>
          {result.balanceSheets.map((s) => <th key={s.year} className="pb-2 text-right">Año {s.year}</th>)}
        </tr>
      </thead>
      <tbody>
        <tr className="border-b bg-gray-50"><td className="py-2 font-medium" colSpan={6}>Activos</td></tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4"><TipValue value="Efectivo" formula={BALANCE_FORMULAS.cash.formula} position="bottom" /></td>
          {result.balanceSheets.map((s) => <td key={s.year} className="py-1 text-right">{formatCurrency(s.cash)}</td>)}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4"><TipValue value="Ganado" formula={BALANCE_FORMULAS.livestockValue.formula} position="bottom" /></td>
          {result.balanceSheets.map((s) => <td key={s.year} className="py-1 text-right">{formatCurrency(s.livestockValue)}</td>)}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Infraestructura</td>
          {result.balanceSheets.map((s) => <td key={s.year} className="py-1 text-right">{formatCurrency(s.infrastructureGross)}</td>)}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4 text-gray-500">(-) Depreciación</td>
          {result.balanceSheets.map((s) => <td key={s.year} className="py-1 text-right text-gray-500">-{formatCurrency(s.accumulatedDepreciation)}</td>)}
        </tr>
        <tr className="border-b bg-blue-50">
          <td className="py-2 font-medium"><TipValue value="Total Activos" formula={BALANCE_FORMULAS.totalAssets.formula} /></td>
          {result.balanceSheets.map((s) => <td key={s.year} className="py-2 text-right font-medium">{formatCurrency(s.totalAssets)}</td>)}
        </tr>
        <tr className="border-b bg-gray-50"><td className="py-2 font-medium" colSpan={6}>Pasivos</td></tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Cuentas por Pagar</td>
          {result.balanceSheets.map((s) => <td key={s.year} className="py-1 text-right">{formatCurrency(s.accountsPayable)}</td>)}
        </tr>
        <tr className="border-b bg-red-50">
          <td className="py-2 font-medium"><TipValue value="Total Pasivos" formula={BALANCE_FORMULAS.totalLiabilities.formula} /></td>
          {result.balanceSheets.map((s) => <td key={s.year} className="py-2 text-right font-medium">{formatCurrency(s.totalLiabilities)}</td>)}
        </tr>
        <tr className="bg-green-50">
          <td className="py-2 font-bold"><TipValue value="Capital" formula={BALANCE_FORMULAS.totalEquity.formula} /></td>
          {result.balanceSheets.map((s) => <td key={s.year} className="py-2 text-right font-bold">{formatCurrency(s.totalEquity)}</td>)}
        </tr>
      </tbody>
    </table>
  );
}

function CashFlowTab({ result }: { result: SelfFundedProjectionResult }) {
  const stmts = result.cashFlowStatements;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500 border-b">
          <th className="pb-2">Concepto</th>
          {stmts.map((s) => <th key={s.year} className="pb-2 text-right">Año {s.year}</th>)}
        </tr>
      </thead>
      <tbody>
        {/* OPERATING */}
        <tr className="border-b bg-blue-50">
          <td className="py-2 font-semibold text-blue-800" colSpan={stmts.length + 1}>Actividades de Operación</td>
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Utilidad Neta</td>
          {stmts.map((s) => <td key={s.year} className="py-1 text-right">{formatCurrency(s.netIncome)}</td>)}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">+ Depreciación</td>
          {stmts.map((s) => <td key={s.year} className="py-1 text-right">{formatCurrency(s.depreciation)}</td>)}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Cambios en Capital de Trabajo</td>
          {stmts.map((s) => <td key={s.year} className="py-1 text-right">{formatCurrency(s.changesInWorkingCapital)}</td>)}
        </tr>
        <tr className="border-b bg-blue-100">
          <td className="py-2 font-medium"><TipValue value="Flujo Neto de Operación" formula={CASHFLOW_FORMULAS.netCashFromOperating.formula} position="bottom" /></td>
          {stmts.map((s) => <td key={s.year} className="py-2 text-right font-medium">{formatCurrency(s.netCashFromOperating)}</td>)}
        </tr>

        {/* INVESTING */}
        <tr className="border-b bg-orange-50">
          <td className="py-2 font-semibold text-orange-800" colSpan={stmts.length + 1}>Actividades de Inversión</td>
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Infraestructura + Consultoría</td>
          {stmts.map((s) => <td key={s.year} className="py-1 text-right">{formatCurrency(s.infrastructureInvestment)}</td>)}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Compra de Ganado</td>
          {stmts.map((s) => <td key={s.year} className="py-1 text-right">{formatCurrency(s.cattlePurchases)}</td>)}
        </tr>
        <tr className="border-b bg-orange-100">
          <td className="py-2 font-medium"><TipValue value="Flujo Neto de Inversión" formula={CASHFLOW_FORMULAS.netCashFromInvesting.formula} position="bottom" /></td>
          {stmts.map((s) => <td key={s.year} className="py-2 text-right font-medium">{formatCurrency(s.netCashFromInvesting)}</td>)}
        </tr>

        {/* FINANCING */}
        <tr className="border-b bg-purple-50">
          <td className="py-2 font-semibold text-purple-800" colSpan={stmts.length + 1}>Actividades de Financiamiento</td>
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Aportación del Propietario</td>
          {stmts.map((s) => <td key={s.year} className="py-1 text-right">{formatCurrency(s.ownerContributions)}</td>)}
        </tr>
        <tr className="border-b bg-purple-100">
          <td className="py-2 font-medium"><TipValue value="Flujo Neto de Financiamiento" formula={CASHFLOW_FORMULAS.netCashFromFinancing.formula} /></td>
          {stmts.map((s) => <td key={s.year} className="py-2 text-right font-medium">{formatCurrency(s.netCashFromFinancing)}</td>)}
        </tr>

        {/* TOTALS */}
        <tr className="border-b bg-gray-100">
          <td className="py-2 font-medium">Cambio Neto en Efectivo</td>
          {stmts.map((s) => <td key={s.year} className="py-2 text-right font-medium">{formatCurrency(s.netCashChange)}</td>)}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1">Efectivo Inicial</td>
          {stmts.map((s) => <td key={s.year} className="py-1 text-right">{formatCurrency(s.beginningCash)}</td>)}
        </tr>
        <tr className="bg-green-100">
          <td className="py-2 font-bold"><TipValue value="Efectivo Final" formula={CASHFLOW_FORMULAS.endingCash.formula} /></td>
          {stmts.map((s) => <td key={s.year} className="py-2 text-right font-bold text-green-800">{formatCurrency(s.endingCash)}</td>)}
        </tr>
      </tbody>
    </table>
  );
}

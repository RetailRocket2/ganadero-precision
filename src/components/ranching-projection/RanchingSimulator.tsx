"use client";

import { useState, useCallback, useEffect } from "react";
import {
  RanchingProjectionInput,
  RanchingProjectionResult,
  getDefaultInput,
  generateRanchingProjection,
  formatCurrency,
  calculateLoanAmount,
} from "@/lib/ranching-projection";
import { exportProjectionToXLSX } from "@/lib/ranching-projection/ranching-export";
import { formatMetrics, evaluateInvestment } from "@/lib/ranching-projection/metrics";
import { trackCustomEvent } from "@/lib/meta-pixel";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  HERD_FORMULAS,
  INCOME_FORMULAS,
  BALANCE_FORMULAS,
  CASHFLOW_FORMULAS,
  METRICS_FORMULAS,
  INVESTMENT_FORMULAS,
  AMORTIZATION_FORMULAS,
} from "@/lib/ranching-projection/formula-definitions";

type WizardStep = "loan" | "cattle" | "costs" | "revenue" | "results";

const STEPS: { id: WizardStep; label: string; icon: string }[] = [
  { id: "loan", label: "Inversión", icon: "1" },
  { id: "cattle", label: "Ganado", icon: "2" },
  { id: "costs", label: "Costos", icon: "3" },
  { id: "revenue", label: "Ingresos", icon: "4" },
];

export function RanchingSimulator() {
  // Form state
  const [input, setInput] = useState<RanchingProjectionInput>(getDefaultInput());
  const [currentStep, setCurrentStep] = useState<WizardStep>("loan");
  const [result, setResult] = useState<RanchingProjectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("summary");

  // Calculate projection
  const handleCalculate = useCallback(() => {
    try {
      setError(null);
      const projection = generateRanchingProjection(input);
      setResult(projection);
      setCurrentStep("results");

      // Track Meta Pixel event
      trackCustomEvent("ProjectionCalculated", {
        loanAmount: input.loan.loanAmount,
        numberOfCows: input.cattle.numberOfCows,
        projectionYears: input.projectionYears,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al calcular proyección");
    }
  }, [input]);

  // Export to Excel
  const handleExport = useCallback(async () => {
    if (!result) return;
    setIsExporting(true);
    try {
      await exportProjectionToXLSX(result);
      trackCustomEvent("DownloadXLSX", {
        loanAmount: input.loan.loanAmount,
        numberOfCows: input.cattle.numberOfCows,
      });
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  }, [result, input]);

  // Navigation
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
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].id);
    }
  };

  // Calculate live totals
  const infrastructureTotal =
    input.infrastructure.warehouseCost +
    input.infrastructure.cattleHandlingCost +
    input.infrastructure.officeCost +
    input.infrastructure.otherInfrastructureCost;
  const cattleTotal = input.cattle.numberOfCows * input.cattle.costPerCow;

  // Auto-calculate loan amount from cattle + infrastructure + consulting
  const calculatedLoanAmount = calculateLoanAmount(
    input.cattle.numberOfCows,
    input.cattle.costPerCow,
    infrastructureTotal,
    input.consultingFee.feePercent
  );
  const consultingFee = calculatedLoanAmount * (input.consultingFee.feePercent / 100);

  // Keep input.loan.loanAmount in sync with calculated value
  useEffect(() => {
    if (input.loan.loanAmount !== calculatedLoanAmount) {
      setInput((prev) => ({
        ...prev,
        loan: { ...prev.loan, loanAmount: calculatedLoanAmount },
      }));
    }
  }, [calculatedLoanAmount, input.loan.loanAmount]);

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
                  <span
                    className={`ml-2 text-sm font-medium hidden sm:block ${
                      currentStep === step.id ? "text-primary-700" : "text-gray-500"
                    }`}
                  >
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
            {/* Main Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {STEPS.find((s) => s.id === currentStep)?.label}
              </h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {/* Step Content */}
              {currentStep === "loan" && (
                <LoanForm input={input} setInput={setInput} />
              )}
              {currentStep === "cattle" && (
                <CattleForm input={input} setInput={setInput} />
              )}
              {currentStep === "costs" && (
                <CostsForm input={input} setInput={setInput} />
              )}
              {currentStep === "revenue" && (
                <RevenueForm input={input} setInput={setInput} />
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevStep}
                  disabled={currentStep === "loan"}
                  className="px-6 py-2 text-gray-600 font-medium disabled:opacity-50"
                >
                  ← Anterior
                </button>
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {currentStep === "revenue" ? "Calcular Proyección" : "Siguiente →"}
                </button>
              </div>
            </div>

            {/* Live Summary */}
            <div className="bg-earth-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-earth-800 mb-4">
                Resumen en Vivo
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-earth-600">Ganado ({input.cattle.numberOfCows} vacas):</span>
                  <span className="font-semibold text-earth-800">
                    {formatCurrency(cattleTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-600">Infraestructura:</span>
                  <span className="font-semibold text-earth-800">
                    {formatCurrency(infrastructureTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-600">Consultoría ({input.consultingFee.feePercent}%):</span>
                  <span className="font-semibold text-earth-800">
                    {formatCurrency(consultingFee)}
                  </span>
                </div>
                <hr className="border-earth-200" />
                <div className="flex justify-between text-base">
                  <span className="text-earth-700 font-medium">Monto del Crédito:</span>
                  <span className="font-bold text-earth-900">
                    {formatCurrency(calculatedLoanAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-600">Enganche ({input.loan.downPaymentPercent}%):</span>
                  <span className="font-semibold text-earth-800">
                    {formatCurrency(calculatedLoanAmount * (input.loan.downPaymentPercent / 100))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-600">A financiar:</span>
                  <span className="font-semibold text-primary-700">
                    {formatCurrency(calculatedLoanAmount * (1 - input.loan.downPaymentPercent / 100))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Results View */
        <ResultsView
          result={result!}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onModify={() => setCurrentStep("loan")}
          onExport={handleExport}
          isExporting={isExporting}
        />
      )}
    </div>
  );
}

// === FORM COMPONENTS ===

interface FormProps {
  input: RanchingProjectionInput;
  setInput: React.Dispatch<React.SetStateAction<RanchingProjectionInput>>;
}

function LoanForm({ input, setInput }: FormProps) {
  const update = (field: string, value: number) => {
    setInput((prev) => ({
      ...prev,
      loan: { ...prev.loan, [field]: value },
    }));
  };

  const updateCattle = (field: string, value: number) => {
    setInput((prev) => ({
      ...prev,
      cattle: { ...prev.cattle, [field]: value },
    }));
  };

  const updateInfra = (field: string, value: number) => {
    setInput((prev) => ({
      ...prev,
      infrastructure: { ...prev.infrastructure, [field]: value },
    }));
  };

  // Calculate infrastructure total for loan calculation
  const infrastructureTotal =
    input.infrastructure.warehouseCost +
    input.infrastructure.cattleHandlingCost +
    input.infrastructure.officeCost +
    input.infrastructure.otherInfrastructureCost;

  // Auto-calculated loan amount
  const calculatedLoanAmount = calculateLoanAmount(
    input.cattle.numberOfCows,
    input.cattle.costPerCow,
    infrastructureTotal,
    input.consultingFee.feePercent
  );

  return (
    <div className="space-y-6">
      {/* Ganado - FIRST (needed for loan calculation) */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Ganado</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput
            label="Cantidad de Vacas"
            value={input.cattle.numberOfCows}
            onChange={(v) => updateCattle("numberOfCows", v)}
            min={10}
            max={1000}
          />
          <NumberInput
            label="Costo por Vaca"
            value={input.cattle.costPerCow}
            onChange={(v) => updateCattle("costPerCow", v)}
            min={10000}
            max={200000}
            step={5000}
            prefix="$"
          />
        </div>
      </div>

      {/* Infraestructura */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Infraestructura</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput
            label="Bodega"
            value={input.infrastructure.warehouseCost}
            onChange={(v) => updateInfra("warehouseCost", v)}
            min={0}
            max={5000000}
            step={50000}
            prefix="$"
          />
          <NumberInput
            label="Manga de Manejo"
            value={input.infrastructure.cattleHandlingCost}
            onChange={(v) => updateInfra("cattleHandlingCost", v)}
            min={0}
            max={2000000}
            step={50000}
            prefix="$"
          />
          <NumberInput
            label="Oficina"
            value={input.infrastructure.officeCost}
            onChange={(v) => updateInfra("officeCost", v)}
            min={0}
            max={1000000}
            step={25000}
            prefix="$"
          />
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
          onChange={(v) =>
            setInput((prev) => ({
              ...prev,
              consultingFee: { feePercent: v },
            }))
          }
          min={0}
          max={10}
          step={0.5}
          suffix="%"
        />
      </div>

      {/* Crédito - Loan amount is READ-ONLY (auto-calculated) */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Crédito</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Read-only calculated loan amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto del Crédito (calculado)
            </label>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">
              {formatCurrency(calculatedLoanAmount)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              = Ganado + Infraestructura + Consultoría
            </p>
          </div>
          <NumberInput
            label="Tasa de Interés Anual"
            value={input.loan.annualInterestRate}
            onChange={(v) => update("annualInterestRate", v)}
            min={0}
            max={50}
            step={0.5}
            suffix="%"
          />
          <NumberInput
            label="Plazo (meses)"
            value={input.loan.loanTermMonths}
            onChange={(v) => update("loanTermMonths", v)}
            min={12}
            max={120}
            step={12}
          />
          <NumberInput
            label="Enganche"
            value={input.loan.downPaymentPercent}
            onChange={(v) => update("downPaymentPercent", v)}
            min={0}
            max={80}
            step={5}
            suffix="%"
          />
          <NumberInput
            label="Período de Gracia (meses)"
            value={input.loan.gracePeriodMonths}
            onChange={(v) => update("gracePeriodMonths", v)}
            min={0}
            max={24}
          />
        </div>
      </div>
    </div>
  );
}

function CattleForm({ input, setInput }: FormProps) {
  const updateHerd = (field: string, value: number) => {
    setInput((prev) => ({
      ...prev,
      herd: { ...prev.herd, [field]: value },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Note: Cow count/price moved to Inversión step for loan calculation */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Nota:</strong> La cantidad y costo de vacas se configuran en el paso anterior (Inversión)
          ya que determinan el monto del crédito. Aquí se usan <strong>IATF</strong> en lugar de toros.
        </p>
      </div>

      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Parámetros del Hato</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput
            label="Tasa de Parición"
            value={input.herd.calvingRate}
            onChange={(v) => updateHerd("calvingRate", v)}
            min={50}
            max={100}
            suffix="%"
          />
          <NumberInput
            label="Mortalidad de Becerros"
            value={input.herd.calfMortalityRate}
            onChange={(v) => updateHerd("calfMortalityRate", v)}
            min={0}
            max={30}
            suffix="%"
          />
          <NumberInput
            label="Vaquillas Retenidas/Año"
            value={input.herd.heifersRetained}
            onChange={(v) => updateHerd("heifersRetained", v)}
            min={0}
            max={100}
          />
          <NumberInput
            label="Tasa de Desecho"
            value={input.herd.cowCullRate}
            onChange={(v) => updateHerd("cowCullRate", v)}
            min={0}
            max={50}
            suffix="%"
          />
        </div>
      </div>
    </div>
  );
}

function CostsForm({ input, setInput }: FormProps) {
  const updateCosts = (field: string, value: number) => {
    setInput((prev) => ({
      ...prev,
      operatingCosts: { ...prev.operatingCosts, [field]: value },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Costos Variables</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput
            label="Costo Variable por Vaca/Año"
            value={input.operatingCosts.variableCostPerCowYear}
            onChange={(v) => updateCosts("variableCostPerCowYear", v)}
            min={0}
            max={50000}
            step={500}
            prefix="$"
          />
          <NumberInput
            label="Alimentación Becerro/Mes"
            value={input.operatingCosts.calfFeedingCostMonth}
            onChange={(v) => updateCosts("calfFeedingCostMonth", v)}
            min={0}
            max={5000}
            step={100}
            prefix="$"
          />
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Costos Fijos Mensuales</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput
            label="Nómina"
            value={input.operatingCosts.monthlyPayroll}
            onChange={(v) => updateCosts("monthlyPayroll", v)}
            min={0}
            max={500000}
            step={1000}
            prefix="$"
          />
          <NumberInput
            label="Servicios"
            value={input.operatingCosts.monthlyServices}
            onChange={(v) => updateCosts("monthlyServices", v)}
            min={0}
            max={100000}
            step={500}
            prefix="$"
          />
          <NumberInput
            label="Viáticos"
            value={input.operatingCosts.monthlyTravel}
            onChange={(v) => updateCosts("monthlyTravel", v)}
            min={0}
            max={50000}
            step={500}
            prefix="$"
          />
          <NumberInput
            label="Mantenimiento"
            value={input.operatingCosts.monthlyMaintenance}
            onChange={(v) => updateCosts("monthlyMaintenance", v)}
            min={0}
            max={100000}
            step={500}
            prefix="$"
          />
          <NumberInput
            label="Servicios Públicos"
            value={input.operatingCosts.monthlyUtilities}
            onChange={(v) => updateCosts("monthlyUtilities", v)}
            min={0}
            max={50000}
            step={500}
            prefix="$"
          />
          <NumberInput
            label="Seguro Anual"
            value={input.operatingCosts.annualInsurance}
            onChange={(v) => updateCosts("annualInsurance", v)}
            min={0}
            max={500000}
            step={5000}
            prefix="$"
          />
        </div>
      </div>
    </div>
  );
}

function RevenueForm({ input, setInput }: FormProps) {
  const updateRevenue = (field: string, value: number) => {
    setInput((prev) => ({
      ...prev,
      revenue: { ...prev.revenue, [field]: value },
    }));
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
          <NumberInput
            label="Precio por Becerro Macho"
            value={input.revenue.maleCalfPrice}
            onChange={(v) => updateRevenue("maleCalfPrice", v)}
            min={20000}
            max={200000}
            step={5000}
            prefix="$"
          />
          <NumberInput
            label="Precio por Becerra Hembra"
            value={input.revenue.femaleCalfPrice}
            onChange={(v) => updateRevenue("femaleCalfPrice", v)}
            min={10000}
            max={150000}
            step={5000}
            prefix="$"
          />
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Venta de Vacas de Desecho</h3>
        <NumberInput
          label="Precio por Vaca de Desecho"
          value={input.revenue.cullCowPrice}
          onChange={(v) => updateRevenue("cullCowPrice", v)}
          min={5000}
          max={100000}
          step={5000}
          prefix="$"
        />
      </div>

      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Proyecciones</h3>
        <NumberInput
          label="Incremento Anual de Precios"
          value={input.revenue.annualPriceIncreasePercent}
          onChange={(v) => updateRevenue("annualPriceIncreasePercent", v)}
          min={0}
          max={20}
          step={1}
          suffix="%"
        />
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
}

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100000000,
  step = 1,
  prefix,
  suffix,
}: NumberInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            prefix ? "pl-8" : ""
          } ${suffix ? "pr-12" : ""}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// === RESULTS VIEW ===

interface ResultsViewProps {
  result: RanchingProjectionResult;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onModify: () => void;
  onExport: () => void;
  isExporting: boolean;
}

function ResultsView({
  result,
  activeTab,
  setActiveTab,
  onModify,
  onExport,
  isExporting,
}: ResultsViewProps) {
  const formattedMetrics = formatMetrics(result.metrics);
  const evaluation = evaluateInvestment(result.metrics);

  const tabs = [
    { id: "summary", label: "Resumen" },
    { id: "herd", label: "Hato" },
    { id: "income", label: "Resultados" },
    { id: "balance", label: "Balance" },
    { id: "cashflow", label: "Flujo" },
    { id: "amortization", label: "Amortización" },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Período de Recuperación"
          value={formattedMetrics.paybackPeriod}
          color="blue"
          formulaKey="paybackPeriod"
        />
        <MetricCard
          label="TIR"
          value={formattedMetrics.irr}
          color="green"
          formulaKey="irr"
        />
        <MetricCard
          label="VPN (al 10%)"
          value={formattedMetrics.npv}
          color="purple"
          formulaKey="npv"
        />
        <MetricCard
          label="ROI a 5 Años"
          value={formattedMetrics.roi}
          color="orange"
          formulaKey="roi"
        />
      </div>

      {/* Evaluation Badge */}
      <div
        className={`p-4 rounded-xl ${
          evaluation.rating === "excelente"
            ? "bg-green-50 border border-green-200"
            : evaluation.rating === "bueno"
            ? "bg-blue-50 border border-blue-200"
            : evaluation.rating === "aceptable"
            ? "bg-yellow-50 border border-yellow-200"
            : "bg-red-50 border border-red-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg capitalize">{evaluation.rating}</span>
          <span className="text-gray-600">— {evaluation.summary}</span>
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
          {activeTab === "amortization" && <AmortizationTab result={result} />}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={onModify}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Modificar Datos
        </button>
        <button
          onClick={onExport}
          disabled={isExporting}
          className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {isExporting ? "Generando..." : "Descargar Excel"}
        </button>
      </div>
    </div>
  );
}

// Tooltip Content Component
function FormulaTooltip({ formula, description, calculation }: { formula: string; description?: string; calculation?: string }) {
  return (
    <div>
      <div className="text-gray-300 text-xs">{formula}</div>
      {calculation && <div className="text-green-300 text-xs mt-1 font-mono">{calculation}</div>}
      {description && <div className="text-gray-400 text-xs mt-1 italic">{description}</div>}
    </div>
  );
}

// Value with Tooltip wrapper
function TipValue({
  value,
  formula,
  description,
  calculation,
  className = "",
  position = "top",
}: {
  value: string | number;
  formula: string;
  description?: string;
  calculation?: string;
  className?: string;
  position?: "top" | "bottom";
}) {
  return (
    <Tooltip content={<FormulaTooltip formula={formula} description={description} calculation={calculation} />} position={position}>
      <span className={`underline decoration-dotted decoration-gray-400 ${className}`}>
        {value}
      </span>
    </Tooltip>
  );
}

// Metric Card Component
function MetricCard({
  label,
  value,
  color,
  formulaKey,
}: {
  label: string;
  value: string;
  color: string;
  formulaKey?: keyof typeof METRICS_FORMULAS;
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
          <div className="text-xl font-bold mt-1 cursor-help underline decoration-dotted decoration-current/30">
            {value}
          </div>
        </Tooltip>
      ) : (
        <div className="text-xl font-bold mt-1">{value}</div>
      )}
    </div>
  );
}

// Tab Components
function SummaryTab({ result }: { result: RanchingProjectionResult }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Inversión Inicial</h3>
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
            <TipValue value="Total:" formula={INVESTMENT_FORMULAS.totalInitialInvestment.formula} description={INVESTMENT_FORMULAS.totalInitialInvestment.description} className="text-gray-600" position="bottom" />
            <span className="font-bold">{formatCurrency(result.investmentSummary.totalInitialInvestment)}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Proyección a 5 Años</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Año</th>
              <th className="pb-2 text-right">
                <TipValue value="Ingresos" formula={INCOME_FORMULAS.totalRevenue.formula} description={INCOME_FORMULAS.totalRevenue.description} position="bottom" />
              </th>
              <th className="pb-2 text-right">
                <TipValue value="Utilidad Neta" formula={INCOME_FORMULAS.netIncome.formula} description={INCOME_FORMULAS.netIncome.description} position="bottom" />
              </th>
              <th className="pb-2 text-right">
                <TipValue value="Margen" formula={INCOME_FORMULAS.netMarginPercent.formula} description={INCOME_FORMULAS.netMarginPercent.description} position="bottom" />
              </th>
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

function HerdTab({ result }: { result: RanchingProjectionResult }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500 border-b">
          <th className="pb-2">Año</th>
          <th className="pb-2 text-right">
            <TipValue value="Vacas" formula={HERD_FORMULAS.cowsStart.formula} description={HERD_FORMULAS.cowsStart.description} position="bottom" />
          </th>
          <th className="pb-2 text-right">
            <TipValue value="Nacimientos" formula={HERD_FORMULAS.calvesTotal.formula} description={HERD_FORMULAS.calvesTotal.description} position="bottom" />
          </th>
          <th className="pb-2 text-right">
            <TipValue value="Machos Vend." formula={HERD_FORMULAS.maleCalvesSold.formula} description={HERD_FORMULAS.maleCalvesSold.description} position="bottom" />
          </th>
          <th className="pb-2 text-right">
            <TipValue value="Hembras Vend." formula={HERD_FORMULAS.femaleCalvesSold.formula} description={HERD_FORMULAS.femaleCalvesSold.description} position="bottom" />
          </th>
          <th className="pb-2 text-right">
            <TipValue value="Retenidas" formula={HERD_FORMULAS.heifersRetained.formula} description={HERD_FORMULAS.heifersRetained.description} position="bottom" />
          </th>
          <th className="pb-2 text-right">
            <TipValue value="Desecho" formula={HERD_FORMULAS.cowsCulled.formula} description={HERD_FORMULAS.cowsCulled.description} position="bottom" />
          </th>
          <th className="pb-2 text-right">
            <TipValue value="Total Hato" formula={HERD_FORMULAS.totalHerdEnd.formula} description={HERD_FORMULAS.totalHerdEnd.description} position="bottom" />
          </th>
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

function IncomeTab({ result }: { result: RanchingProjectionResult }) {
  const { revenue, cattle } = result.input;
  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500 border-b">
          <th className="pb-2">Concepto</th>
          {result.incomeStatements.map((s) => (
            <th key={s.year} className="pb-2 text-right">Año {s.year}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* === INGRESOS === */}
        <tr className="border-b bg-gray-50"><td className="py-2 font-medium" colSpan={6}>Ingresos</td></tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Venta Becerros</td>
          {result.incomeStatements.map((s, i) => {
            const herd = result.herdProjections[i];
            const calc = `${herd.maleCalvesSold} machos × ${fmt(revenue.maleCalfPrice)} + ${herd.femaleCalvesSold} hembras × ${fmt(revenue.femaleCalfPrice)}`;
            return (
              <td key={s.year} className="py-1 text-right">
                <TipValue value={formatCurrency(s.calfSalesRevenue)} formula={calc} position="bottom" />
              </td>
            );
          })}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Venta Vacas Desecho</td>
          {result.incomeStatements.map((s, i) => {
            const herd = result.herdProjections[i];
            const calc = `${herd.cullCowsSold} vacas × ${fmt(revenue.cullCowPrice)}`;
            return (
              <td key={s.year} className="py-1 text-right">
                <TipValue value={formatCurrency(s.cullCowSalesRevenue)} formula={calc} position="bottom" />
              </td>
            );
          })}
        </tr>
        <tr className="border-b bg-green-50">
          <td className="py-2 font-medium">Total Ingresos</td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-2 text-right font-medium">
              <TipValue value={formatCurrency(s.totalRevenue)} formula={`${formatCurrency(s.calfSalesRevenue)} + ${formatCurrency(s.cullCowSalesRevenue)}`} />
            </td>
          ))}
        </tr>

        {/* === COSTO DE VENTAS === */}
        <tr className="border-b bg-gray-50"><td className="py-2 font-medium" colSpan={6}>Costo de Ventas</td></tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">
            <TipValue value="Costos Variables" formula={INCOME_FORMULAS.variableCosts.formula} description={INCOME_FORMULAS.variableCosts.description} />
          </td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-1 text-right text-red-600">-{formatCurrency(s.variableCosts)}</td>
          ))}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">
            <TipValue value="Alimentación de Becerros" formula={INCOME_FORMULAS.calfFeedingCosts.formula} description={INCOME_FORMULAS.calfFeedingCosts.description} />
          </td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-1 text-right text-red-600">-{formatCurrency(s.calfFeedingCosts)}</td>
          ))}
        </tr>
        <tr className="border-b bg-red-50">
          <td className="py-2 font-medium">
            <TipValue value="Total Costo de Ventas" formula={INCOME_FORMULAS.totalCostOfSales.formula} description={INCOME_FORMULAS.totalCostOfSales.description} />
          </td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-2 text-right font-medium text-red-700">-{formatCurrency(s.totalCostOfSales)}</td>
          ))}
        </tr>
        <tr className="border-b bg-blue-100">
          <td className="py-2 font-bold">
            <TipValue value="Utilidad Bruta" formula={INCOME_FORMULAS.grossProfit.formula} description={INCOME_FORMULAS.grossProfit.description} />
          </td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-2 text-right font-bold">{formatCurrency(s.grossProfit)}</td>
          ))}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4 text-xs text-gray-500">
            <TipValue value="Margen Bruto" formula={INCOME_FORMULAS.grossMarginPercent.formula} description={INCOME_FORMULAS.grossMarginPercent.description} />
          </td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-1 text-right text-xs text-gray-500">{s.grossMarginPercent.toFixed(1)}%</td>
          ))}
        </tr>

        {/* === GASTOS OPERATIVOS === */}
        <tr className="border-b bg-gray-50"><td className="py-2 font-medium" colSpan={6}>Gastos Operativos</td></tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Nómina</td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-1 text-right text-red-600">-{formatCurrency(s.payrollExpense)}</td>
          ))}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Servicios Profesionales</td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-1 text-right text-red-600">-{formatCurrency(s.servicesExpense)}</td>
          ))}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Viáticos</td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-1 text-right text-red-600">-{formatCurrency(s.travelExpense)}</td>
          ))}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Mantenimiento</td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-1 text-right text-red-600">-{formatCurrency(s.maintenanceExpense)}</td>
          ))}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Servicios Públicos</td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-1 text-right text-red-600">-{formatCurrency(s.utilitiesExpense)}</td>
          ))}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Seguros</td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-1 text-right text-red-600">-{formatCurrency(s.insuranceExpense)}</td>
          ))}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Otros Gastos Fijos</td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-1 text-right text-red-600">-{formatCurrency(s.otherOperatingExpense)}</td>
          ))}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Depreciación</td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-1 text-right text-red-600">-{formatCurrency(s.depreciationExpense)}</td>
          ))}
        </tr>
        <tr className="border-b bg-red-50">
          <td className="py-2 font-medium">
            <TipValue value="Total Gastos Operativos" formula={INCOME_FORMULAS.totalOperatingExpenses.formula} description={INCOME_FORMULAS.totalOperatingExpenses.description} />
          </td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-2 text-right font-medium text-red-700">-{formatCurrency(s.totalOperatingExpenses)}</td>
          ))}
        </tr>
        <tr className="border-b bg-blue-100">
          <td className="py-2 font-bold">
            <TipValue value="Utilidad Operativa (EBIT)" formula={INCOME_FORMULAS.operatingIncome.formula} description={INCOME_FORMULAS.operatingIncome.description} />
          </td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-2 text-right font-bold">{formatCurrency(s.operatingIncome)}</td>
          ))}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4 text-xs text-gray-500">
            <TipValue value="Margen Operativo" formula={INCOME_FORMULAS.operatingMarginPercent.formula} description={INCOME_FORMULAS.operatingMarginPercent.description} />
          </td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-1 text-right text-xs text-gray-500">{s.operatingMarginPercent.toFixed(1)}%</td>
          ))}
        </tr>

        {/* === GASTOS FINANCIEROS === */}
        <tr className="border-b bg-gray-50"><td className="py-2 font-medium" colSpan={6}>Gastos Financieros</td></tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">
            <TipValue value="Intereses del Crédito" formula={INCOME_FORMULAS.interestExpense.formula} description={INCOME_FORMULAS.interestExpense.description} />
          </td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-1 text-right text-red-600">-{formatCurrency(s.interestExpense)}</td>
          ))}
        </tr>
        <tr className="border-b bg-yellow-50">
          <td className="py-2 font-bold">
            <TipValue value="Utilidad Antes de Impuestos" formula={INCOME_FORMULAS.earningsBeforeTax.formula} description={INCOME_FORMULAS.earningsBeforeTax.description} />
          </td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-2 text-right font-bold">{formatCurrency(s.earningsBeforeTax)}</td>
          ))}
        </tr>

        {/* === IMPUESTOS === */}
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4 text-gray-500">ISR (Exento - Actividad Primaria)</td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-1 text-right text-gray-500">$0</td>
          ))}
        </tr>

        {/* === UTILIDAD NETA === */}
        <tr className="bg-primary-100">
          <td className="py-3 font-bold text-base">
            <TipValue value="Utilidad Neta" formula={INCOME_FORMULAS.netIncome.formula} description={INCOME_FORMULAS.netIncome.description} />
          </td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className={`py-3 text-right font-bold text-base ${s.netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(s.netIncome)}
            </td>
          ))}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4 text-xs text-gray-500">
            <TipValue value="Margen Neto" formula={INCOME_FORMULAS.netMarginPercent.formula} description={INCOME_FORMULAS.netMarginPercent.description} />
          </td>
          {result.incomeStatements.map((s) => (
            <td key={s.year} className="py-1 text-right text-xs text-gray-500">{s.netMarginPercent.toFixed(1)}%</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function BalanceTab({ result }: { result: RanchingProjectionResult }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500 border-b">
          <th className="pb-2">Concepto</th>
          {result.balanceSheets.map((s) => (
            <th key={s.year} className="pb-2 text-right">Año {s.year}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr className="border-b bg-gray-50"><td className="py-2 font-medium" colSpan={6}>Activos</td></tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">
            <TipValue value="Efectivo" formula={BALANCE_FORMULAS.cash.formula} description={BALANCE_FORMULAS.cash.description} position="bottom" />
          </td>
          {result.balanceSheets.map((s) => (
            <td key={s.year} className="py-1 text-right">{formatCurrency(s.cash)}</td>
          ))}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">
            <TipValue value="Ganado" formula={BALANCE_FORMULAS.livestockValue.formula} description={BALANCE_FORMULAS.livestockValue.description} position="bottom" />
          </td>
          {result.balanceSheets.map((s) => (
            <td key={s.year} className="py-1 text-right">{formatCurrency(s.livestockValue)}</td>
          ))}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">Infraestructura</td>
          {result.balanceSheets.map((s) => (
            <td key={s.year} className="py-1 text-right">{formatCurrency(s.infrastructureGross)}</td>
          ))}
        </tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4 text-gray-500">
            <TipValue value="(-) Depreciación Acumulada" formula={BALANCE_FORMULAS.accumulatedDepreciation.formula} description={BALANCE_FORMULAS.accumulatedDepreciation.description} />
          </td>
          {result.balanceSheets.map((s) => (
            <td key={s.year} className="py-1 text-right text-gray-500">-{formatCurrency(s.accumulatedDepreciation)}</td>
          ))}
        </tr>
        <tr className="border-b bg-blue-50">
          <td className="py-2 font-medium">
            <TipValue value="Total Activos" formula={BALANCE_FORMULAS.totalAssets.formula} description={BALANCE_FORMULAS.totalAssets.description} />
          </td>
          {result.balanceSheets.map((s) => (
            <td key={s.year} className="py-2 text-right font-medium">{formatCurrency(s.totalAssets)}</td>
          ))}
        </tr>
        <tr className="border-b bg-gray-50"><td className="py-2 font-medium" colSpan={6}>Pasivos</td></tr>
        <tr className="border-b border-gray-100">
          <td className="py-1 pl-4">
            <TipValue value="Deuda Bancaria" formula={BALANCE_FORMULAS.longTermDebt.formula} description={BALANCE_FORMULAS.longTermDebt.description} />
          </td>
          {result.balanceSheets.map((s) => (
            <td key={s.year} className="py-1 text-right">{formatCurrency(s.longTermDebt + s.currentPortionLongTermDebt)}</td>
          ))}
        </tr>
        <tr className="border-b bg-red-50">
          <td className="py-2 font-medium">
            <TipValue value="Total Pasivos" formula={BALANCE_FORMULAS.totalLiabilities.formula} description={BALANCE_FORMULAS.totalLiabilities.description} />
          </td>
          {result.balanceSheets.map((s) => (
            <td key={s.year} className="py-2 text-right font-medium">{formatCurrency(s.totalLiabilities)}</td>
          ))}
        </tr>
        <tr className="bg-green-50">
          <td className="py-2 font-bold">
            <TipValue value="Capital" formula={BALANCE_FORMULAS.totalEquity.formula} description={BALANCE_FORMULAS.totalEquity.description} />
          </td>
          {result.balanceSheets.map((s) => (
            <td key={s.year} className="py-2 text-right font-bold">{formatCurrency(s.totalEquity)}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function CashFlowTab({ result }: { result: RanchingProjectionResult }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500 border-b">
          <th className="pb-2">Concepto</th>
          {result.cashFlowStatements.map((s) => (
            <th key={s.year} className="pb-2 text-right">Año {s.year}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr className="border-b bg-blue-50">
          <td className="py-2 font-medium">
            <TipValue value="Flujo de Operación" formula={CASHFLOW_FORMULAS.netCashFromOperating.formula} description={CASHFLOW_FORMULAS.netCashFromOperating.description} position="bottom" />
          </td>
          {result.cashFlowStatements.map((s) => (
            <td key={s.year} className="py-2 text-right font-medium">{formatCurrency(s.netCashFromOperating)}</td>
          ))}
        </tr>
        <tr className="border-b bg-orange-50">
          <td className="py-2 font-medium">
            <TipValue value="Flujo de Inversión" formula={CASHFLOW_FORMULAS.netCashFromInvesting.formula} description={CASHFLOW_FORMULAS.netCashFromInvesting.description} position="bottom" />
          </td>
          {result.cashFlowStatements.map((s) => (
            <td key={s.year} className="py-2 text-right font-medium">{formatCurrency(s.netCashFromInvesting)}</td>
          ))}
        </tr>
        <tr className="border-b bg-purple-50">
          <td className="py-2 font-medium">
            <TipValue value="Flujo de Financiamiento" formula={CASHFLOW_FORMULAS.netCashFromFinancing.formula} description={CASHFLOW_FORMULAS.netCashFromFinancing.description} />
          </td>
          {result.cashFlowStatements.map((s) => (
            <td key={s.year} className="py-2 text-right font-medium">{formatCurrency(s.netCashFromFinancing)}</td>
          ))}
        </tr>
        <tr className="bg-green-50">
          <td className="py-2 font-bold">
            <TipValue value="Efectivo Final" formula={CASHFLOW_FORMULAS.endingCash.formula} description={CASHFLOW_FORMULAS.endingCash.description} />
          </td>
          {result.cashFlowStatements.map((s) => (
            <td key={s.year} className="py-2 text-right font-bold">{formatCurrency(s.endingCash)}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function AmortizationTab({ result }: { result: RanchingProjectionResult }) {
  return (
    <div className="max-h-96 overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white">
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-2">#</th>
            <th className="pb-2">Fecha</th>
            <th className="pb-2 text-right">Saldo Inicial</th>
            <th className="pb-2 text-right">
              <TipValue value="Pago" formula={AMORTIZATION_FORMULAS.payment.formula} description={AMORTIZATION_FORMULAS.payment.description} position="bottom" />
            </th>
            <th className="pb-2 text-right">
              <TipValue value="Capital" formula={AMORTIZATION_FORMULAS.principal.formula} description={AMORTIZATION_FORMULAS.principal.description} position="bottom" />
            </th>
            <th className="pb-2 text-right">
              <TipValue value="Interés" formula={AMORTIZATION_FORMULAS.interest.formula} description={AMORTIZATION_FORMULAS.interest.description} position="bottom" />
            </th>
            <th className="pb-2 text-right">
              <TipValue value="Saldo Final" formula={AMORTIZATION_FORMULAS.endingBalance.formula} description={AMORTIZATION_FORMULAS.endingBalance.description} position="bottom" />
            </th>
          </tr>
        </thead>
        <tbody>
          {result.loanAmortization.map((row) => (
            <tr key={row.paymentNumber} className="border-b border-gray-100">
              <td className="py-1">{row.paymentNumber}</td>
              <td className="py-1">{row.paymentDate}</td>
              <td className="py-1 text-right">{formatCurrency(row.beginningBalance)}</td>
              <td className="py-1 text-right">{formatCurrency(row.payment)}</td>
              <td className="py-1 text-right">{formatCurrency(row.principal)}</td>
              <td className="py-1 text-right">{formatCurrency(row.interest)}</td>
              <td className="py-1 text-right">{formatCurrency(row.endingBalance)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td colSpan={3} className="py-2 font-medium">Totales</td>
            <td className="py-2 text-right font-bold">{formatCurrency(result.investmentSummary.totalLoanPayment)}</td>
            <td className="py-2 text-right font-bold">{formatCurrency(result.investmentSummary.loanAmount)}</td>
            <td className="py-2 text-right font-bold">{formatCurrency(result.investmentSummary.totalInterest)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

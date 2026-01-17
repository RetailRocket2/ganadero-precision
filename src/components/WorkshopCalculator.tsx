"use client";

import { useState, useMemo } from "react";
import {
  WorkshopParams,
  DEFAULT_PARAMS,
  calculateWorkshopMetrics,
  calculateMonthlyMetrics,
  projectAnnual,
  calculateProfitabilityTable,
  formatCurrency,
  WORKSHOP_CONSTANTS,
} from "@/lib/workshop-calculations";
import { trackCustomEvent } from "@/lib/meta-pixel";

export function WorkshopCalculator() {
  // Main inputs (always visible)
  const [participants, setParticipants] = useState(9);
  const [workshopsPerMonth, setWorkshopsPerMonth] = useState(2);

  // Advanced params (in collapsibles)
  const [params, setParams] = useState<WorkshopParams>(DEFAULT_PARAMS);

  // Track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  // Active tab in details section
  const [activeTab, setActiveTab] = useState<"costs" | "table" | "scenarios">(
    "costs"
  );

  // Calculate metrics
  const workshopMetrics = useMemo(
    () => calculateWorkshopMetrics(participants, params),
    [participants, params]
  );

  const monthlyMetrics = useMemo(
    () => calculateMonthlyMetrics(workshopsPerMonth, participants, params),
    [workshopsPerMonth, participants, params]
  );

  const annualProjection = useMemo(
    () => projectAnnual(workshopsPerMonth, participants, params, true),
    [workshopsPerMonth, participants, params]
  );

  const profitabilityTable = useMemo(
    () => calculateProfitabilityTable(params, 3, 12),
    [params]
  );

  const totalPrice = params.workshopFee + params.certificateFee;

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateParam = <K extends keyof WorkshopParams>(
    key: K,
    value: WorkshopParams[K]
  ) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  // Track calculator usage on significant changes
  const handleParticipantsChange = (value: number) => {
    setParticipants(value);
    trackCustomEvent("WorkshopCalculatorUsed", {
      participants: value,
      workshopsPerMonth,
      profit: calculateWorkshopMetrics(value, params).profit,
    });
  };

  // Cost breakdown for pie chart simulation
  const lodgingTotal = params.lodgingPerNight * params.lodgingNights;
  const lunchTotal = params.lunchPerDay * params.workshopDays;
  const coffeeTotal = params.coffeeBreakPerDay * params.workshopDays;
  const workshopFixedTotal =
    params.vehicleRental +
    params.driverFee +
    params.fuelCost +
    params.venueRental;

  const costBreakdown = [
    {
      name: "Capacitadores",
      value: workshopMetrics.totalTrainerCost,
      color: "#e74c3c",
    },
    { name: "Hospedaje", value: lodgingTotal * participants, color: "#3498db" },
    { name: "Comidas", value: lunchTotal * participants, color: "#2ecc71" },
    {
      name: "Coffee breaks",
      value: coffeeTotal * participants,
      color: "#9b59b6",
    },
    {
      name: "Kit bienvenida",
      value: params.welcomeKit * participants,
      color: "#f39c12",
    },
    {
      name: "Certificados",
      value: params.certificateFee * participants,
      color: "#1abc9c",
    },
    { name: "Transporte", value: workshopFixedTotal, color: "#34495e" },
  ];

  const totalCostForPie = costBreakdown.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6">
      {/* Sidebar - Parameters */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-2xl">🎯</span> Mi Taller
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Ajusta los valores para ver tu ganancia
          </p>

          {/* Main inputs - always visible */}
          <div className="space-y-6">
            {/* Participants slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Cuantos participantes esperas?
              </label>
              <input
                type="range"
                min={1}
                max={12}
                value={participants}
                onChange={(e) =>
                  handleParticipantsChange(parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>1</span>
                <span className="font-semibold text-primary-600">
                  {participants}
                </span>
                <span>12</span>
              </div>
            </div>

            {/* Workshops per month */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Cuantos talleres al mes?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setWorkshopsPerMonth(n)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      workshopsPerMonth === n
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <hr className="my-6" />

          {/* Collapsible sections */}
          <div className="space-y-3">
            {/* Prices */}
            <CollapsibleSection
              title="💵 Ajustar Precios"
              isOpen={expandedSections.has("prices")}
              onToggle={() => toggleSection("prices")}
            >
              <div className="space-y-4">
                <NumberInput
                  label="Precio del taller"
                  value={params.workshopFee}
                  onChange={(v) => updateParam("workshopFee", v)}
                  min={1000}
                  max={20000}
                  step={500}
                />
                <NumberInput
                  label="Certificado CONOCER"
                  value={params.certificateFee}
                  onChange={(v) => updateParam("certificateFee", v)}
                  min={0}
                  max={2000}
                  step={100}
                />
                <div className="bg-primary-50 rounded-lg p-3 text-center">
                  <span className="text-sm text-primary-700">
                    Precio total:{" "}
                    <strong>${totalPrice.toLocaleString()} MXN</strong>
                  </span>
                </div>
              </div>
            </CollapsibleSection>

            {/* Trainers */}
            <CollapsibleSection
              title="👨‍🏫 Capacitadores"
              isOpen={expandedSections.has("trainers")}
              onToggle={() => toggleSection("trainers")}
            >
              <div className="space-y-4">
                <NumberInput
                  label="Capacitadores por taller"
                  value={params.trainersPerWorkshop}
                  onChange={(v) => updateParam("trainersPerWorkshop", v)}
                  min={1}
                  max={4}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comision por capacitador: {params.trainerCommissionPct * 100}
                    %
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={params.trainerCommissionPct * 100}
                    onChange={(e) =>
                      updateParam(
                        "trainerCommissionPct",
                        parseInt(e.target.value) / 100
                      )
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <span className="text-sm text-blue-700">
                    Comision total:{" "}
                    <strong>
                      {params.trainerCommissionPct *
                        params.trainersPerWorkshop *
                        100}
                      %
                    </strong>
                  </span>
                </div>
              </div>
            </CollapsibleSection>

            {/* Per-participant costs */}
            <CollapsibleSection
              title="📦 Costos por Participante"
              isOpen={expandedSections.has("participant-costs")}
              onToggle={() => toggleSection("participant-costs")}
            >
              <div className="space-y-4">
                <NumberInput
                  label="Kit de bienvenida"
                  value={params.welcomeKit}
                  onChange={(v) => updateParam("welcomeKit", v)}
                  min={0}
                  max={2000}
                  step={50}
                />
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="Hospedaje/noche"
                    value={params.lodgingPerNight}
                    onChange={(v) => updateParam("lodgingPerNight", v)}
                    min={0}
                    max={2000}
                    step={50}
                  />
                  <NumberInput
                    label="Noches"
                    value={params.lodgingNights}
                    onChange={(v) => updateParam("lodgingNights", v)}
                    min={0}
                    max={5}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="Comida/dia"
                    value={params.lunchPerDay}
                    onChange={(v) => updateParam("lunchPerDay", v)}
                    min={0}
                    max={500}
                    step={25}
                  />
                  <NumberInput
                    label="Dias"
                    value={params.workshopDays}
                    onChange={(v) => updateParam("workshopDays", v)}
                    min={1}
                    max={5}
                  />
                </div>
                <NumberInput
                  label="Coffee break/dia"
                  value={params.coffeeBreakPerDay}
                  onChange={(v) => updateParam("coffeeBreakPerDay", v)}
                  min={0}
                  max={300}
                  step={25}
                />
              </div>
            </CollapsibleSection>

            {/* Workshop fixed costs */}
            <CollapsibleSection
              title="🚐 Costos del Taller"
              isOpen={expandedSections.has("workshop-costs")}
              onToggle={() => toggleSection("workshop-costs")}
            >
              <div className="space-y-4">
                <NumberInput
                  label="Renta de vehiculo"
                  value={params.vehicleRental}
                  onChange={(v) => updateParam("vehicleRental", v)}
                  min={0}
                  max={10000}
                  step={100}
                />
                <NumberInput
                  label="Chofer"
                  value={params.driverFee}
                  onChange={(v) => updateParam("driverFee", v)}
                  min={0}
                  max={5000}
                  step={100}
                />
                <NumberInput
                  label="Gasolina"
                  value={params.fuelCost}
                  onChange={(v) => updateParam("fuelCost", v)}
                  min={0}
                  max={5000}
                  step={100}
                />
                <NumberInput
                  label="Sede/Rancho"
                  value={params.venueRental}
                  onChange={(v) => updateParam("venueRental", v)}
                  min={0}
                  max={20000}
                  step={500}
                />
              </div>
            </CollapsibleSection>

            {/* Advanced */}
            <CollapsibleSection
              title="⚙️ Configuracion Avanzada"
              isOpen={expandedSections.has("advanced")}
              onToggle={() => toggleSection("advanced")}
            >
              <div className="space-y-4">
                <NumberInput
                  label="Contabilidad mensual"
                  value={params.accountingMonthly}
                  onChange={(v) => updateParam("accountingMonthly", v)}
                  min={0}
                  max={20000}
                  step={500}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Impuestos: {params.taxRatePct * 100}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={params.taxRatePct * 100}
                    onChange={(e) =>
                      updateParam("taxRatePct", parseInt(e.target.value) / 100)
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Hero metrics */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg text-gray-600 mb-4">
            Con <strong className="text-gray-900">{participants} participantes</strong> a{" "}
            <strong className="text-gray-900">${totalPrice.toLocaleString()} MXN</strong> cada
            uno...
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {/* Profit */}
            <div className="text-center p-3 sm:p-4 rounded-xl bg-gray-50">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">💰 Ganas por taller</p>
              <p
                className={`text-2xl sm:text-3xl font-bold ${
                  workshopMetrics.profit > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ${workshopMetrics.profit.toLocaleString()}
              </p>
            </div>

            {/* Margin */}
            <div className="text-center p-3 sm:p-4 rounded-xl bg-gray-50">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">📊 Tu margen</p>
              <p
                className={`text-2xl sm:text-3xl font-bold ${
                  workshopMetrics.profitMargin > 30
                    ? "text-green-600"
                    : workshopMetrics.profitMargin > 0
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {workshopMetrics.profitMargin}%
              </p>
              <p className="text-xs text-gray-500">
                {workshopMetrics.profitMargin > 30
                  ? "Excelente"
                  : workshopMetrics.profitMargin > 20
                  ? "Bueno"
                  : workshopMetrics.profitMargin > 0
                  ? "Bajo"
                  : "Perdida"}
              </p>
            </div>

            {/* Break-even */}
            <div className="text-center p-3 sm:p-4 rounded-xl bg-gray-50">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">
                🎯 Minimo
              </p>
              <p
                className={`text-2xl sm:text-3xl font-bold ${
                  workshopMetrics.breakEven <= 12 &&
                  participants >= workshopMetrics.breakEven
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {workshopMetrics.breakEven > 100
                  ? "N/A"
                  : workshopMetrics.breakEven > 12
                  ? ">12"
                  : workshopMetrics.breakEven}
              </p>
              <p className="text-xs text-gray-500">para no perder</p>
            </div>
          </div>

          {/* Capacity bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${workshopMetrics.capacityUtilization}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>
                <strong>{participants} de 12</strong> lugares ocupados (
                {workshopMetrics.capacityUtilization}%)
              </span>
              {participants < 12 && (
                <span>🪑 {12 - participants} lugares libres</span>
              )}
            </div>
          </div>

          {/* Contextual message */}
          {workshopMetrics.breakEven > 100 ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              ⚠️ <strong>No es viable</strong>: El costo por participante es
              mayor que lo que cobras. Revisa tus costos o aumenta el precio.
            </div>
          ) : workshopMetrics.breakEven > 12 ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              ⚠️ <strong>No es viable con 12 personas</strong>: Necesitarias{" "}
              {workshopMetrics.breakEven} participantes para no perder, pero
              solo caben 12.
            </div>
          ) : workshopMetrics.isProfitable ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
              ✅{" "}
              {workshopMetrics.profitMargin > 30 ? (
                <strong>Excelente!</strong>
              ) : (
                <strong>Rentable!</strong>
              )}{" "}
              Con {participants} participantes ganas{" "}
              <strong>${workshopMetrics.profit.toLocaleString()} MXN</strong> por
              taller.
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
              ⚠️ <strong>Necesitas {workshopMetrics.breakEven - participants} participantes mas</strong>{" "}
              para empezar a ganar. Minimo requerido: {workshopMetrics.breakEven}{" "}
              tecnicos.
            </div>
          )}
        </div>

        {/* Annual projection */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">📅</span> ¿Como se ve tu año?
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
            Si haces <strong>{workshopsPerMonth} talleres al mes</strong> con ~
            <strong>{participants} participantes</strong> cada uno...
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-4 sm:mb-6">
            <MetricCard
              label="Ingresos Anuales"
              value={formatCurrency(annualProjection.summary.totalRevenue)}
            />
            <MetricCard
              label="Ganancia Neta"
              value={formatCurrency(annualProjection.summary.totalNetProfit)}
              subtext={`${annualProjection.summary.avgNetMargin}% margen`}
              positive={annualProjection.summary.totalNetProfit > 0}
            />
            <MetricCard
              label="Tecnicos Formados"
              value={annualProjection.summary.totalParticipants.toString()}
            />
            <MetricCard
              label="Clientes Potenciales"
              value={annualProjection.summary.totalPotentialCustomers.toString()}
            />
          </div>

          {/* Simple bar chart visualization */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-medium text-gray-700">
              Proyeccion mensual
            </p>
            <div className="grid grid-cols-12 gap-0.5 sm:gap-1 h-24 sm:h-32">
              {annualProjection.monthlyData.map((month) => {
                const maxProfit = Math.max(
                  ...annualProjection.monthlyData.map((m) =>
                    Math.abs(m.netProfit)
                  )
                );
                const height =
                  maxProfit > 0
                    ? Math.abs(month.netProfit) / maxProfit
                    : 0;
                return (
                  <div key={month.month} className="flex flex-col items-center">
                    <div className="flex-1 w-full flex items-end">
                      <div
                        className={`w-full rounded-t transition-all ${
                          month.netProfit >= 0 ? "bg-green-500" : "bg-red-400"
                        }`}
                        style={{ height: `${height * 100}%`, minHeight: "4px" }}
                        title={`${month.monthName}: ${formatCurrency(
                          month.netProfit
                        )}`}
                      />
                    </div>
                    <span className="text-[8px] sm:text-[10px] text-gray-500 mt-1">
                      {month.monthName.substring(0, 1)}
                      <span className="hidden sm:inline">{month.monthName.substring(1, 3)}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Details tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">📊</span> Ver Detalles
          </h3>

          {/* Tab buttons */}
          <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-1 px-1">
            {[
              { id: "costs" as const, label: "💰 Costos", labelFull: "💰 Mis Costos" },
              { id: "table" as const, label: "📈 Precios", labelFull: "📈 Tabla de Precios" },
              { id: "scenarios" as const, label: "🔄 Escenarios", labelFull: "🔄 Escenarios" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="sm:hidden">{tab.label}</span>
                <span className="hidden sm:inline">{tab.labelFull}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "costs" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cost breakdown visual */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  ¿En que se va el dinero?
                </h4>
                <div className="space-y-2">
                  {costBreakdown.map((item) => {
                    const percentage =
                      totalCostForPie > 0
                        ? (item.value / totalCostForPie) * 100
                        : 0;
                    return (
                      <div key={item.name} className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span>{item.name}</span>
                            <span className="font-medium">
                              ${item.value.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: item.color,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cost summary table */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Resumen de Costos
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">
                      👨‍🏫 Comision capacitadores
                    </span>
                    <span className="font-medium">
                      ${workshopMetrics.totalTrainerCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">
                      📦 Costos por participante ({participants}×)
                    </span>
                    <span className="font-medium">
                      ${workshopMetrics.totalVariableCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">
                      🚐 Costos fijos del taller
                    </span>
                    <span className="font-medium">
                      ${workshopMetrics.totalFixedCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b-2 border-gray-300">
                    <span className="font-semibold">TOTAL COSTOS</span>
                    <span className="font-bold">
                      ${workshopMetrics.totalCosts.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">💵 Ingresos totales</span>
                    <span className="font-medium">
                      ${workshopMetrics.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">➖ Menos costos</span>
                    <span className="font-medium text-red-600">
                      -${workshopMetrics.totalCosts.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 bg-gray-50 rounded-lg px-3">
                    <span className="font-bold">= Tu ganancia</span>
                    <span
                      className={`font-bold ${
                        workshopMetrics.profit > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ${workshopMetrics.profit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "table" && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">
                ¿Cuanto gano segun el numero de participantes?
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left py-2 px-3">Participantes</th>
                      <th className="text-right py-2 px-3">Ingresos</th>
                      <th className="text-right py-2 px-3">Costos</th>
                      <th className="text-right py-2 px-3">Ganancia</th>
                      <th className="text-right py-2 px-3">Margen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitabilityTable.map((row) => (
                      <tr
                        key={row.participants}
                        className={`border-b ${
                          row.participants === participants
                            ? "bg-primary-50"
                            : ""
                        }`}
                      >
                        <td className="py-2 px-3 font-medium">
                          {row.participants}
                          {row.participants === participants && (
                            <span className="ml-2 text-primary-600">←</span>
                          )}
                        </td>
                        <td className="text-right py-2 px-3">
                          ${row.revenue.toLocaleString()}
                        </td>
                        <td className="text-right py-2 px-3">
                          ${row.totalCosts.toLocaleString()}
                        </td>
                        <td
                          className={`text-right py-2 px-3 font-medium ${
                            row.isProfitable ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {row.profit >= 0
                            ? `$${row.profit.toLocaleString()}`
                            : `-$${Math.abs(row.profit).toLocaleString()}`}
                        </td>
                        <td className="text-right py-2 px-3">{row.margin}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "scenarios" && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">
                Compara diferentes escenarios de crecimiento
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: "🌱 Empezando",
                    desc: "1 taller, 8 participantes",
                    workshops: 1,
                    participants: 8,
                  },
                  {
                    name: "📊 Estable",
                    desc: "2 talleres, 10 participantes",
                    workshops: 2,
                    participants: 10,
                  },
                  {
                    name: "📈 Creciendo",
                    desc: "4 talleres, 11 participantes",
                    workshops: 4,
                    participants: 11,
                  },
                  {
                    name: "🚀 Escalando",
                    desc: "6 talleres, 12 participantes",
                    workshops: 6,
                    participants: 12,
                  },
                ].map((scenario, idx) => {
                  const projection = projectAnnual(
                    scenario.workshops,
                    scenario.participants,
                    params,
                    true
                  );
                  const colors = ["#3498db", "#28a745", "#f39c12", "#9b59b6"];
                  return (
                    <div
                      key={scenario.name}
                      className="rounded-xl p-4"
                      style={{
                        backgroundColor: `${colors[idx]}15`,
                        borderLeft: `4px solid ${colors[idx]}`,
                      }}
                    >
                      <h5
                        className="font-semibold mb-1"
                        style={{ color: colors[idx] }}
                      >
                        {scenario.name}
                      </h5>
                      <p className="text-xs text-gray-500 mb-3">
                        {scenario.desc}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ganancia/mes</span>
                          <span className="font-medium">
                            {formatCurrency(
                              projection.summary.totalNetProfit / 12
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ganancia/año</span>
                          <span className="font-bold">
                            {formatCurrency(projection.summary.totalNetProfit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper components
function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-gray-700">{title}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && <div className="p-4 border-t border-gray-200">{children}</div>}
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100000,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  positive,
}: {
  label: string;
  value: string;
  subtext?: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center">
      <p className="text-xs sm:text-sm text-gray-500 mb-1 truncate">{label}</p>
      <p
        className={`text-lg sm:text-xl font-bold ${
          positive !== undefined
            ? positive
              ? "text-green-600"
              : "text-red-600"
            : "text-gray-900"
        }`}
      >
        {value}
      </p>
      {subtext && <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
  );
}

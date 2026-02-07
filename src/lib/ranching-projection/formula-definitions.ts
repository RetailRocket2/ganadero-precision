// lib/ranching-projection/formula-definitions.ts
// Fórmulas explicadas en español sencillo para tooltips

export interface FormulaDefinition {
  name: string;
  formula: string;
  description?: string;
}

// === HATO ===
export const HERD_FORMULAS: Record<string, FormulaDefinition> = {
  cowsStart: {
    name: "Vacas al Inicio",
    formula: "Las vacas que tenías al final del año pasado",
    description: "Vacas listas para parir este año",
  },
  heifersStart: {
    name: "Vaquillas al Inicio",
    formula: "Vaquillas del año pasado que siguen creciendo",
    description: "Aún no pueden tener crías",
  },
  calvesTotal: {
    name: "Nacimientos",
    formula: "Vacas × tasa de parición (85%)",
    description: "Cuántos becerros nacen en el año",
  },
  maleCalvesSold: {
    name: "Machos Vendidos",
    formula: "Becerros × 50% (mitad son machos)",
    description: "Todos los machos se venden",
  },
  femaleCalvesSold: {
    name: "Hembras Vendidas",
    formula: "Hembras nacidas - las que nos quedamos",
    description: "Hembras que no necesitamos para el hato",
  },
  heifersRetained: {
    name: "Retenidas",
    formula: "Hembras que guardamos para reemplazo",
    description: "Serán las futuras vacas productoras",
  },
  cowsCulled: {
    name: "Desecho",
    formula: "Vacas viejas que vendemos",
    description: "Mantenemos el hato en 100 vacas",
  },
  heifersMaturing: {
    name: "Vaquillas que maduran",
    formula: "Las retenidas hace 2 años",
    description: "Ya pueden tener crías",
  },
  cowsEnd: {
    name: "Vacas al Final",
    formula: "Inicio + maduras - vendidas - muertas",
    description: "Vacas productivas al cerrar el año",
  },
  heifersEnd: {
    name: "Vaquillas al Final",
    formula: "Inicio + retenidas - las que maduraron",
    description: "Siguen en desarrollo",
  },
  totalHerdEnd: {
    name: "Total del Hato",
    formula: "Vacas + Vaquillas",
    description: "Todos los animales del rancho",
  },
};

// === INGRESOS Y GASTOS ===
export const INCOME_FORMULAS: Record<string, FormulaDefinition> = {
  calfSalesRevenue: {
    name: "Venta de Becerros",
    formula: "Machos × precio macho + Hembras × precio hembra",
    description: "Lo que ganas vendiendo becerros",
  },
  cullCowSalesRevenue: {
    name: "Venta Vacas Desecho",
    formula: "Vacas vendidas × precio desecho",
    description: "Dinero por vacas viejas",
  },
  totalRevenue: {
    name: "Ingresos Totales",
    formula: "Becerros + Vacas desecho",
    description: "Todo el dinero que entra",
  },
  variableCosts: {
    name: "Costos Variables",
    formula: "Vacas × costo anual por vaca",
    description: "Comida, veterinario, reproducción",
  },
  calfFeedingCosts: {
    name: "Alimentación Becerros",
    formula: "Becerros × costo mensual × meses",
    description: "Darles de comer hasta que se vendan",
  },
  totalCostOfSales: {
    name: "Costo de Producir",
    formula: "Variables + Alimentación becerros",
    description: "Lo que cuesta criar los animales",
  },
  grossProfit: {
    name: "Utilidad Bruta",
    formula: "Ingresos - Costos de producir",
    description: "Lo que queda antes de otros gastos",
  },
  grossMarginPercent: {
    name: "Margen Bruto",
    formula: "(Utilidad Bruta ÷ Ingresos) × 100",
    description: "Qué porcentaje te queda de cada peso",
  },
  payrollExpense: {
    name: "Nómina",
    formula: "Sueldo mensual × 12",
    description: "Pago a empleados del rancho",
  },
  totalOperatingExpenses: {
    name: "Gastos de Operación",
    formula: "Nómina + servicios + mantenimiento + otros",
    description: "Gastos fijos del rancho",
  },
  operatingIncome: {
    name: "Ganancia Operativa",
    formula: "Utilidad Bruta - Gastos de operación",
    description: "Lo que gana el negocio antes del banco",
  },
  operatingMarginPercent: {
    name: "Margen Operativo",
    formula: "(Ganancia Operativa ÷ Ingresos) × 100",
    description: "Qué tan eficiente es el rancho",
  },
  interestExpense: {
    name: "Intereses del Crédito",
    formula: "Lo que pagas al banco por el préstamo",
    description: "Costo de pedir dinero prestado",
  },
  earningsBeforeTax: {
    name: "Ganancia Antes de Impuestos",
    formula: "Ganancia Operativa - Intereses",
    description: "Lo que queda antes de ISR",
  },
  netIncome: {
    name: "Utilidad Neta",
    formula: "Ganancia - Impuestos (exento si eres primario)",
    description: "Lo que realmente te queda",
  },
  netMarginPercent: {
    name: "Margen Neto",
    formula: "(Utilidad Neta ÷ Ingresos) × 100",
    description: "Porcentaje final de ganancia",
  },
};

// === BALANCE ===
export const BALANCE_FORMULAS: Record<string, FormulaDefinition> = {
  cash: {
    name: "Efectivo",
    formula: "Dinero que tienes + lo que entró - lo que salió",
    description: "Dinero disponible en el banco",
  },
  livestockValue: {
    name: "Valor del Ganado",
    formula: "Vacas × costo por vaca + Vaquillas × 80%",
    description: "Cuánto valen tus animales",
  },
  infrastructureNet: {
    name: "Infraestructura",
    formula: "Lo que costó - desgaste acumulado",
    description: "Valor actual de corrales, bodega, etc.",
  },
  accumulatedDepreciation: {
    name: "Depreciación",
    formula: "Costo ÷ 20 años × años transcurridos",
    description: "Desgaste de las instalaciones",
  },
  totalAssets: {
    name: "Total de lo que tienes",
    formula: "Efectivo + Ganado + Infraestructura",
    description: "Todo lo que vale el negocio",
  },
  longTermDebt: {
    name: "Deuda con el Banco",
    formula: "Lo que falta por pagar del crédito",
    description: "Cuánto debes todavía",
  },
  totalLiabilities: {
    name: "Total que debes",
    formula: "Deuda bancaria",
    description: "Todas tus obligaciones",
  },
  totalEquity: {
    name: "Tu Capital",
    formula: "Lo que tienes - Lo que debes",
    description: "Lo que realmente es tuyo",
  },
};

// === FLUJO DE EFECTIVO ===
export const CASHFLOW_FORMULAS: Record<string, FormulaDefinition> = {
  netCashFromOperating: {
    name: "Flujo de Operación",
    formula: "Utilidad + depreciación (no es salida real)",
    description: "Efectivo que genera el negocio",
  },
  netCashFromInvesting: {
    name: "Flujo de Inversión",
    formula: "- Compra de ganado - Compra de infraestructura",
    description: "Dinero que gastaste en activos",
  },
  netCashFromFinancing: {
    name: "Flujo de Financiamiento",
    formula: "Préstamo recibido - Pagos al banco + Tu aportación",
    description: "Movimientos de dinero con bancos y socios",
  },
  netCashChange: {
    name: "Cambio en Efectivo",
    formula: "Operación + Inversión + Financiamiento",
    description: "Si subió o bajó tu dinero",
  },
  endingCash: {
    name: "Efectivo Final",
    formula: "Efectivo inicial + Cambio del año",
    description: "Dinero que tienes al cerrar el año",
  },
};

// === MÉTRICAS CLAVE ===
export const METRICS_FORMULAS: Record<string, FormulaDefinition> = {
  paybackPeriod: {
    name: "Tiempo de Recuperación",
    formula: "Años hasta recuperar tu inversión",
    description: "Cuándo empiezas a ganar de verdad",
  },
  irr: {
    name: "TIR",
    formula: "Rendimiento anual de tu dinero",
    description: "Si es mayor a 10%, es buen negocio",
  },
  npv: {
    name: "VPN",
    formula: "Ganancias futuras traídas a valor de hoy",
    description: "Si es positivo, el proyecto vale la pena",
  },
  roi: {
    name: "ROI",
    formula: "(Total ganado ÷ Lo que pusiste) × 100",
    description: "Cuánto multiplicaste tu dinero",
  },
  breakEvenYear: {
    name: "Año de Equilibrio",
    formula: "Primer año con ganancia",
    description: "Cuándo empiezas a ganar",
  },
  avgNetMargin: {
    name: "Margen Promedio",
    formula: "Promedio de márgenes de 5 años",
    description: "Rentabilidad típica del negocio",
  },
};

// === CRÉDITO ===
export const AMORTIZATION_FORMULAS: Record<string, FormulaDefinition> = {
  payment: {
    name: "Pago Mensual",
    formula: "Lo que pagas cada mes (siempre igual)",
    description: "Cuota fija que incluye capital e interés",
  },
  principal: {
    name: "Capital",
    formula: "Pago mensual - Interés",
    description: "Parte que reduce tu deuda",
  },
  interest: {
    name: "Interés",
    formula: "Saldo × Tasa mensual",
    description: "Lo que cobra el banco por prestarte",
  },
  endingBalance: {
    name: "Saldo Final",
    formula: "Lo que debías - Capital que pagaste",
    description: "Lo que te falta por pagar",
  },
};

// === INVERSIÓN ===
export const INVESTMENT_FORMULAS: Record<string, FormulaDefinition> = {
  infrastructureTotal: {
    name: "Infraestructura",
    formula: "Bodega + Corrales + Oficina + Equipo",
    description: "Todo lo que construyes/compras para el rancho",
  },
  cattleTotal: {
    name: "Ganado",
    formula: "Vacas × costo por vaca",
    description: "Costo de comprar tu hato inicial",
  },
  loanAmount: {
    name: "Monto del Crédito",
    formula: "Lo que pides prestado al banco",
    description: "Incluye consultoría de Ganadero de Precisión",
  },
  downPayment: {
    name: "Enganche",
    formula: "Lo que pones de tu bolsa",
    description: "Tu aportación inicial",
  },
  consultingFee: {
    name: "Consultoría",
    formula: "% del crédito (configurable)",
    description: "Pago a Ganadero de Precisión",
  },
  totalInitialInvestment: {
    name: "Inversión Total",
    formula: "Infraestructura + Ganado + Consultoría",
    description: "Todo lo que cuesta arrancar",
  },
  totalInterest: {
    name: "Total de Intereses",
    formula: "Suma de todos los intereses del crédito",
    description: "Lo que pagas extra por el préstamo",
  },
};

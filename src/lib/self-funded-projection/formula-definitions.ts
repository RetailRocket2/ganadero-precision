// lib/self-funded-projection/formula-definitions.ts
// Fórmulas explicadas en español para tooltips — self-funded version (no loan)

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
    formula: "Hembras que guardamos (varía por año)",
    description: "Serán las futuras vacas productoras",
  },
  cowsCulled: {
    name: "Desecho",
    formula: "Vacas viejas que vendemos (tasa varía por año)",
    description: "Mantenemos el hato en el tamaño objetivo",
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
    description: "Lo que gana el negocio del rancho",
  },
  operatingMarginPercent: {
    name: "Margen Operativo",
    formula: "(Ganancia Operativa ÷ Ingresos) × 100",
    description: "Qué tan eficiente es el rancho",
  },
  earningsBeforeTax: {
    name: "Ganancia Antes de Impuestos",
    formula: "Ganancia Operativa (sin intereses — capital propio)",
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
    formula: "Capital aportado + ingresos - gastos acumulados",
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
  totalLiabilities: {
    name: "Total que debes",
    formula: "Cuentas por pagar (sin deuda bancaria)",
    description: "Obligaciones pendientes",
  },
  totalEquity: {
    name: "Tu Capital",
    formula: "Capital aportado + Utilidades acumuladas",
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
    formula: "- Compra de ganado - Infraestructura",
    description: "Dinero que gastaste en activos",
  },
  netCashFromFinancing: {
    name: "Flujo de Financiamiento",
    formula: "Tu aportación de capital propio (Año 1)",
    description: "Dinero que pusiste de tu bolsa",
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
    formula: "Promedio de márgenes de 10 años",
    description: "Rentabilidad típica del negocio",
  },
};

// === INVERSIÓN ===
export const INVESTMENT_FORMULAS: Record<string, FormulaDefinition> = {
  infrastructureTotal: {
    name: "Infraestructura",
    formula: "Terreno + Bodega + Corrales + Oficina + Pozo + Geomembrana + Casa + Agrícola + Maquinaria",
    description: "Todo lo que construyes/compras para el rancho",
  },
  cattleTotal: {
    name: "Ganado",
    formula: "Vacas × costo por vaca",
    description: "Costo de comprar tu hato inicial",
  },
  consultingFee: {
    name: "Consultoría",
    formula: "% de (ganado + infraestructura)",
    description: "Pago a Ganadero de Precisión",
  },
  totalCashRequired: {
    name: "Capital Total Requerido",
    formula: "Infraestructura + Ganado + Consultoría",
    description: "Todo lo que necesitas invertir de tu bolsa",
  },
};

// lib/loan-calculations.ts
// French amortization calculation utilities for Ganadero de Precisión

export interface LoanParams {
  cattleCount: number; // Cantidad de vacas
  costPerHead: number; // Costo por cabeza en MXN
  totalAmount: number; // Monto total (cattleCount * costPerHead)
  downPaymentPercent: number; // Enganche en porcentaje (e.g., 20 for 20%)
  downPaymentAmount: number; // Monto del enganche
  principal: number; // Monto a financiar (totalAmount - downPaymentAmount)
  annualRate: number; // Tasa anual en porcentaje (e.g., 12 for 12%)
  termMonths: number; // Plazo en meses
  startDate?: Date; // Fecha de inicio (default: today)
}

export interface AmortizationRow {
  paymentNumber: number;
  paymentDate: string;
  beginningBalance: number;
  payment: number;
  principal: number;
  interest: number;
  endingBalance: number;
}

export interface LoanSummary {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  amortizationTable: AmortizationRow[];
}

/**
 * Format a number as Mexican Peso currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date as Spanish locale string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Calculate French amortization (fixed monthly payment)
 *
 * Formula: M = P × [r(1+r)^n] / [(1+r)^n - 1]
 * Where:
 * - M = Monthly payment
 * - P = Principal (loan amount)
 * - r = Monthly interest rate (annual rate / 12 / 100)
 * - n = Number of payments (months)
 */
export function calculateLoan(params: LoanParams): LoanSummary {
  const { principal, annualRate, termMonths, startDate = new Date() } = params;

  // Convert annual rate to monthly decimal rate
  const monthlyRate = annualRate / 12 / 100;

  // Calculate monthly payment using French amortization formula
  let monthlyPayment: number;

  if (monthlyRate === 0) {
    // Handle 0% interest rate edge case
    monthlyPayment = principal / termMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, termMonths);
    monthlyPayment = principal * ((monthlyRate * factor) / (factor - 1));
  }

  // Generate amortization table
  const amortizationTable: AmortizationRow[] = [];
  let balance = principal;

  for (let i = 1; i <= termMonths; i++) {
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i);

    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    const endingBalance = Math.max(0, balance - principalPayment);

    // Handle rounding on last payment
    const isLastPayment = i === termMonths;
    const adjustedPayment = isLastPayment
      ? balance + interestPayment
      : monthlyPayment;
    const adjustedPrincipal = isLastPayment ? balance : principalPayment;
    const adjustedEndingBalance = isLastPayment ? 0 : endingBalance;

    amortizationTable.push({
      paymentNumber: i,
      paymentDate: formatDate(paymentDate),
      beginningBalance: balance,
      payment: adjustedPayment,
      principal: adjustedPrincipal,
      interest: interestPayment,
      endingBalance: adjustedEndingBalance,
    });

    balance = adjustedEndingBalance;
  }

  // Calculate totals
  const totalPayment = amortizationTable.reduce(
    (sum, row) => sum + row.payment,
    0
  );
  const totalInterest = amortizationTable.reduce(
    (sum, row) => sum + row.interest,
    0
  );

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    amortizationTable,
  };
}

/**
 * Validate loan parameters
 */
export function validateLoanParams(params: Partial<LoanParams>): string[] {
  const errors: string[] = [];

  // Validate cattle count
  if (!params.cattleCount || params.cattleCount < 1) {
    errors.push("La cantidad mínima es 1 cabeza");
  }

  if (params.cattleCount && params.cattleCount > 500) {
    errors.push("La cantidad máxima es 500 cabezas");
  }

  // Validate cost per head
  if (!params.costPerHead || params.costPerHead < 5000) {
    errors.push("El costo mínimo por cabeza es $5,000 MXN");
  }

  if (params.costPerHead && params.costPerHead > 100000) {
    errors.push("El costo máximo por cabeza es $100,000 MXN");
  }

  // Validate calculated total amount
  const totalAmount = (params.cattleCount || 0) * (params.costPerHead || 0);
  if (totalAmount > 50000000) {
    errors.push("El monto total máximo es $50,000,000 MXN");
  }

  // Validate down payment
  if (params.downPaymentPercent !== undefined && params.downPaymentPercent < 0) {
    errors.push("El enganche no puede ser negativo");
  }

  if (params.downPaymentPercent !== undefined && params.downPaymentPercent > 99) {
    errors.push("El enganche máximo es 99%");
  }

  // Validate interest rate
  if (params.annualRate === undefined || params.annualRate < 0) {
    errors.push("La tasa de interés no puede ser negativa");
  }

  if (params.annualRate && params.annualRate > 100) {
    errors.push("La tasa de interés máxima es 100%");
  }

  // Validate term
  if (!params.termMonths || params.termMonths < 1) {
    errors.push("El plazo mínimo es 1 mes");
  }

  if (params.termMonths && params.termMonths > 120) {
    errors.push("El plazo máximo es 120 meses (10 años)");
  }

  return errors;
}

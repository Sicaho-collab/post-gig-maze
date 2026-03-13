export const SERVICE_FEE_RATE = 0.12
export const PROCESSING_FEE_RATE = 0.017
export const GST_RATE = 0.10
export const MAX_BUDGET = 100_000

export interface FeeBreakdown {
  studentPayment: number
  serviceFee: number
  processingFee: number
  gst: number
  total: number
}

export function calculateFeeBreakdown(budget: number): FeeBreakdown {
  const studentPayment = budget
  const serviceFee = budget * SERVICE_FEE_RATE
  const processingFee = budget * PROCESSING_FEE_RATE
  const gst = (serviceFee + processingFee) * GST_RATE
  const total = studentPayment + serviceFee + processingFee + gst

  return {
    studentPayment,
    serviceFee,
    processingFee,
    gst,
    total,
  }
}

export function formatCurrency(n: number): string {
  return `$${n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Strict budget input validation: digits with optional up to 2 decimal places */
export function isValidBudgetInput(value: string): boolean {
  return /^\d+(\.\d{0,2})?$/.test(value)
}

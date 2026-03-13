import { useState, useMemo } from 'react'
import NumberFlow from '@number-flow/react'
import { Info } from 'lucide-react'
import { Button, SimpleTooltip } from '@sicaho-collab/ui-web'
import type { GigV3Data } from './PostGigV3Page'
import { calculateFeeBreakdown, isValidBudgetInput, MAX_BUDGET } from './fee-utils'

interface Props {
  data: GigV3Data
  patch: (updates: Partial<GigV3Data>) => void
  onBack: () => void
  onNext: () => void
}

function Tooltip({ text }: { text: string }) {
  return (
    <SimpleTooltip text={text} delay={false}>
      <span className="inline-flex ml-1 cursor-help">
        <Info className="h-4 w-4 text-m3-on-surface-variant" />
      </span>
    </SimpleTooltip>
  )
}

export default function Step3Budget({ data, patch, onBack, onNext }: Props) {
  const [budgetTouched, setBudgetTouched] = useState(false)

  const budgetNum = parseFloat(data.budget)
  const hasValidFormat = data.budget !== '' && isValidBudgetInput(data.budget)
  const isPositive = hasValidFormat && !isNaN(budgetNum) && budgetNum > 0
  const isUnderMax = isPositive && budgetNum <= MAX_BUDGET
  const isValid = isPositive && isUnderMax

  const budgetError = (() => {
    if (!budgetTouched) return undefined
    if (data.budget === '' || !hasValidFormat || !isPositive) {
      return 'Please enter a valid budget greater than $0.00'
    }
    if (!isUnderMax) {
      return `Budget cannot exceed $${MAX_BUDGET.toLocaleString()}`
    }
    return undefined
  })()

  const breakdown = useMemo(() => {
    if (!isValid) return null
    return calculateFeeBreakdown(budgetNum)
  }, [budgetNum, isValid])

  // Format number with commas for display
  const displayBudget = (() => {
    if (!data.budget) return ''
    const parts = data.budget.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.')
  })()

  function handleBudgetChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Strip commas before validating/storing
    const val = e.target.value.replace(/,/g, '')
    // Allow empty (so user can clear) or valid partial numeric input
    if (val === '' || /^\d+(\.\d{0,2})?$/.test(val)) {
      patch({ budget: val })
    }
  }

  function handleContinue() {
    setBudgetTouched(true)
    if (isValid) onNext()
  }

  return (
    <>
      <div className="flex flex-col items-center gap-8 py-4">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-[var(--text-xl)] font-bold text-m3-on-surface">
            What's your budget?
          </h2>
          <p className="text-[var(--text-sm)] text-m3-on-surface-variant mt-1">
            Enter the student payment and we'll calculate the rest
          </p>
        </div>

        {/* Budget input — centered, no stroke, large */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold text-m3-on-surface-variant select-none">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={displayBudget}
              onChange={handleBudgetChange}
              onBlur={() => setBudgetTouched(true)}
              placeholder="0.00"
              className="text-5xl font-bold text-m3-on-surface bg-transparent outline-none text-center placeholder:text-m3-outline"
              style={{ width: `${Math.max(4, (displayBudget || '0.00').length + 1)}ch` }}
            />
          </div>
          {budgetError && (
            <p role="alert" className="text-[var(--text-xs)] text-m3-error mt-1">{budgetError}</p>
          )}
        </div>

        {/* Breakdown — filled surface, no outline */}
        {breakdown && (
          <div className="w-full max-w-md rounded-m3-md bg-m3-secondary-container p-5 flex flex-col gap-3">
            <p className="text-[var(--text-sm)] font-semibold text-m3-on-surface text-center">
              Cost Breakdown
            </p>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[var(--text-sm)]">
                <span className="flex items-center text-m3-on-surface-variant">
                  Student payment
                  <Tooltip text="This amount includes superannuation" />
                </span>
                <span className="text-m3-on-surface font-medium">
                  <NumberFlow value={breakdown.studentPayment} format={{ style: 'currency', currency: 'AUD', minimumFractionDigits: 2, useGrouping: true }} />
                </span>
              </div>
              <div className="flex justify-between text-[var(--text-sm)]">
                <span className="text-m3-on-surface-variant">Alumable Service Fee (12%)</span>
                <span className="text-m3-on-surface font-medium">
                  <NumberFlow value={breakdown.serviceFee} format={{ style: 'currency', currency: 'AUD', minimumFractionDigits: 2, useGrouping: true }} />
                </span>
              </div>
              <div className="flex justify-between text-[var(--text-sm)]">
                <span className="text-m3-on-surface-variant">Processing fee (1.7%)</span>
                <span className="text-m3-on-surface font-medium">
                  <NumberFlow value={breakdown.processingFee} format={{ style: 'currency', currency: 'AUD', minimumFractionDigits: 2, useGrouping: true }} />
                </span>
              </div>
              <div className="flex justify-between items-center text-[var(--text-sm)]">
                <span className="flex items-center text-m3-on-surface-variant">
                  GST (10%)
                  <Tooltip text="GST is charged on the combined Alumable Service Fee and Processing fee" />
                </span>
                <span className="text-m3-on-surface font-medium">
                  <NumberFlow value={breakdown.gst} format={{ style: 'currency', currency: 'AUD', minimumFractionDigits: 2, useGrouping: true }} />
                </span>
              </div>

              <hr className="border-m3-outline-variant my-1" />

              <div className="flex justify-between text-[var(--text-base)]">
                <span className="font-semibold text-m3-on-surface">Total Gig Cost</span>
                <span className="font-bold text-m3-on-surface">
                  <NumberFlow
                    value={breakdown.total}
                    format={{ style: 'currency', currency: 'AUD', minimumFractionDigits: 2, useGrouping: true }}
                    transformTiming={{ duration: 500, easing: 'ease-out' }}
                    spinTiming={{ duration: 500, easing: 'ease-out' }}
                  />
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4 border-t border-m3-outline-variant mt-6">
        <Button variant="outlined" onClick={onBack} className="w-full sm:w-auto">
          Back
        </Button>
        <Button disabled={!isValid} onClick={handleContinue} className="w-full sm:w-auto">
          Continue
        </Button>
      </div>
    </>
  )
}

import { useState, useMemo, useCallback } from 'react'
import { Button, Card, DateRangePicker } from '@sicaho-collab/ui-web'
import type { GigV3Data } from './PostGigV3Page'

interface Props {
  data: GigV3Data
  patch: (updates: Partial<GigV3Data>) => void
  onBack: () => void
  onNext: () => void
}

function countBusinessDays(start: string, end: string): number {
  const s = new Date(start)
  const e = new Date(end)
  let count = 0
  const d = new Date(s)
  while (d <= e) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}

/** Convert Date to yyyy-mm-dd ISO string */
function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Parse yyyy-mm-dd to Date */
function fromISO(iso: string): Date | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default function Step2Timeline({ data, patch, onBack, onNext }: Props) {
  const [touched, setTouched] = useState(false)

  const startDate = fromISO(data.startDate)
  const endDate = fromISO(data.endDate)

  const handleDateChange = useCallback(
    (range: { startDate: Date | null; endDate: Date | null }) => {
      patch({
        startDate: range.startDate ? toISO(range.startDate) : '',
        endDate: range.endDate ? toISO(range.endDate) : '',
      })
    },
    [patch],
  )

  const businessDays = useMemo(() => {
    if (data.startDate && data.endDate && data.endDate > data.startDate) {
      return countBusinessDays(data.startDate, data.endDate)
    }
    return null
  }, [data.startDate, data.endDate])

  const canContinue =
    !!data.startDate &&
    !!data.endDate &&
    data.endDate > data.startDate

  const startError =
    touched && !data.startDate ? 'Please select a start date' : undefined
  const endError =
    touched && !data.endDate ? 'Please select an end date' : undefined

  function handleContinue() {
    setTouched(true)
    if (canContinue) onNext()
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[var(--text-xl)] font-bold text-m3-on-surface">
            Great! When do you need this done?
          </h2>
          <p className="text-[var(--text-sm)] text-m3-on-surface-variant mt-1">
            Pick your start and end dates on the calendar. Business days are counted automatically.
          </p>
        </div>

        <Card
          variant="outlined"
          className="p-4 md:p-5 flex flex-col gap-5 bg-m3-surface-container-lowest"
        >
          <DateRangePicker
            inline
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            minDate={new Date()}
          />

          {/* Validation errors */}
          {(startError || endError) && (
            <div className="flex flex-col gap-1">
              {startError && (
                <p className="text-[var(--text-xs)] text-m3-error" role="alert">{startError}</p>
              )}
              {endError && (
                <p className="text-[var(--text-xs)] text-m3-error" role="alert">{endError}</p>
              )}
            </div>
          )}

          {businessDays !== null && (
            <div className="rounded-m3-sm bg-m3-primary-container/40 px-4 py-3">
              <span className="text-[var(--text-sm)] font-medium text-m3-primary">
                Gig duration: {businessDays} business day{businessDays !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </Card>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4 border-t border-m3-outline-variant mt-6">
        <Button variant="outlined" onClick={onBack} className="w-full sm:w-auto">
          Back
        </Button>
        <Button disabled={!canContinue} onClick={handleContinue} className="w-full sm:w-auto">
          Continue
        </Button>
      </div>
    </>
  )
}

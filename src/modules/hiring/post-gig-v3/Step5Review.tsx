import { useState } from 'react'
import { Info, Calendar, DollarSign, FileText, ShieldCheck } from 'lucide-react'
import { Button, Card, SimpleTooltip } from '@sicaho-collab/ui-web'
import type { GigV3Data } from './PostGigV3Page'
import { calculateFeeBreakdown, formatCurrency as fmtCur } from './fee-utils'

interface Props {
  data: GigV3Data
  onBack: () => void
}

function formatDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function formatBudgetCurrency(value: string): string {
  const num = parseFloat(value)
  if (isNaN(num)) return '$0.00'
  return `$${num.toFixed(2)}`
}

const LOCATION_LABELS: Record<string, string> = {
  remote: 'Remote',
  'on-site': 'On-Site',
  hybrid: 'Hybrid',
}

export default function Step5Review({ data, onBack }: Props) {
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const budgetNum = parseFloat(data.budget)
  const breakdown = !isNaN(budgetNum) && budgetNum > 0
    ? calculateFeeBreakdown(budgetNum)
    : null

  async function handlePublish() {
    setPublishing(true)
    setError(null)
    try {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          // Simulate success
          resolve()
        }, 1500)
      })
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  if (success) {
    return (
      <Card
        variant="outlined"
        className="p-4 md:p-8 flex flex-col items-center gap-4 bg-m3-surface-container-lowest text-center"
      >
        <div className="w-16 h-16 rounded-full bg-m3-primary text-m3-on-primary flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-m3-on-surface">
          Your gig has been published!
        </h2>
        <p className="text-sm text-m3-on-surface-variant">
          Students can now discover and apply for your gig on Alumable.
        </p>
        <Button onClick={() => window.location.reload()}>
          Post Another Gig
        </Button>
      </Card>
    )
  }

  return (
    <>
      {/* ── 2/3 + 1/3 Split Layout ── */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Left Column (2/3): Details + Preferences ── */}
        <div className="flex-1 lg:w-2/3 flex flex-col gap-6">
          {/* Details Summary */}
          <SummaryCard title="Details" subtitle="This is what students will see on your gig listing" icon={<FileText className="size-4 text-m3-primary" />}>
            <FieldRow label="Gig Title" value={data.title} />
            <FieldRow label="Description" value={data.description} />
            <div>
              <p className="text-sm text-m3-on-surface-variant">Capabilities</p>
              {data.capabilities.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {data.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="inline-flex items-center rounded-m3-full bg-m3-surface-container text-m3-on-surface text-xs font-medium px-3 py-1"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-base text-m3-on-surface">None selected</p>
              )}
            </div>
            <FieldRow
              label="Gig Type"
              value={
                data.locationType
                  ? data.locationDetails
                    ? `${LOCATION_LABELS[data.locationType]} — ${data.locationDetails}`
                    : LOCATION_LABELS[data.locationType]
                  : ''
              }
            />
            {data.additionalNotes && (
              <FieldRow label="Additional Notes" value={data.additionalNotes} />
            )}
          </SummaryCard>

          {/* Approval Check */}
          <SummaryCard title="Approval Check" icon={<ShieldCheck className="size-4 text-m3-primary" />}>
            <FieldRow
              label="Approval"
              value={
                data.isOwner
                  ? 'I am the owner'
                  : data.approvalName
                    ? `${data.approvalName} (${data.approvalEmail})`
                    : ''
              }
            />
            {data.approvalNotes && (
              <FieldRow label="Approval Notes" value={data.approvalNotes} />
            )}
          </SummaryCard>
        </div>

        {/* ── Right Column (1/3): Timeline + Cost Breakdown ── */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          {/* Timeline */}
          <div className="p-5 md:p-6 rounded-m3-md" style={{ backgroundColor: '#D9EDF7' }}>
            <p className="text-base font-semibold text-m3-on-surface flex items-center gap-2">
              <Calendar className="size-4 text-m3-on-surface" />
              Timeline
            </p>
            <hr className="border-black/10 my-3" />
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-sm text-m3-on-surface/70">Gig Date</p>
                <p className="text-base font-medium text-m3-on-surface">
                  {formatDate(data.startDate)} – {formatDate(data.endDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-m3-on-surface/70">Application Deadline</p>
                <p className="text-base font-medium text-m3-on-surface">{formatDate(data.applicationDeadline)}</p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="p-5 md:p-6 rounded-m3-md" style={{ backgroundColor: '#FBF0D6' }}>
            <p className="text-base font-semibold text-m3-on-surface flex items-center gap-2">
              <DollarSign className="size-4 text-m3-on-surface" />
              Cost Breakdown
            </p>
            <hr className="border-black/10 my-3" />

            {breakdown && (
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center text-m3-on-surface-variant">
                    Student payment
                    <SimpleTooltip text="Incl. super" delay={false}>
                      <span className="inline-flex ml-1 cursor-help">
                        <Info className="h-3.5 w-3.5 text-m3-on-surface-variant" />
                      </span>
                    </SimpleTooltip>
                  </span>
                  <span className="text-m3-on-surface font-medium">{formatBudgetCurrency(data.budget)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-m3-on-surface-variant">Service Fee (12%)</span>
                  <span className="text-m3-on-surface font-medium">{fmtCur(breakdown.serviceFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-m3-on-surface-variant">Processing (1.7%)</span>
                  <span className="text-m3-on-surface font-medium">{fmtCur(breakdown.processingFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center text-m3-on-surface-variant">
                    GST (10%)
                    <SimpleTooltip text="GST on Service Fee + Processing fee" delay={false}>
                      <span className="inline-flex ml-1 cursor-help">
                        <Info className="h-3.5 w-3.5 text-m3-on-surface-variant" />
                      </span>
                    </SimpleTooltip>
                  </span>
                  <span className="text-m3-on-surface font-medium">{fmtCur(breakdown.gst)}</span>
                </div>

                <hr className="border-black/10 my-1" />

                {/* Total — emphasized */}
                <div className="flex justify-between items-center rounded-m3-xs bg-white/40 px-3 py-2.5 -mx-1">
                  <span className="text-sm font-semibold text-m3-on-surface">
                    Total Gig Cost
                  </span>
                  <span className="text-base font-bold text-m3-on-surface">
                    {fmtCur(breakdown.total)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-m3-error-container text-m3-on-error-container text-sm p-3 rounded-m3-sm mt-4"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4 border-t border-m3-outline-variant mt-6">
        <Button variant="outlined" disabled={publishing} onClick={onBack} className="w-full sm:w-auto">
          Back
        </Button>
        <Button disabled={publishing} onClick={handlePublish} className="w-full sm:w-auto">
          {publishing ? 'Publishing...' : 'Publish Gig'}
        </Button>
      </div>
    </>
  )
}

/* -- Shared sub-components -- */

function SummaryCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card
      variant="outlined"
      className="p-5 md:p-6 bg-m3-surface-container-lowest overflow-hidden"
    >
      <p className="text-base font-semibold text-m3-on-surface flex items-center gap-2">
        {icon}
        {title}
      </p>
      {subtitle && (
        <p className="text-xs text-m3-on-surface-variant mt-0.5">{subtitle}</p>
      )}
      <hr className="border-m3-outline-variant my-3" />
      <div className="flex flex-col gap-3">{children}</div>
    </Card>
  )
}

function FieldRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-m3-on-surface-variant flex items-center gap-1">
        {label}
        {hint && (
          <SimpleTooltip text={hint} delay={false}>
            <span className="inline-flex cursor-help">
              <Info className="h-3.5 w-3.5 text-m3-on-surface-variant" />
            </span>
          </SimpleTooltip>
        )}
      </p>
      <p className="text-base text-m3-on-surface break-words">{value}</p>
    </div>
  )
}

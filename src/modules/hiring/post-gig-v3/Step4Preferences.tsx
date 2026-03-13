import { useState, useEffect } from 'react'
import { Button, Card, Checkbox, DatePicker, TextField } from '@sicaho-collab/ui-web'
import type { GigV3Data } from './PostGigV3Page'

interface Props {
  data: GigV3Data
  patch: (updates: Partial<GigV3Data>) => void
  onBack: () => void
  onNext: () => void
}

const LOCATION_OPTIONS = ['on-site', 'remote', 'hybrid'] as const
const LOCATION_LABELS: Record<string, string> = {
  'on-site': 'On-Site',
  remote: 'Remote',
  hybrid: 'Hybrid',
}

/** Subtract N days from an ISO date string */
function subtractDays(iso: string, days: number): string {
  const date = new Date(iso)
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}


export default function Step4Preferences({
  data,
  patch,
  onBack,
  onNext,
}: Props) {
  const [locationDetailsTouched, setLocationDetailsTouched] = useState(false)
  const [deadlineTouched, setDeadlineTouched] = useState(false)
  const [approvalNameTouched, setApprovalNameTouched] = useState(false)
  const [approvalEmailTouched, setApprovalEmailTouched] = useState(false)

  const needsLocationDetails =
    data.locationType === 'on-site' || data.locationType === 'hybrid'

  // Auto-set default location type to on-site if not yet selected
  useEffect(() => {
    if (data.locationType === '') {
      patch({ locationType: 'on-site' })
    }
  }, [])

  // Auto-set application deadline to 3 days before start date
  useEffect(() => {
    if (data.startDate && !data.applicationDeadline) {
      const defaultDeadline = subtractDays(data.startDate, 3)
      const today = todayISO()
      patch({ applicationDeadline: defaultDeadline < today ? today : defaultDeadline })
    }
  }, [data.startDate])

  const locationDetailsError =
    locationDetailsTouched &&
    needsLocationDetails &&
    data.locationDetails.trim() === ''
      ? 'Please enter the location where the student will need to be'
      : undefined

  const deadlineError =
    deadlineTouched && !data.applicationDeadline
      ? 'Please select an application deadline'
      : undefined

  const approvalNameError =
    approvalNameTouched && !data.isOwner && data.approvalName.trim() === ''
      ? 'Please enter a name'
      : undefined

  const approvalEmailError =
    approvalEmailTouched && !data.isOwner && data.approvalEmail.trim() === ''
      ? 'Please enter an email'
      : approvalEmailTouched && !data.isOwner && data.approvalEmail.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.approvalEmail)
        ? 'Please enter a valid email'
        : undefined

  const canContinue =
    data.locationType !== '' &&
    (!needsLocationDetails || data.locationDetails.trim() !== '') &&
    !!data.applicationDeadline &&
    (data.isOwner || (data.approvalName.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.approvalEmail)))

  function handleLocationTypeChange(type: GigV3Data['locationType']) {
    patch({ locationType: type })
    if (type === 'remote') {
      patch({ locationDetails: '' })
      setLocationDetailsTouched(false)
    }
  }

  function handleContinue() {
    if (needsLocationDetails) setLocationDetailsTouched(true)
    setDeadlineTouched(true)
    if (!data.isOwner) {
      setApprovalNameTouched(true)
      setApprovalEmailTouched(true)
    }
    if (canContinue) onNext()
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[var(--text-xl)] font-bold text-m3-on-surface">
            Just a few more details!
          </h2>
          <p className="text-[var(--text-sm)] text-m3-on-surface-variant mt-1">
            I've pre-filled a few details based on what you shared. Have a look and tweak anything that doesn't look quite right.
          </p>
        </div>

        {/* Gig Type & Location */}
        <Card
          variant="outlined"
          className="p-4 md:p-5 flex flex-col gap-4 bg-m3-surface-container-lowest"
        >
          <div>
            <p className="text-[var(--text-sm)] font-semibold text-m3-on-surface">
              Gig Type
            </p>
            <p className="text-[var(--text-xs)] text-m3-on-surface-variant mt-1">
              Where will the gig happen?
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {LOCATION_OPTIONS.map(option => {
              const selected = data.locationType === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleLocationTypeChange(option)}
                  className={
                    selected
                      ? 'bg-m3-primary-container text-m3-on-primary-container rounded-m3-sm px-4 py-2 text-[var(--text-sm)] font-medium transition-colors'
                      : 'border border-m3-outline text-m3-on-surface-variant rounded-m3-sm px-4 py-2 text-[var(--text-sm)] hover:bg-m3-primary/8 transition-colors'
                  }
                >
                  {LOCATION_LABELS[option]}
                </button>
              )
            })}
          </div>
          {needsLocationDetails && (
            <div>
              <p className="text-[var(--text-sm)] font-semibold text-m3-on-surface mb-3">
                Where will the student need to be?
              </p>
              <TextField
                variant="outlined"
                label="Location"
                placeholder="Building A, Level 3 or 123 Main St"
                value={data.locationDetails}
                maxLength={200}
                onChange={e =>
                  patch({ locationDetails: e.target.value.slice(0, 200) })
                }
                onBlur={() => setLocationDetailsTouched(true)}
                error={!!locationDetailsError}
                errorText={locationDetailsError}
              />
            </div>
          )}
        </Card>

        {/* Application Deadline */}
        <Card
          variant="outlined"
          className="p-4 md:p-5 flex flex-col gap-4 bg-m3-surface-container-lowest overflow-visible"
        >
          <DatePicker
            label="Application Deadline"
            value={data.applicationDeadline}
            min={todayISO()}
            max={data.startDate || undefined}
            error={deadlineError}
            supportingText="Automatically set to 3 days before start date. Feel free to adjust as needed."
            onBlur={() => setDeadlineTouched(true)}
            onChange={iso => patch({ applicationDeadline: iso })}
          />
        </Card>

        {/* Approval Check */}
        <Card
          variant="outlined"
          className="p-4 md:p-5 flex flex-col gap-4 bg-m3-surface-container-lowest"
        >
          <div>
            <p className="text-[var(--text-sm)] font-semibold text-m3-on-surface">
              Approval Check
            </p>
            <p className="text-[var(--text-xs)] text-m3-on-surface-variant mt-1">
              To ensure you've received the necessary approvals before publishing this gig, we require you to notify a manager/team member regarding your post.
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={data.isOwner}
              onCheckedChange={(checked: boolean) => {
                patch({ isOwner: !!checked })
                if (checked) {
                  setApprovalNameTouched(false)
                  setApprovalEmailTouched(false)
                }
              }}
            />
            <span className="text-[var(--text-sm)] text-m3-on-surface">
              I am the owner and have authority to publish this gig
            </span>
          </label>

          {!data.isOwner && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  variant="outlined"
                  label="Name"
                  placeholder="Manager or team member name"
                  value={data.approvalName}
                  onChange={e => patch({ approvalName: e.target.value })}
                  onBlur={() => setApprovalNameTouched(true)}
                  error={!!approvalNameError}
                  errorText={approvalNameError}
                />
                <TextField
                  variant="outlined"
                  label="Email"
                  placeholder="manager@company.com"
                  type="email"
                  value={data.approvalEmail}
                  onChange={e => patch({ approvalEmail: e.target.value })}
                  onBlur={() => setApprovalEmailTouched(true)}
                  error={!!approvalEmailError}
                  errorText={approvalEmailError}
                />
              </div>
              <TextField
                variant="outlined"
                label="Notes for your manager/team member"
                placeholder="Any additional context for the approver (optional)"
                multiline
                rows={3}
                value={data.approvalNotes}
                maxLength={500}
                onChange={e =>
                  patch({ approvalNotes: e.target.value.slice(0, 500) })
                }
              />
            </div>
          )}
        </Card>

        {/* Notes for Students */}
        <Card
          variant="outlined"
          className="p-4 md:p-5 flex flex-col gap-4 bg-m3-surface-container-lowest"
        >
          <div>
            <p className="text-[var(--text-sm)] font-semibold text-m3-on-surface">
              Notes
            </p>
            <p className="text-[var(--text-xs)] text-m3-on-surface-variant mt-1">
              Is there anything else you would like to include for the students?
            </p>
          </div>
          <TextField
            variant="outlined"
            label="Additional Notes"
            placeholder="Dress code, tools to bring, parking info..."
            multiline
            rows={3}
            value={data.additionalNotes}
            maxLength={500}
            onChange={e =>
              patch({ additionalNotes: e.target.value.slice(0, 500) })
            }
          />
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

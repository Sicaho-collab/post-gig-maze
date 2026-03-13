import { useState } from 'react'
import { Button, Card, Chip, TextField } from '@sicaho-collab/ui-web'
import type { GigV3Data } from './PostGigV3Page'

const CAPABILITY_OPTIONS = [
  'Analytical & Data Thinking',
  'Communication & Influence',
  'Digital & Technical Fluency',
  'Project & Execution',
  'Collaboration',
  'Creative Thinking',
  'Business Insight',
  'Adaptability',
] as const

const MAX_CAPABILITIES = 3

interface Props {
  data: GigV3Data
  patch: (updates: Partial<GigV3Data>) => void
  onNext: () => void
}

export default function Step1Details({ data, patch, onNext }: Props) {
  const [titleTouched, setTitleTouched] = useState(false)
  const [descTouched, setDescTouched] = useState(false)
  const [capTouched, setCapTouched] = useState(false)

  const titleLen = data.title.length
  const descLen = data.description.length

  const titleError =
    titleTouched && titleLen < 5
      ? 'Title must be at least 5 characters'
      : undefined

  const descError =
    descTouched && descLen < 20
      ? 'Description must be at least 20 characters'
      : undefined

  const capError =
    capTouched && data.capabilities.length === 0
      ? 'Select at least one capability'
      : undefined

  const canContinue =
    titleLen >= 5 &&
    titleLen <= 100 &&
    descLen >= 20 &&
    descLen <= 1000 &&
    data.capabilities.length > 0

  function toggleCapability(cap: string) {
    setCapTouched(true)
    const current = data.capabilities
    if (current.includes(cap)) {
      patch({ capabilities: current.filter(c => c !== cap) })
    } else if (current.length < MAX_CAPABILITIES) {
      patch({ capabilities: [...current, cap] })
    }
  }

  function handleContinue() {
    setTitleTouched(true)
    setDescTouched(true)
    setCapTouched(true)
    if (canContinue) onNext()
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <Card
          variant="outlined"
          className="p-4 md:p-5 flex flex-col gap-4 bg-m3-surface-container-lowest"
        >
          <p className="text-[var(--text-sm)] font-semibold text-m3-on-surface">
            Gig Information
          </p>
          <div>
            <TextField
              variant="outlined"
              label="Gig Title"
              placeholder="Campus Event Setup Assistant"
              value={data.title}
              maxLength={100}
              onChange={e => patch({ title: e.target.value.slice(0, 100) })}
              onBlur={() => setTitleTouched(true)}
              error={!!titleError}
              errorText={titleError}
            />
            <p
              className={`text-[var(--text-xs)] mt-1 px-4 ${
                titleLen >= 100
                  ? 'text-m3-error'
                  : 'text-m3-on-surface-variant'
              }`}
            >
              {titleLen} / 100
            </p>
          </div>
          <div>
            <TextField
              variant="outlined"
              label="Description"
              placeholder="Describe what the student will be doing..."
              multiline
              rows={4}
              value={data.description}
              maxLength={1000}
              onChange={e =>
                patch({ description: e.target.value.slice(0, 1000) })
              }
              onBlur={() => setDescTouched(true)}
              error={!!descError}
              errorText={descError}
            />
            <p
              className={`text-[var(--text-xs)] mt-1 px-4 ${
                descLen >= 1000
                  ? 'text-m3-error'
                  : 'text-m3-on-surface-variant'
              }`}
            >
              {descLen} / 1000
            </p>
          </div>
        </Card>

        <Card
          variant="outlined"
          className="p-4 md:p-5 flex flex-col gap-4 bg-m3-surface-container-lowest"
        >
          <div>
            <p className="text-[var(--text-sm)] font-semibold text-m3-on-surface">
              Capabilities
            </p>
            <p className="text-[var(--text-xs)] text-m3-on-surface-variant mt-1">
              Select up to {MAX_CAPABILITIES} capabilities required for this gig
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {CAPABILITY_OPTIONS.map(cap => {
              const selected = data.capabilities.includes(cap)
              const disabled = !selected && data.capabilities.length >= MAX_CAPABILITIES
              return (
                <Chip
                  key={cap}
                  variant="filter"
                  selected={selected}
                  onClick={() => !disabled && toggleCapability(cap)}
                  className={disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                >
                  {cap}
                </Chip>
              )
            })}
          </div>
          {capError && (
            <p className="text-[var(--text-xs)] text-m3-error" role="alert">{capError}</p>
          )}
        </Card>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-m3-outline-variant mt-6">
        <Button disabled={!canContinue} onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </>
  )
}

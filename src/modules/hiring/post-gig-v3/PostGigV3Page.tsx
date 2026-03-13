import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { M3Stepper } from '@sicaho-collab/ui-web'
import { AIPromptBox } from '@/components/ui/ai-prompt-box'
import Step1Details from './Step1Details'
import Step2Timeline from './Step2Timeline'
import Step3Budget from './Step3Budget'
import Step4Preferences from './Step4Preferences'
import Step5Review from './Step5Review'

export interface GigV3Data {
  prompt: string
  title: string
  description: string
  capabilities: string[]
  startDate: string
  endDate: string
  flexibleStart: boolean
  flexibleEnd: boolean
  scheduleNotes: string
  budget: string
  locationType: '' | 'remote' | 'on-site' | 'hybrid'
  locationDetails: string
  applicationDeadline: string
  approvalName: string
  approvalEmail: string
  approvalNotes: string
  isOwner: boolean
  additionalNotes: string
}

export const INITIAL_DATA: GigV3Data = {
  prompt: '',
  title: '',
  description: '',
  capabilities: [],
  startDate: '',
  endDate: '',
  flexibleStart: false,
  flexibleEnd: false,
  scheduleNotes: '',
  budget: '',
  locationType: '',
  locationDetails: '',
  applicationDeadline: '',
  approvalName: '',
  approvalEmail: '',
  approvalNotes: '',
  isOwner: false,
  additionalNotes: '',
}

const STEPS = [
  { label: 'Details' },
  { label: 'Timeline' },
  { label: 'Budget' },
  { label: 'Preferences' },
  { label: 'Review' },
]

const TOTAL_STEPS = 5

export default function PostGigV3Page() {
  // step=0 means pre-step, 1-5 are wizard steps
  const [step, setStep] = useState(0)
  const [data, setData] = useState<GigV3Data>(INITIAL_DATA)
  const patch = useCallback((updates: Partial<GigV3Data>) => {
    setData(prev => ({ ...prev, ...updates }))
  }, [])

  const goNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS))
  const goBack = () => setStep(s => Math.max(s - 1, step <= 1 ? 0 : 1))


  return (
    <div className={cn("max-w-[900px] mx-auto px-4 md:px-6", step === 0 ? "py-0" : "py-6 md:py-8")}>
      {step >= 1 && (
        <>
          <h1 className="text-xl font-semibold text-m3-on-surface">Post a Gig</h1>
          <p className="text-sm text-m3-on-surface-variant mb-8">
            Create a new gig for students to apply
          </p>
          <M3Stepper steps={STEPS} current={step} className="mb-6" />
        </>
      )}

      {/* Pre-Step */}
      {step === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px-48px-48px)]">
          <h1
            className="text-2xl md:text-3xl font-bold text-center mb-8 bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to right, #9A76BE, #C084FC, #E879A0)' }}
          >
            What do you need help with?
          </h1>
          <AIPromptBox
            onSend={(msg) => { patch({ prompt: msg }); setStep(1) }}
            placeholder="Describe the work you need done, and I will help you create the perfect gig to find the right talent"
            sendLabel="Get Started"
            className="w-full max-w-[640px]"
          />
          <div className="text-center mt-4 text-xs" style={{ color: 'var(--md-sys-color-outline)' }}>
            Alumable AI can make mistakes. Please check for accuracy.{' '}
            <a href="#" className="text-[#9A76BE] hover:underline">See terms</a>
            {' \u2022 '}
            <a href="#" className="text-[#9A76BE] hover:underline">Give feedback</a>
          </div>
        </div>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <Step1Details data={data} patch={patch} onNext={goNext} />
      )}

      {/* Step 2: Timeline */}
      {step === 2 && (
        <Step2Timeline
          data={data}
          patch={patch}
          onBack={goBack}
          onNext={goNext}
        />
      )}

      {/* Step 3: Budget */}
      {step === 3 && (
        <Step3Budget
          data={data}
          patch={patch}
          onBack={goBack}
          onNext={goNext}
        />
      )}

      {/* Step 4: Preferences */}
      {step === 4 && (
        <Step4Preferences
          data={data}
          patch={patch}
          onBack={goBack}
          onNext={goNext}
        />
      )}

      {/* Step 5: Review & Publish */}
      {step === 5 && (
        <Step5Review
          data={data}
          onBack={goBack}
        />
      )}
    </div>
  )
}

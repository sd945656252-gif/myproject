'use client'

import { useState } from 'react'
import { Loader2, Check, ArrowRight, ChevronRight } from 'lucide-react'

interface WorkflowStepProps {
  stepNumber: number
  title: string
  description: string
  status: 'pending' | 'active' | 'completed'
  children: React.ReactNode
  onNext?: () => void
  onSkip?: () => void
  isLastStep?: boolean
}

export default function WorkflowStep({
  stepNumber,
  title,
  description,
  status,
  children,
  onNext,
  onSkip,
  isLastStep = false,
}: WorkflowStepProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleNext = async () => {
    if (onNext) {
      setIsLoading(true)
      await onNext()
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
            status === 'completed'
              ? 'bg-green-500 text-white'
              : status === 'active'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {status === 'completed' ? <Check size={24} /> : stepNumber}
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="ml-16 space-y-4">
        {children}

        {/* Navigation Buttons */}
        {(status === 'completed' || status === 'active') && (
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  {isLastStep ? '完成' : '下一步'}
                  {!isLastStep && <ArrowRight size={18} />}
                </>
              )}
            </button>

            {onSkip && !isLastStep && (
              <button
                onClick={onSkip}
                className="px-6 py-3 border border-input rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2"
              >
                跳过
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

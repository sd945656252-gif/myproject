'use client'

import { Check } from 'lucide-react'

interface WorkflowProgressProps {
  steps: Array<{
    number: number
    title: string
    status: 'pending' | 'active' | 'completed'
  }>
}

export default function WorkflowProgress({ steps }: WorkflowProgressProps) {
  return (
    <div className="p-4 bg-card rounded-lg border">
      <h3 className="text-sm font-medium mb-4">工作流进度</h3>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.number} className="flex items-center gap-3">
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step.status === 'completed'
                  ? 'bg-green-500 text-white'
                  : step.status === 'active'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.status === 'completed' ? <Check size={16} /> : step.number}
            </div>

            <div className="flex-1">
              <div className="text-sm font-medium">{step.title}</div>
              <div className="text-xs text-muted-foreground">
                {step.status === 'completed' && '已完成'}
                {step.status === 'active' && '进行中'}
                {step.status === 'pending' && '等待中'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

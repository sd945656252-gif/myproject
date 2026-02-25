"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export interface Step {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed" | "error";
}

interface WorkflowStepperProps {
  steps: Step[];
  currentStep: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export function WorkflowStepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: WorkflowStepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className={cn("space-y-2", className)}>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = index < currentIndex || step.status === "completed";
        const isPending = index > currentIndex && step.status === "pending";
        const isLoading = step.status === "active" || (isActive && step.status !== "completed");

        return (
          <button
            key={step.id}
            onClick={() => onStepClick?.(step.id)}
            disabled={isPending}
            className={cn(
              "w-full flex items-start gap-3 rounded-lg p-3 text-left transition-colors",
              isActive && "bg-primary/10 border-primary",
              isCompleted && "bg-muted/50",
              isPending && "opacity-50 cursor-not-allowed",
              !isPending && "hover:bg-muted/50 cursor-pointer"
            )}
          >
            {/* Status Icon */}
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                isCompleted && "bg-primary text-primary-foreground",
                isActive && "border-2 border-primary text-primary",
                isPending && "border-2 border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : isCompleted ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-medium",
                    isActive && "text-primary",
                    isCompleted && "text-foreground",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {step.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface StepCardProps {
  title: string;
  description: string;
  status: "pending" | "active" | "completed" | "error";
  children?: React.ReactNode;
  onConfirm?: () => void;
  onModify?: () => void;
  confirmText?: string;
  modifyText?: string;
}

export function StepCard({
  title,
  description,
  status,
  children,
  onConfirm,
  onModify,
  confirmText = "满意，下一步",
  modifyText = "修改意见",
}: StepCardProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b p-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="p-4">
        {status === "active" && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">生成中...</span>
          </div>
        )}

        {status === "pending" && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Circle className="h-5 w-5 mr-2" />
            <span>等待上一步完成</span>
          </div>
        )}

        {status === "completed" && children}

        {status === "error" && (
          <div className="flex items-center justify-center py-8 text-destructive">
            <span>生成失败，请重试</span>
          </div>
        )}
      </div>

      {status === "completed" && (
        <div className="border-t p-4 flex items-center justify-end gap-2">
          <button
            onClick={onModify}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {modifyText}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      )}
    </div>
  );
}

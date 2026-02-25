import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WorkflowStep =
  | "story"
  | "script"
  | "config"
  | "character"
  | "storyboard"
  | "edit";

export interface WorkflowStepData {
  story?: {
    outline: string;
    acts: string[];
  };
  script?: {
    scenes: Array<{
      id: string;
      description: string;
      narration: string;
      visualDescription: string;
    }>;
  };
  config?: {
    aspectRatio: string;
    style: string;
    frameRate: number;
    model: string;
    recommendedModel?: string;
  };
  character?: {
    referenceImages: string[];
    views: string[];
  };
  storyboard?: {
    generatedScenes: Array<{
      id: string;
      imageUrl?: string;
      videoUrl?: string;
      status: "pending" | "generating" | "completed" | "failed";
    }>;
  };
  edit?: {
    sequence: string[];
    transitions: string[];
    musicSuggestions: string[];
  };
}

interface WorkflowState {
  currentStep: WorkflowStep;
  stepData: WorkflowStepData;
  workflowId: string | null;
  isStepLoading: boolean;
  setStepData: <K extends keyof WorkflowStepData>(
    step: K,
    data: WorkflowStepData[K]
  ) => void;
  setCurrentStep: (step: WorkflowStep) => void;
  setWorkflowId: (id: string | null) => void;
  setIsStepLoading: (loading: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const STEP_ORDER: WorkflowStep[] = [
  "story",
  "script",
  "config",
  "character",
  "storyboard",
  "edit",
];

const initialState = {
  currentStep: "story" as WorkflowStep,
  stepData: {},
  workflowId: null,
  isStepLoading: false,
};

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set) => ({
      ...initialState,
      setStepData: (step, data) =>
        set((state) => ({
          stepData: {
            ...state.stepData,
            [step]: data,
          },
        })),
      setCurrentStep: (currentStep) => set({ currentStep }),
      setWorkflowId: (workflowId) => set({ workflowId }),
      setIsStepLoading: (isStepLoading) => set({ isStepLoading }),
      nextStep: () =>
        set((state) => {
          const currentIndex = STEP_ORDER.indexOf(state.currentStep);
          if (currentIndex < STEP_ORDER.length - 1) {
            return { currentStep: STEP_ORDER[currentIndex + 1] };
          }
          return state;
        }),
      prevStep: () =>
        set((state) => {
          const currentIndex = STEP_ORDER.indexOf(state.currentStep);
          if (currentIndex > 0) {
            return { currentStep: STEP_ORDER[currentIndex - 1] };
          }
          return state;
        }),
      reset: () => set(initialState),
    }),
    {
      name: "workflow-storage",
      partialize: (state) => ({
        currentStep: state.currentStep,
        stepData: state.stepData,
        workflowId: state.workflowId,
      }),
    }
  )
);

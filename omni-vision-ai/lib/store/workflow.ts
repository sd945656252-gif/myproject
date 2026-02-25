import { create } from 'zustand';
import {
  WorkflowSession,
  WorkflowStep,
  StoryOutline,
  ShotScript,
  ProductionConfig,
  Character,
  ShotAsset,
  PostProductionGuide,
  WORKFLOW_STEPS,
} from '@/types/workflow';
import { generateId } from '@/lib/utils/helpers';

interface WorkflowState {
  // 当前会话
  session: WorkflowSession | null;
  // 各步骤数据
  story: StoryOutline | null;
  script: ShotScript[];
  config: ProductionConfig | null;
  characters: Character[];
  shotAssets: ShotAsset[];
  postProduction: PostProductionGuide | null;
  // 当前步骤
  currentStep: WorkflowStep;
  // 加载状态
  isProcessing: boolean;
  // 操作
  startWorkflow: (idea: string) => void;
  setStory: (story: StoryOutline) => void;
  setScript: (script: ShotScript[]) => void;
  setConfig: (config: ProductionConfig) => void;
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, character: Partial<Character>) => void;
  setShotAssets: (assets: ShotAsset[]) => void;
  updateShotAsset: (id: string, asset: Partial<ShotAsset>) => void;
  setPostProduction: (guide: PostProductionGuide) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: WorkflowStep) => void;
  setProcessing: (isProcessing: boolean) => void;
  resetWorkflow: () => void;
  // 获取步骤索引
  getStepIndex: () => number;
  getTotalSteps: () => number;
}

const initialConfig: ProductionConfig = {
  aspectRatio: '16:9',
  resolution: '1080p',
  frameRate: 24,
  style: 'cinematic',
  totalDuration: 60,
  primaryAPI: 'jimeng',
  fallbackAPIs: ['kling', 'vidu'],
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  session: null,
  story: null,
  script: [],
  config: initialConfig,
  characters: [],
  shotAssets: [],
  postProduction: null,
  currentStep: 'story',
  isProcessing: false,

  startWorkflow: (idea) =>
    set({
      session: {
        id: generateId('wf'),
        idea,
        currentStep: 'story',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      currentStep: 'story',
      story: null,
      script: [],
      config: initialConfig,
      characters: [],
      shotAssets: [],
      postProduction: null,
    }),

  setStory: (story) => {
    const { session } = get();
    set({
      story,
      session: session
        ? { ...session, story, updatedAt: new Date() }
        : null,
    });
  },

  setScript: (script) => {
    const { session } = get();
    set({
      script,
      session: session
        ? { ...session, script, updatedAt: new Date() }
        : null,
    });
  },

  setConfig: (config) => {
    const { session } = get();
    set({
      config,
      session: session
        ? { ...session, config, updatedAt: new Date() }
        : null,
    });
  },

  addCharacter: (character) =>
    set((state) => ({
      characters: [...state.characters, character],
    })),

  updateCharacter: (id, character) =>
    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === id ? { ...c, ...character } : c
      ),
    })),

  setShotAssets: (assets) =>
    set({
      shotAssets: assets,
    }),

  updateShotAsset: (id, asset) =>
    set((state) => ({
      shotAssets: state.shotAssets.map((a) =>
        a.id === id ? { ...a, ...asset } : a
      ),
    })),

  setPostProduction: (guide) =>
    set({
      postProduction: guide,
    }),

  nextStep: () => {
    const { currentStep } = get();
    const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex < WORKFLOW_STEPS.length - 1) {
      const nextStepId = WORKFLOW_STEPS[currentIndex + 1].id;
      set({ currentStep: nextStepId });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      const prevStepId = WORKFLOW_STEPS[currentIndex - 1].id;
      set({ currentStep: prevStepId });
    }
  },

  goToStep: (step) => set({ currentStep: step }),

  setProcessing: (isProcessing) => set({ isProcessing }),

  resetWorkflow: () =>
    set({
      session: null,
      story: null,
      script: [],
      config: initialConfig,
      characters: [],
      shotAssets: [],
      postProduction: null,
      currentStep: 'story',
      isProcessing: false,
    }),

  getStepIndex: () => {
    const { currentStep } = get();
    return WORKFLOW_STEPS.findIndex((s) => s.id === currentStep);
  },

  getTotalSteps: () => WORKFLOW_STEPS.length,
}));

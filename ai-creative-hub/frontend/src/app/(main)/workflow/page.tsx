"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useWorkflowStore, WorkflowStep } from "@/stores/useWorkflowStore";
import { WorkflowStepper, StepCard, Step } from "@/components/workflow";
import { useWebSocket } from "@/hooks";
import {
  BookOpen,
  FileText,
  Settings,
  Users,
  Film,
  Scissors,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

const STEP_CONFIG: { id: WorkflowStep; title: string; description: string; icon: typeof BookOpen }[] = [
  { id: "story", title: "故事起稿", description: "一句话转三幕剧大纲", icon: BookOpen },
  { id: "script", title: "分段脚本", description: "拆解分镜、旁白、画面描述", icon: FileText },
  { id: "config", title: "创作配置", description: "推荐尺寸/画风/帧率", icon: Settings },
  { id: "character", title: "角色设定", description: "生成参考图与三视图", icon: Users },
  { id: "storyboard", title: "分镜生成", description: "批量图转视频", icon: Film },
  { id: "edit", title: "剪辑建议", description: "拼接顺序、转场、配乐", icon: Scissors },
];

export default function WorkflowPage() {
  const {
    currentStep,
    stepData,
    isStepLoading,
    setCurrentStep,
    setStepData,
    setIsStepLoading,
    nextStep,
    prevStep,
    reset,
  } = useWorkflowStore();

  const { status: wsStatus, generate, lastMessage } = useWebSocket();
  const [storyInput, setStoryInput] = useState("");
  const [workflowStarted, setWorkflowStarted] = useState(false);

  const steps: Step[] = STEP_CONFIG.map((config, index) => {
    const stepIndex = STEP_CONFIG.findIndex((s) => s.id === currentStep);
    return {
      id: config.id,
      title: config.title,
      description: config.description,
      status:
        index < stepIndex
          ? "completed"
          : index === stepIndex
          ? "active"
          : "pending",
    };
  });

  const handleStartWorkflow = useCallback(() => {
    if (!storyInput.trim()) return;
    setWorkflowStarted(true);
    setIsStepLoading(true);

    // Generate story outline
    generate("prompt_optimize", {
      prompt: storyInput,
      target_api: "story",
    });

    // Simulate completion for demo
    setTimeout(() => {
      setStepData("story", {
        outline: storyInput,
        acts: [
          "第一幕：故事开始，主角登场，背景铺垫",
          "第二幕：冲突展开，矛盾升级，转折出现",
          "第三幕：高潮对决，问题解决，结局收尾",
        ],
      });
      setIsStepLoading(false);
    }, 2000);
  }, [storyInput, generate, setStepData, setIsStepLoading]);

  const handleConfirmStep = useCallback(
    (step: WorkflowStep) => {
      nextStep();
    },
    [nextStep]
  );

  const handleModifyStep = useCallback(
    (step: WorkflowStep, modification: string) => {
      setIsStepLoading(true);
      // Re-generate with modification
      setTimeout(() => {
        setIsStepLoading(false);
      }, 1500);
    },
    [setIsStepLoading]
  );

  const handleReset = useCallback(() => {
    reset();
    setWorkflowStarted(false);
    setStoryInput("");
  }, [reset]);

  const currentStepConfig = STEP_CONFIG.find((s) => s.id === currentStep);
  const progress = ((STEP_CONFIG.findIndex((s) => s.id === currentStep) + 1) / STEP_CONFIG.length) * 100;

  return (
    <div className="flex h-full gap-6">
      {/* Left Panel - Workflow Steps */}
      <div className="w-72 shrink-0 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">一键视频创作</h1>
            <p className="text-muted-foreground text-sm mt-1">6 步完成创作</p>
          </div>
          <Badge variant="secondary">Module 4</Badge>
        </div>

        {workflowStarted && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">进度</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>

            <WorkflowStepper
              steps={steps}
              currentStep={currentStep}
              onStepClick={(stepId) => {
                const stepIndex = STEP_CONFIG.findIndex((s) => s.id === stepId);
                const currentIndex = STEP_CONFIG.findIndex((s) => s.id === currentStep);
                if (stepIndex <= currentIndex) {
                  setCurrentStep(stepId as WorkflowStep);
                }
              }}
            />

            <Button variant="outline" className="w-full" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              重新开始
            </Button>
          </>
        )}

        {!workflowStarted && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">开始创作</CardTitle>
              <CardDescription>输入一句话开始你的故事</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={storyInput}
                onChange={(e) => setStoryInput(e.target.value)}
                placeholder="例如：一个少年在森林中发现了一只会说话的狐狸..."
                className="min-h-[100px]"
              />
              <Button
                className="w-full"
                onClick={handleStartWorkflow}
                disabled={!storyInput.trim()}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                开始创作
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div
            className={`h-2 w-2 rounded-full ${
              wsStatus === "connected"
                ? "bg-green-500"
                : wsStatus === "connecting"
                ? "bg-yellow-500 animate-pulse"
                : "bg-red-500"
            }`}
          />
          <span>
            {wsStatus === "connected"
              ? "已连接"
              : wsStatus === "connecting"
              ? "连接中..."
              : "未连接"}
          </span>
        </div>
      </div>

      {/* Right Panel - Current Step Content */}
      <div className="flex-1 space-y-6">
        {!workflowStarted ? (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center py-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mx-auto mb-6">
                <Film className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">一键视频创作流</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                从一句话故事到完整视频，AI 将引导你完成整个创作过程。
                每一步都可以确认或修改，直到满意为止。
              </p>
              <div className="grid grid-cols-6 gap-2 max-w-2xl mx-auto">
                {STEP_CONFIG.map((step, index) => (
                  <div key={step.id} className="text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mx-auto mb-2">
                      <step.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">{step.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Current Step Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentStepConfig && (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <currentStepConfig.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{currentStepConfig.title}</h2>
                      <p className="text-sm text-muted-foreground">{currentStepConfig.description}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Step Content */}
            {currentStep === "story" && (
              <StepCard
                title="故事大纲"
                description="基于你的输入生成的三幕剧结构"
                status={stepData.story ? "completed" : isStepLoading ? "active" : "pending"}
                onConfirm={() => handleConfirmStep("story")}
                onModify={() => handleModifyStep("story", "")}
              >
                {stepData.story && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">{stepData.story.outline}</p>
                    <div className="space-y-2">
                      {stepData.story.acts.map((act, index) => (
                        <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                          <Badge variant="outline">第 {index + 1} 幕</Badge>
                          <p className="text-sm flex-1">{act}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </StepCard>
            )}

            {currentStep === "script" && (
              <StepCard
                title="分段脚本"
                description="拆解分镜、旁白、画面描述"
                status={stepData.script ? "completed" : isStepLoading ? "active" : "pending"}
                onConfirm={() => handleConfirmStep("script")}
                onModify={() => handleModifyStep("script", "")}
              >
                {stepData.script && (
                  <div className="space-y-4">
                    {stepData.script.scenes.map((scene, index) => (
                      <div key={scene.id} className="p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>场景 {index + 1}</Badge>
                        </div>
                        <p className="text-sm font-medium mb-1">{scene.description}</p>
                        <p className="text-sm text-muted-foreground">{scene.narration}</p>
                      </div>
                    ))}
                  </div>
                )}
              </StepCard>
            )}

            {currentStep === "config" && (
              <StepCard
                title="创作配置"
                description="推荐的创作参数设置"
                status={stepData.config ? "completed" : isStepLoading ? "active" : "pending"}
                onConfirm={() => handleConfirmStep("config")}
                onModify={() => handleModifyStep("config", "")}
              >
                {stepData.config && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">宽高比</p>
                      <p className="font-medium">{stepData.config.aspectRatio}</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">风格</p>
                      <p className="font-medium">{stepData.config.style}</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">帧率</p>
                      <p className="font-medium">{stepData.config.frameRate} FPS</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">推荐模型</p>
                      <p className="font-medium">{stepData.config.recommendedModel || stepData.config.model}</p>
                    </div>
                  </div>
                )}
              </StepCard>
            )}

            {currentStep === "character" && (
              <StepCard
                title="角色设定"
                description="生成角色参考图"
                status={stepData.character ? "completed" : isStepLoading ? "active" : "pending"}
                onConfirm={() => handleConfirmStep("character")}
                onModify={() => handleModifyStep("character", "")}
              >
                {stepData.character && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">角色参考图将在此显示</p>
                  </div>
                )}
              </StepCard>
            )}

            {currentStep === "storyboard" && (
              <StepCard
                title="分镜生成"
                description="批量生成分镜画面"
                status={stepData.storyboard ? "completed" : isStepLoading ? "active" : "pending"}
                onConfirm={() => handleConfirmStep("storyboard")}
                onModify={() => handleModifyStep("storyboard", "")}
              >
                {stepData.storyboard && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">分镜画面将在此显示</p>
                  </div>
                )}
              </StepCard>
            )}

            {currentStep === "edit" && (
              <StepCard
                title="剪辑建议"
                description="拼接顺序、转场、配乐建议"
                status={stepData.edit ? "completed" : isStepLoading ? "active" : "pending"}
                onConfirm={() => {
                  alert("工作流已完成！");
                }}
                confirmText="完成创作"
                onModify={() => handleModifyStep("edit", "")}
              >
                {stepData.edit && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">剪辑建议将在此显示</p>
                  </div>
                )}
              </StepCard>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === "story"}
              >
                上一步
              </Button>
              <Button onClick={nextStep} disabled={!stepData[currentStep]}>
                下一步
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

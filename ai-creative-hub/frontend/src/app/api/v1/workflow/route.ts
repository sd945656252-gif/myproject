import { NextRequest, NextResponse } from "next/server";

// Workflow templates
const WORKFLOW_TEMPLATES = [
  {
    id: "image-pipeline",
    name: "Image Generation Pipeline",
    description: "Generate an image from text prompt, then optimize and enhance it",
    steps: ["prompt_optimize", "image_generate", "image_enhance"],
  },
  {
    id: "video-creation",
    name: "Video Creation Pipeline",
    description: "Create a video from text prompt with background music",
    steps: ["prompt_optimize", "video_generate", "music_generate", "video_merge"],
  },
  {
    id: "content-package",
    name: "Content Package Generator",
    description: "Generate complete content package: image, voice narration, and background music",
    steps: ["prompt_optimize", "image_generate", "voice_synthesis", "music_generate"],
  },
];

// In-memory workflow storage for demo
const workflows = new Map<string, {
  id: string;
  title: string;
  description?: string;
  steps: Array<{
    id: string;
    type: string;
    name: string;
    config: Record<string, unknown>;
    status: string;
    output?: Record<string, unknown>;
  }>;
  status: string;
  createdAt: string;
  updatedAt: string;
}>();

// Create a new workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, templateId } = body;

    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    let steps: Array<{
      id: string;
      type: string;
      name: string;
      config: Record<string, unknown>;
      status: string;
    }> = [];

    // If template is specified, use template steps
    if (templateId) {
      const template = WORKFLOW_TEMPLATES.find(t => t.id === templateId);
      if (template) {
        steps = template.steps.map((stepType, index) => ({
          id: `step-${index + 1}`,
          type: stepType,
          name: getStepName(stepType),
          config: {},
          status: "pending",
        }));
      }
    }

    const workflow = {
      id: workflowId,
      title: title || "New Workflow",
      description,
      steps,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    workflows.set(workflowId, workflow);

    return NextResponse.json({
      success: true,
      message: "Workflow created successfully",
      data: workflow,
    });
  } catch (error) {
    console.error("Workflow creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create workflow" },
      { status: 500 }
    );
  }
}

// Get workflow templates
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "templates") {
    return NextResponse.json({
      success: true,
      data: {
        templates: WORKFLOW_TEMPLATES,
      },
    });
  }

  // List all workflows
  const workflowList = Array.from(workflows.values());
  return NextResponse.json({
    success: true,
    data: {
      workflows: workflowList,
    },
  });
}

function getStepName(stepType: string): string {
  const names: Record<string, string> = {
    prompt_optimize: "Optimize Prompt",
    image_generate: "Generate Image",
    image_enhance: "Enhance Image",
    video_generate: "Generate Video",
    music_generate: "Generate Music",
    voice_synthesis: "Synthesize Voice",
    video_merge: "Merge Video & Audio",
  };
  return names[stepType] || stepType;
}

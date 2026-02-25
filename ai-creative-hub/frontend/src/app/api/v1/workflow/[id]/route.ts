import { NextRequest, NextResponse } from "next/server";

// In-memory storage (shared with parent route in production would use a database)
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

// Mock step executors
const stepExecutors: Record<string, (input: Record<string, unknown>) => Promise<Record<string, unknown>>> = {
  prompt_optimize: async (input) => ({
    optimizedPrompt: `${input.prompt}, cinematic, professional, high quality`,
    tags: ["cinematic", "professional"],
  }),
  image_generate: async (input) => ({
    imageUrl: `https://picsum.photos/seed/${Date.now()}/1024/1024`,
    seed: Math.floor(Math.random() * 1000000),
  }),
  image_enhance: async (input) => ({
    enhancedUrl: input.imageUrl || `https://picsum.photos/seed/${Date.now()}/1024/1024`,
    enhancements: ["upscale", "color_correction"],
  }),
  video_generate: async (input) => ({
    videoUrl: "https://example.com/demo-video.mp4",
    duration: 5,
  }),
  music_generate: async (input) => ({
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 30,
  }),
  voice_synthesis: async (input) => ({
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 10,
  }),
  video_merge: async (input) => ({
    finalUrl: "https://example.com/final-video.mp4",
    duration: input.videoDuration || 30,
  }),
};

// Get workflow by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workflow = workflows.get(id);

  if (!workflow) {
    return NextResponse.json(
      { success: false, error: "Workflow not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: workflow,
  });
}

// Execute a workflow step
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { step, input } = body;

    const workflow = workflows.get(id);
    if (!workflow) {
      return NextResponse.json(
        { success: false, error: "Workflow not found" },
        { status: 404 }
      );
    }

    // Find the step
    const stepIndex = workflow.steps.findIndex(s => s.id === step || s.type === step);
    if (stepIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Step not found in workflow" },
        { status: 400 }
      );
    }

    const workflowStep = workflow.steps[stepIndex];

    // Execute the step
    const executor = stepExecutors[workflowStep.type];
    if (!executor) {
      return NextResponse.json(
        { success: false, error: `Unknown step type: ${workflowStep.type}` },
        { status: 400 }
      );
    }

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    const output = await executor(input || {});

    // Update step status
    workflowStep.status = "completed";
    workflowStep.output = output;
    workflow.updatedAt = new Date().toISOString();

    // Determine next step
    const nextStep = workflow.steps[stepIndex + 1]?.id;

    // Check if workflow is complete
    const allComplete = workflow.steps.every(s => s.status === "completed");
    if (allComplete) {
      workflow.status = "completed";
    }

    return NextResponse.json({
      success: true,
      data: {
        step: workflowStep.id,
        output,
        nextStep,
        workflowComplete: allComplete,
      },
    });
  } catch (error) {
    console.error("Workflow step execution error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute workflow step" },
      { status: 500 }
    );
  }
}

// Run entire workflow
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { input } = body;

    const workflow = workflows.get(id);
    if (!workflow) {
      return NextResponse.json(
        { success: false, error: "Workflow not found" },
        { status: 404 }
      );
    }

    // Start workflow execution
    workflow.status = "active";
    workflow.updatedAt = new Date().toISOString();

    const taskId = `wf-task-${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: "Workflow execution started",
      data: {
        taskId,
        status: "processing",
        workflowId: id,
        totalSteps: workflow.steps.length,
      },
    });
  } catch (error) {
    console.error("Workflow execution error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to run workflow" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

// In-memory cache for demo purposes
// In production, this should use Redis or other distributed cache
const taskCache = new Map<string, { status: string; progress: number; result: unknown }>();

export async function GET(request: NextRequest) {
  const taskId = request.nextUrl.searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json(
      { success: false, error: "Missing taskId parameter" },
      { status: 400 }
    );
  }

  // Check cache first
  const cached = taskCache.get(taskId);
  if (cached) {
    return NextResponse.json({
      success: true,
      data: {
        taskId,
        status: cached.status,
        progress: cached.progress,
        result: cached.result,
      },
    });
  }

  // Return pending status for demo
  return NextResponse.json({
    success: true,
    data: {
      taskId,
      status: "pending",
      progress: 0,
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Simulate task creation
  const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Store initial task
  taskCache.set(taskId, {
    status: "pending",
    progress: 0,
    result: undefined,
  });

  // Simulate async processing
  simulateTask(taskId, body);

  return NextResponse.json({
    success: true,
    data: {
      taskId,
      status: "pending",
    },
  });
}

async function simulateTask(taskId: string, body: any) {
  // Simulate progress updates
  for (let i = 0; i <= 100; i += 10) {
    const cached = taskCache.get(taskId);
    if (cached) {
      cached.progress = i;
      taskCache.set(taskId, cached);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Mark as completed
  const finalCached = taskCache.get(taskId);
  if (finalCached) {
    finalCached.status = "completed";
    finalCached.progress = 100;

    // Generate mock result based on task type
    const result = generateMockResult(body);
    finalCached.result = result;
    taskCache.set(taskId, finalCached);
  }
}

function generateMockResult(body: any): Record<string, unknown> {
  const taskType = body.taskType || "generate";

  switch (taskType) {
    case "prompt_optimize":
      return {
        prompt: "优化后的专业提示词：杰作高品质摄影作品，8K分辨率 |大师作品 |专业灯光 |电影级画质 |精细细节 |超写实风格 |完美构图",
        tags: ["photography", "professional", "cinematic", "high-quality"],
        suggestions: [
          "尝试添加更具体的光线描述，如\"柔和的晨光\"或\"戏剧性的侧光\"",
          "可以加入镜头信息，如\"85mm f/1.4\"或\"50mm f/1.8\"",
          "考虑添加风格参考，如\"cinematic\"或\"editorial\"",
        ],
      };
    case "image_to_prompt":
      return {
        prompt: "一张风格独特的艺术作品，画面中央是一个主体元素，周围环绕着抽象的装饰图案。色彩丰富且对比鲜明，整体构图和谐平衡，光影效果细腻自然，细节刻画精致入微",
        tags: ["artistic", "creative", "colorful", "detailed", "abstract"],
        suggestions: [
          "可以进一步描述主体元素的纹理和材质",
          "添加背景环境描述，增强画面氛围",
          "考虑添加更多关于色彩和构图的细节",
        ],
      };
    case "text_to_image":
      return {
        images: [
          {
            url: "https://picsum.photos/seed/123/1024/1024",
            seed: 123456,
            model: "demo-model",
          },
        ],
        taskId: `task-${Date.now()}`,
      };
    case "text_to_video":
      return {
        videoUrl: "https://example.com/demo-video.mp4",
        duration: 5,
      };
    case "music_generation":
      return {
        audioUrl: "https://example.com/demo-music.mp3",
        duration: 30,
      };
    case "voice_synthesis":
      return {
        audioUrl: "https://example.com/demo-voice.mp3",
        duration: 10,
      };
    default:
      return {
        error: "Unknown task type",
      };
  }
}

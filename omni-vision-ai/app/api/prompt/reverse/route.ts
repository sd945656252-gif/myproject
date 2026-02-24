import { NextRequest, NextResponse } from 'next/server';
import { getRandomAnalysis } from '@/lib/mock/prompts';
import { generatePromptFromAnalysis } from '@/lib/utils/prompt-engineering';

// POST - 图片反推提示词
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: '缺少图片 URL' },
        { status: 400 }
      );
    }

    // 模拟分析延迟
    await new Promise((r) => setTimeout(r, 1000));

    // 使用模拟数据
    const analysis = getRandomAnalysis();
    const prompts = generatePromptFromAnalysis(analysis);

    return NextResponse.json({
      success: true,
      data: {
        analysis,
        prompts,
        isMock: true,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '分析失败' },
      { status: 500 }
    );
  }
}

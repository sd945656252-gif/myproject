import { NextRequest, NextResponse } from 'next/server';
import { defaultAPIConfig } from '@/lib/api/config';

// GET - 获取当前配置
export async function GET() {
  return NextResponse.json({
    success: true,
    data: defaultAPIConfig,
  });
}

// POST - 更新配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 在实际应用中，这里应该保存到数据库或验证后保存
    // 当前实现仅返回成功响应

    return NextResponse.json({
      success: true,
      message: '配置已更新',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '更新配置失败' },
      { status: 400 }
    );
  }
}

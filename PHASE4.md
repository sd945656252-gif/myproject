# AI Creative Hub - Phase 4

## Overview
Phase 4 实现了提示词专家（Prompt Expert）和 AI 生图（AI Image Generation）两个核心模块的真实 API 串联，包括完整的后端服务和前端 UI 组件。

## 后端实现

### 1. PromptService (`backend/app/services/prompt_service.py`)
核心功能：
- **Image to Prompt**: 从图像反向生成提示词
  - 支持 OpenAI GPT-4 Vision API（优先）
  - 支持 HuggingFace BLIP 模型（备选）
  - 支持中英文输出
  - 支持三级细节度（simple/detailed/full）
  
- **Prompt Optimization**: 优化文本提示词
  - 使用 GPT-4 智能优化
  - 支持多种目标模型（Midjourney, Stable Diffusion, DALL-E, Sora）
  - 支持三级增强度（minimal/moderate/maximum）
  - 自动提取关键词标签

技术特点：
- 集成 AI Router 自动降级机制
- 完整的错误处理和日志记录
- 支持模拟分析（demo 模式）

### 2. Image API (`backend/app/api/v1/image.py`)
新增端点：
- `POST /api/v1/image/text-to-image` - 文本生图
- `POST /api/v1/image/image-to-image` - 图生图
- `POST /api/v1/image/inpainting` - 局部重绘
- `POST /api/v1/image/controlnet` - ControlNet 控制

功能：
- 支持 multipart/form-data 文件上传
- 自动上传图片到本地存储
- 返回任务 ID 用于轮询状态
- 支持自定义参数（尺寸、步数、CFG scale 等）

### 3. Prompt API (`backend/app/api/v1/prompt.py`)
新增端点：
- `POST /api/v1/prompt/image-to-text` - 图像转提示词
- `POST /api/v1/prompt/optimize` - 提示词优化
- `POST /api/v1/prompt/upload-and-analyze` - 上传并分析图像

功能：
- 支持图像 URL 或直接上传
- 参数化配置（语言、细节度、目标风格等）
- 返回结构化结果（原文本、优化文本、标签、元数据）

### 4. Schema 定义
- `backend/app/schemas/prompt.py` - Prompt 相关数据模型
- `backend/app/schemas/image.py` - Image 相关数据模型

## 前端实现

### 1. Prompt Expert Page (`frontend/app/dashboard/prompt-expert/page.tsx`)
功能：
- 双标签页设计（Image to Text / Optimize Prompt）
- 图像上传预览
- 参数配置面板（语言、细节度、目标风格等）
- 实时结果展示
- 一键复制提示词
- 标签展示和元数据查看

UI 特点：
- 响应式布局（移动端/桌面端适配）
- 拖拽上传支持
- 加载状态反馈
- 清晰的结果面板

### 2. AI Generation Page (`frontend/app/dashboard/ai-generation/page.tsx`)
功能：
- 四种生成模式切换（text-to-image, image-to-image, inpainting, controlnet）
- Prompt 和 Negative Prompt 输入
- 图像上传（用于图生图、inpainting、controlnet）
- 高级参数调整（尺寸、步数、CFG scale）
- 任务状态轮询
- 生成的图像展示和下载

UI 特点：
- 现代化的控制面板
- 实时任务状态显示
- 图像网格布局
- 悬浮下载按钮
- 渐变生成按钮

### 3. API 客户端 (`frontend/app/lib/api.ts`)
统一的 API 调用封装：
- `promptApi` - Prompt 相关 API
- `imageApi` - Image 相关 API
- `workflowApi` - Workflow 相关 API
- `videoApi` - Video 相关 API
- `audioApi` - Audio 相关 API
- `adminApi` - Admin 相关 API

特性：
- 统一的错误处理
- FormData 支持
- TypeScript 类型定义
- 可配置的 API 基础 URL

## 路由配置更新

### 后端 (`backend/app/api/v1/__init__.py`)
```python
api_router.include_router(image.router, prefix="/image", tags=["image"])
api_router.include_router(prompt.router, prefix="/prompt", tags=["prompt"])
```

### 前端
新增页面路由：
- `/dashboard/prompt-expert` - Prompt Expert 页面
- `/dashboard/ai-generation` - AI Generation 页面

## 环境变量配置

确保 `.env` 文件包含以下配置：

```env
# AI API Keys
OPENAI_API_KEY=your_openai_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
JIMENG_API_KEY=your_jimeng_api_key
KLING_API_KEY=your_kling_api_key
SUNO_API_KEY=your_suno_api_key
MINIMAX_API_KEY=your_minimax_api_key

# File Storage
UPLOAD_DIR=./uploads
OUTPUT_DIR=./outputs
MAX_UPLOAD_SIZE=10485760

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 使用流程

### Prompt Expert
1. 选择 "Image to Text" 标签
2. 上传图像
3. 选择语言和细节度
4. 点击 "Generate Prompt"
5. 查看生成的提示词和标签

### AI Image Generation
1. 选择生成模式（text-to-image 等）
2. 输入 Prompt
3. （可选）上传源图像
4. 调整高级参数
5. 点击 "Generate"
6. 等待生成完成
7. 下载生成的图像

## 技术亮点

1. **智能降级**: PromptService 自动在 OpenAI → HuggingFace → Simulation 之间降级
2. **文件上传**: 统一的文件上传处理和 URL 生成
3. **任务轮询**: 前端自动轮询任务状态直到完成
4. **错误处理**: 完整的异常处理和用户反馈
5. **类型安全**: 完整的 Pydantic 模型和 TypeScript 类型定义

## 下一步

Phase 5 将实现：
- 视频生成模块（Sora API 集成）
- 音频生成模块（Suno 音乐合成）
- 语音合成模块（Minimax TTS）
- 工作流引擎完善
- 生成历史记录功能
- 文件管理系统优化

---

**注意**：确保 Docker 容器已启动，数据库和 Redis 正常运行。

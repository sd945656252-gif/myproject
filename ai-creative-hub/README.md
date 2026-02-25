# AI Creative Hub - 全能 AI 创作工作站

一个商业级的 AI 创作平台，支持图像生成、视频创作、音乐生成、语音合成等全链路 AI 内容创作。

## 技术栈

### 前端
- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- shadcn/ui
- Zustand (状态管理)
- TanStack Query

### 后端
- Python FastAPI
- SQLAlchemy 2.0
- Celery + Redis (任务队列)
- PostgreSQL

## 快速开始

```bash
# 启动所有服务
docker-compose up -d

# 前端开发
cd frontend && npm run dev

# 后端开发
cd backend && uvicorn app.main:app --reload
```

## 项目结构

```
ai-creative-hub/
├── frontend/          # Next.js 前端
├── backend/           # FastAPI 后端
├── docker/            # Docker 配置
└── README.md
```

## 核心模块

1. **Prompt Engineering** - 提示词专家
2. **AI Image Generation** - 生图矩阵
3. **AI Video Generation** - 生视频矩阵
4. **One-Click Workflow** - 一键视频创作流
5. **Audio & Music** - 音乐生成
6. **Voice & TTS** - 语音合成

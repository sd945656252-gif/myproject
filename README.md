# AI Creative Hub

一个全能 AI 创作工作站，集成生图、生视频、音乐生成、语音合成及一键工作流等功能。

## 🚀 快速开始

### 推荐部署方式

| 部署方式 | 适用场景 | 文档 |
|---------|---------|------|
| 🐳 Docker Compose | 本地开发、快速测试 | [QUICK_START.md](QUICK_START.md) |
| 💻 本地直接运行 | 开发调试、无 Docker 环境 | [NATIVE_DEPLOYMENT_GUIDE.md](NATIVE_DEPLOYMENT_GUIDE.md) |
| ☁️ 云服务部署 | 生产环境、永久在线 | [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) |

### Docker Compose 部署 (最简单)

```bash
# 1. 克隆项目
git clone <repository-url>
cd ai-creative-hub

# 2. 配置环境变量
cp .docker.env .docker.env.local
# 编辑 .docker.env.local 填写必要配置

# 3. 启动服务
docker-compose up -d

# 4. 初始化数据库
docker-compose exec backend alembic upgrade head

# 5. 访问服务
# 前端: http://localhost:3000
# 后端: http://localhost:8000
# API 文档: http://localhost:8000/docs
```

详细说明请查看 [QUICK_START.md](QUICK_START.md)

## 功能特性

### 核心模块
- 🎨 **Prompt Expert** - AI 驱动的提示词专家
  - 图像转提示词（Image to Text）
  - 提示词智能优化（Prompt Optimization）
  - 支持多种 AI 模型（Midjourney, Stable Diffusion, DALL-E, Sora）

- 🖼️ **AI Image Generation** - AI 图像生成
  - 文本生图（Text to Image）
  - 图生图（Image to Image）
  - 局部重绘（Inpainting）
  - ControlNet 控制
  - 智能路由与自动降级

- 🎬 **Video Generation** - 视频生成
  - 文本生视频（Text to Video）
  - 图像生视频（Image to Video）
  - 支持 Kling、Jimeng 等提供商

- 🎵 **Audio Generation** - 音频生成
  - AI 音乐合成（Suno）
  - 语音合成（Minimax TTS）

- ⚙️ **Workflow Engine** - 工作流引擎
  - 预设模板
  - 自定义工作流
  - 批量处理

## 技术栈

### 后端
- Python 3.11
- FastAPI
- PostgreSQL (Async)
- Redis
- Celery
- Pydantic v2

### 前端
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Zustand
- shadcn/ui
- React Query

### 部署
- Docker
- Docker Compose
- Kubernetes

## 配置说明

### 环境变量

在 `.docker.env` 或 `backend/.env` 文件中配置：

```env
# 数据库
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/ai_creative_hub

# Redis
REDIS_URL=redis://localhost:6379/0

# AI API Keys (可选 - 未配置时功能自动跳过)
OPENAI_API_KEY=your_openai_key
HUGGINGFACE_API_KEY=your_huggingface_key
JIMENG_API_KEY=your_jimeng_key
KLING_API_KEY=your_kling_key
SUNO_API_KEY=your_suno_key
MINIMAX_API_KEY=your_minimax_key

# ComfyUI 本地部署（可选）
COMFYUI_HOST=localhost
COMFYUI_PORT=8188
COMFYUI_API_URL=http://localhost:8188
```

### API Keys 说明

所有 AI API Keys 都是**可选**的，未配置时：
- 对应的功能会自动跳过
- 不会影响系统其他功能正常运行
- 系统会使用可用的提供商，失败时自动降级

## 项目结构

```
ai-creative-hub/
├── backend/                 # 后端服务
│   ├── app/
│   │   ├── api/            # API 路由
│   │   ├── core/           # 核心配置
│   │   ├── integrations/   # AI 提供商集成
│   │   ├── models/         # 数据库模型
│   │   ├── schemas/        # Pydantic 模型
│   │   └── services/       # 业务逻辑
│   ├── requirements.txt    # Python 依赖
│   └── Dockerfile
│
├── frontend/               # 前端应用
│   ├── app/
│   │   ├── dashboard/      # 功能页面
│   │   ├── components/     # UI 组件
│   │   └── lib/           # 工具函数
│   ├── package.json        # Node.js 依赖
│   └── Dockerfile
│
├── k8s/                    # Kubernetes 配置
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
│
├── .docker.env             # Docker 环境变量模板
├── docker-compose.yml      # Docker Compose 配置
├── QUICK_START.md          # 快速开始指南
├── DEPLOYMENT_GUIDE.md     # 完整部署指南
└── TROUBLESHOOTING.md      # 故障排除指南
```

## API 文档

启动服务后，访问 http://localhost:8000/docs 查看完整的 API 文档。

### 主要端点

#### Prompt API
- `POST /api/v1/prompt/image-to-text` - 图像转提示词
- `POST /api/v1/prompt/optimize` - 优化提示词

#### Image API
- `POST /api/v1/image/text-to-image` - 文本生图
- `POST /api/v1/image/image-to-image` - 图生图
- `POST /api/v1/image/inpainting` - 局部重绘
- `POST /api/v1/image/controlnet` - ControlNet 控制

#### Video API
- `POST /api/v1/video/generate` - 视频生成
- `GET /api/v1/video/task/{task_id}` - 查询任务状态

#### Audio API
- `POST /api/v1/audio/music-generate` - 音乐生成
- `POST /api/v1/audio/tts` - 语音合成

#### Workflow API
- `GET /api/v1/workflow/templates` - 获取工作流模板
- `POST /api/v1/workflow/templates/{id}/run` - 运行工作流

## 开发指南

### 后端开发

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

详细说明请查看 [NATIVE_DEPLOYMENT_GUIDE.md](NATIVE_DEPLOYMENT_GUIDE.md)

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

## 部署文档

| 文档 | 用途 |
|------|------|
| [QUICK_START.md](QUICK_START.md) | 5分钟快速开始 |
| [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) | 部署状态总结 |
| [NATIVE_DEPLOYMENT_GUIDE.md](NATIVE_DEPLOYMENT_GUIDE.md) | 本地直接运行指南 |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | 完整部署指南 |
| [DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md) | 详细部署步骤 |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | 故障排除指南 |
| [DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md) | 部署完成报告 |

## 环境要求

### Docker Compose 部署
- Docker 20.10+
- Docker Compose 2.0+

### 本地直接运行
- Python 3.11+
- PostgreSQL 14+
- Redis 6+
- Node.js 20+ (仅前端需要)

## 故障排除

遇到问题？查看 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### 常见问题

**Q: 数据库连接失败？**
A: 检查 PostgreSQL 是否运行，验证 DATABASE_URL 配置

**Q: Redis 连接失败？**
A: 检查 Redis 服务状态，验证 REDIS_URL 配置

**Q: API 调用失败？**
A: API Keys 是可选的，未配置时相关功能会跳过。如需使用，在 .env 中配置相应的 API Key

## 项目状态

- ✅ 代码开发: 完成
- ✅ Docker 配置: 完成
- ✅ 环境变量配置: 完成
- ✅ 文档完善: 完成
- ✅ 部署脚本: 完成

**项目状态**: ✅ 就绪部署

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。

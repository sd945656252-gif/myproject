# AI Creative Hub - 快速开始

## 项目状态

✅ **代码已完成**: 所有核心功能已实现
✅ **配置已优化**: Docker 配置和环境变量已修复
✅ **文档已完善**: 部署指南和故障排除文档已创建

⚠️ **环境限制**: 当前容器环境不支持 Docker Compose 部署

## 推荐部署方式

### 🚀 方式一: 本地 Docker Compose 部署 (最简单)

**适用**: 开发环境、快速测试

**要求**: Docker 和 Docker Compose 已安装

```bash
# 1. 克隆项目
git clone <repository>
cd ai-creative-hub

# 2. 配置环境变量
cp .docker.env.example .docker.env
# 编辑 .docker.env 填写必要配置

# 3. 启动服务
docker-compose up -d

# 4. 初始化数据库
docker-compose exec backend alembic upgrade head

# 5. 访问服务
# 后端: http://localhost:8000
# 前端: http://localhost:3000
```

### 💻 方式二: 本地直接运行 (开发调试)

**适用**: 开发调试、容器环境

**要求**: Python 3.11+, PostgreSQL, Redis

详细步骤见 `NATIVE_DEPLOYMENT_GUIDE.md`

### ☁️ 方式三: 云服务部署 (生产环境)

**适用**: 生产环境、永久在线

**推荐平台**:
- AWS ECS / Fargate
- Azure Container Instances
- DigitalOcean App Platform
- 腾讯云容器服务

## 核心功能

### AI 生图
- 支持多个 AI 提供商 (Stability AI, Replicate, 本地 ComfyUI)
- 智能路由: 优先免费/开源 API，失败自动降级
- 批量生成、异步处理

### AI 视频生成
- 支持视频生成 API
- 异步任务队列 (Celery + Redis)
- 进度追踪和状态查询

### AI 音乐生成
- 文本转音乐
- 多种音乐风格

### 语音合成 (TTS)
- 文本转语音
- 多语言支持

### 工作流
- 一键执行复杂任务
- 可视化工作流编排

## 项目结构

```
ai-creative-hub/
├── backend/                 # 后端服务 (FastAPI)
│   ├── app/
│   │   ├── api/v1/         # API 路由
│   │   ├── core/           # 核心配置
│   │   ├── models/         # 数据模型
│   │   ├── services/       # 业务逻辑
│   │   └── routers/        # AI 路由器
│   ├── requirements.txt    # Python 依赖
│   └── Dockerfile
├── frontend/               # 前端服务 (Next.js)
│   ├── app/               # App Router 页面
│   ├── components/        # React 组件
│   └── package.json
├── docker-compose.yml      # Docker Compose 配置
├── .docker.env             # Docker 环境变量
├── .env.example            # 应用环境变量模板
└── docs/                   # 文档
    ├── DEPLOYMENT_GUIDE.md      # 完整部署指南
    ├── NATIVE_DEPLOYMENT_GUIDE.md  # 本地部署指南
    ├── TROUBLESHOOTING.md        # 故障排除
    └── API_GUIDE.md              # API 使用指南
```

## 环境变量配置

### 必需配置
```bash
# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/ai_creative_hub

# Redis
REDIS_URL=redis://localhost:6379/0

# 安全
SECRET_KEY=<生成随机密钥>
ALGORITHM=HS256
```

### 可选配置 (API Keys)
```bash
# OpenAI (可选)
OPENAI_API_KEY=sk-...

# Stability AI (用于生图)
STABILITY_API_KEY=...

# Replicate (用于视频生成)
REPLICATE_API_TOKEN=...

# 其他 API...
```

**提示**: 未配置 API Key 时，系统会自动跳过对应功能或使用降级策略

## 快速验证

### 后端健康检查
```bash
curl http://localhost:8000/api/v1/health
```

预期响应:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-25T...",
  "version": "1.0.0"
}
```

### 前端访问
访问 http://localhost:3000，应能看到 AI Creative Hub 首页

## API 使用示例

### 生图 API
```bash
curl -X POST http://localhost:8000/api/v1/image/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "一只可爱的猫咪",
    "provider": "stability",
    "width": 512,
    "height": 512
  }'
```

### 视频生成 API
```bash
curl -X POST http://localhost:8000/api/v1/video/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "日落海边的无人机航拍",
    "provider": "replicate"
  }'
```

更多 API 示例见 `API_GUIDE.md`

## 常见问题

### Q: Docker 容器无法启动？
A: 检查端口占用、确保 Docker 服务运行、查看容器日志
```bash
docker-compose logs -f
```

### Q: 数据库连接失败？
A: 确保数据库已启动、检查 DATABASE_URL 配置、验证用户权限

### Q: API 调用失败？
A: 检查 API Key 配置、查看网络连接、确认提供商服务状态

详细故障排除见 `TROUBLESHOOTING.md`

## 技术支持

- **部署问题**: 查看 `DEPLOYMENT_GUIDE.md`
- **故障排除**: 查看 `TROUBLESHOOTING.md`
- **API 使用**: 查看 `API_GUIDE.md`
- **本地部署**: 查看 `NATIVE_DEPLOYMENT_GUIDE.md`

## 下一步

1. 选择适合的部署方式
2. 配置必要的环境变量
3. 初始化数据库
4. 启动服务
5. 访问 http://localhost:3000 开始使用

---

**项目状态**: ✅ 就绪部署
**文档状态**: ✅ 完整
**配置状态**: ✅ 已优化

祝您使用愉快！

# 本地开发快速启动指南

## 一键启动 (推荐)

使用 Docker Compose 启动所有服务:

```bash
./start.sh
```

或者:

```bash
docker-compose up -d
```

启动后访问:
- 前端: http://localhost:3000
- 后端 API: http://localhost:8000
- API 文档: http://localhost:8000/api/docs

## 手动启动 (用于开发调试)

### 1. 启动基础设施

```bash
docker-compose up -d postgres redis
```

### 2. 启动后端

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 填写必要的 API Keys

# 启动 API 服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 4. 启动 Celery Worker (可选)

```bash
cd backend
source venv/bin/activate

# 启动 worker
celery -A app.workers.celery_app worker --loglevel=info --concurrency=2

# 启动 beat (定时任务)
celery -A app.workers.celery_app beat --loglevel=info
```

## 环境变量配置

### 后端 (.env)

必需配置:
```bash
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/ai_creative_hub
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
SECRET_KEY=your-secret-key-here
```

可选 API Keys (根据需要填写):
```bash
OPENAI_API_KEY=sk-...
HUGGINGFACE_API_KEY=hf_...
JIMENG_API_KEY=...
KLING_API_KEY=...
SUNO_API_KEY=...
MINIMAX_API_KEY=...
```

### 前端 (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## 常见问题

### 端口被占用

修改 `docker-compose.yml` 中的端口映射:
```yaml
ports:
  - "3001:3000"  # 前端改为 3001
  - "8001:8000"  # 后端改为 8001
```

### 数据库连接失败

确保 PostgreSQL 已启动:
```bash
docker-compose ps postgres
docker-compose logs postgres
```

### Redis 连接失败

确保 Redis 已启动:
```bash
docker-compose ps redis
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f celery-worker
```

## 停止服务

```bash
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

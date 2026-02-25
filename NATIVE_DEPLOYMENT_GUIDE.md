# 本地直接部署指南

## 前置要求

- Python 3.11+
- PostgreSQL 14+
- Redis 6+
- Node.js 20+ (可选，仅前端需要)

## 步骤一: 安装 PostgreSQL

### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Windows
从 [PostgreSQL 官网](https://www.postgresql.org/download/) 下载安装

## 步骤二: 安装 Redis

### Linux
```bash
# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis

# CentOS/RHEL
sudo yum install redis
sudo systemctl start redis
sudo systemctl enable redis
```

### macOS
```bash
brew install redis
brew services start redis
```

### Windows
从 [Redis 官网](https://redis.io/download) 下载或使用 WSL

## 步骤三: 创建数据库

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 执行以下 SQL 命令
CREATE DATABASE ai_creative_hub;
CREATE USER aich_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ai_creative_hub TO aich_user;
\q
```

## 步骤四: 部署后端

### 1. 进入后端目录
```bash
cd /workspace/projects/ai-creative-hub/backend
```

### 2. 创建虚拟环境
```bash
python3.11 -m venv venv
source venv/bin/activate  # Linux/macOS
# 或
venv\Scripts\activate  # Windows
```

### 3. 安装依赖
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. 配置环境变量
```bash
cp .env.example .env
nano .env  # 或使用其他编辑器
```

**编辑 .env 文件**，填写以下关键配置:
```bash
# 数据库配置
DATABASE_URL=postgresql://aich_user:your_secure_password@localhost:5432/ai_creative_hub
TEST_DATABASE_URL=postgresql://aich_user:your_secure_password@localhost:5432/ai_creative_hub_test

# Redis 配置
REDIS_URL=redis://localhost:6379/0

# API 配置 (根据需要填写)
OPENAI_API_KEY=your_openai_key_if_needed
STABILITY_API_KEY=your_stability_key_if_needed

# 安全配置
SECRET_KEY=your_random_secret_key_generate_with_openssl_rand_base64_32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS 配置
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]
```

### 5. 初始化数据库
```bash
alembic upgrade head
```

### 6. 启动后端服务
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 7. 验证后端服务
访问 http://localhost:8000/api/v1/health

## 步骤五: 部署前端 (可选)

### 1. 进入前端目录
```bash
cd /workspace/projects/ai-creative-hub/frontend
```

### 2. 安装 Node.js 依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
cp .env.example .env.local
nano .env.local
```

**编辑 .env.local 文件**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. 启动前端服务
```bash
npm run dev
```

### 5. 访问前端
访问 http://localhost:3000

## 步骤六: 常见问题排查

### 问题 1: 数据库连接失败
**检查**: PostgreSQL 是否运行
```bash
sudo systemctl status postgresql
```

**修复**: 启动 PostgreSQL
```bash
sudo systemctl start postgresql
```

### 问题 2: Redis 连接失败
**检查**: Redis 是否运行
```bash
sudo systemctl status redis
# 或
redis-cli ping
```

**修复**: 启动 Redis
```bash
sudo systemctl start redis
```

### 问题 3: 端口已被占用
**检查**: 端口占用情况
```bash
lsof -i :8000  # 后端端口
lsof -i :3000  # 前端端口
lsof -i :5432  # PostgreSQL 端口
lsof -i :6379  # Redis 端口
```

**修复**: 停止占用端口的进程或修改配置中的端口号

### 问题 4: 依赖安装失败
**检查**: Python 版本
```bash
python --version
```

**修复**: 确保使用 Python 3.11+
```bash
python3.11 -m venv venv
```

## 生产环境部署建议

### 使用 Gunicorn + Uvicorn Workers
```bash
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
```

### 使用 Nginx 反向代理
```nginx
upstream backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 使用 Supervisor 管理进程
```ini
[program:aich_backend]
command=/workspace/projects/ai-creative-hub/backend/venv/bin/gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
directory=/workspace/projects/ai-creative-hub/backend
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/aich_backend.err.log
stdout_logfile=/var/log/aich_backend.out.log
```

## 下一步

部署完成后，建议:
1. 阅读 `API_GUIDE.md` 了解 API 使用方法
2. 查看 `TROUBLESHOOTING.md` 了解常见问题
3. 根据实际需求调整配置参数
4. 配置监控和日志收集

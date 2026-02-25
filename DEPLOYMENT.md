# Deployment Guide - AI Creative Hub

## 部署方式

### 方式 1: Docker Compose (推荐)

适用于单机部署和开发环境。

#### 前置要求
- Docker 20.10+
- Docker Compose 2.0+
- 至少 4GB 可用内存
- 至少 10GB 可用磁盘空间

#### 部署步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd ai-creative-hub
```

2. **配置环境变量**
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下关键参数：
```env
# 数据库
DATABASE_URL=postgresql+asyncpg://admin:your_secure_password@db:5432/ai_creative_hub

# Redis
REDIS_URL=redis://redis:6379

# AI API Keys (至少配置一个)
OPENAI_API_KEY=sk-...
HUGGINGFACE_API_KEY=hf_...

# 安全
SECRET_KEY=your-secret-key-change-in-production-min-32-chars

# 文件存储
UPLOAD_DIR=./uploads
OUTPUT_DIR=./outputs
```

3. **运行初始化脚本**
```bash
./setup.sh
```

4. **运行数据库迁移**
```bash
./migrate.sh
```

5. **启动服务**
```bash
docker-compose up -d
```

6. **验证部署**
```bash
# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 测试后端 API
curl http://localhost:8000/health

# 测试前端
# 浏览器访问 http://localhost:3000
```

#### 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 更新服务
docker-compose pull
docker-compose up -d

# 进入容器
docker-compose exec backend bash
docker-compose exec frontend sh

# 备份数据库
docker-compose exec db pg_dump -U admin ai_creative_hub > backup.sql

# 恢复数据库
docker-compose exec -T db psql -U admin ai_creative_hub < backup.sql
```

### 方式 2: 生产环境部署

适用于正式生产环境，使用 Nginx 反向代理。

#### 架构图

```
                ┌─────────────────┐
                │   Internet     │
                └────────┬────────┘
                         │
                ┌────────▼────────┐
                │    Nginx        │
                │  (SSL/HTTPS)    │
                └────────┬────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼────────┐           ┌────────▼────────┐
│   Frontend      │           │   Backend       │
│   (Next.js)     │◄──────────►│   (FastAPI)     │
└─────────────────┘           └────────┬────────┘
                                         │
         ┌───────────────┬───────────────┼───────────────┐
         │               │               │               │
┌────────▼────────┐┌────▼────┐┌────────▼────────┐┌─────▼──────┐
│   PostgreSQL    ││ Redis   ││  Celery Worker ││   uploads   │
│   (Database)    ││ (Cache) ││   (Tasks)      ││   outputs   │
└─────────────────┘└─────────┘└─────────────────┘└────────────┘
```

#### Nginx 配置

创建 `/etc/nginx/sites-available/ai-creative-hub`:

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    server_name your-domain.com;

    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_read_timeout 86400;
    }

    # Static files (uploads/outputs)
    location /uploads {
        alias /path/to/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /outputs {
        alias /path/to/outputs;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # File upload size limit
    client_max_body_size 100M;
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/ai-creative-hub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### SSL 证书 (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Systemd 服务

创建 `/etc/systemd/system/ai-creative-hub-backend.service`:

```ini
[Unit]
Description=AI Creative Hub Backend
After=network.target postgresql.service redis.service

[Service]
Type=notify
User=aihub
Group=aihub
WorkingDirectory=/opt/ai-creative-hub/backend
Environment="PATH=/opt/ai-creative-hub/backend/venv/bin"
ExecStart=/opt/ai-creative-hub/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

创建 `/etc/systemd/system/ai-creative-hub-frontend.service`:

```ini
[Unit]
Description=AI Creative Hub Frontend
After=network.target

[Service]
Type=simple
User=aihub
Group=aihub
WorkingDirectory=/opt/ai-creative-hub/frontend
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

创建 `/etc/systemd/system/ai-creative-hub-worker.service`:

```ini
[Unit]
Description=AI Creative Hub Celery Worker
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=aihub
Group=aihub
WorkingDirectory=/opt/ai-creative-hub/backend
Environment="PATH=/opt/ai-creative-hub/backend/venv/bin"
ExecStart=/opt/ai-creative-hub/backend/venv/bin/celery -A app.tasks worker --loglevel=info
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable ai-creative-hub-backend ai-creative-hub-frontend ai-creative-hub-worker
sudo systemctl start ai-creative-hub-backend ai-creative-hub-frontend ai-creative-hub-worker
```

### 方式 3: 云平台部署

#### AWS ECS

1. 创建 ECS 集群
2. 配置任务定义
3. 创建负载均衡器
4. 设置自动扩缩容
5. 配置 SSL 证书

#### Google Cloud Run

```bash
# Build and push images
gcloud builds submit --tag gcr.io/PROJECT_ID/ai-hub-backend
gcloud builds submit --tag gcr.io/PROJECT_ID/ai-hub-frontend

# Deploy services
gcloud run deploy ai-hub-backend --image gcr.io/PROJECT_ID/ai-hub-backend
gcloud run deploy ai-hub-frontend --image gcr.io/PROJECT_ID/ai-hub-frontend
```

#### Azure Container Instances

```bash
az container create \
  --resource-group myResourceGroup \
  --name ai-hub-backend \
  --image myregistry.azurecr.io/ai-hub-backend \
  --cpu 2 \
  --memory 4 \
  --dns-name-label ai-hub-backend \
  --ports 8000
```

## 监控和日志

### 日志查看

```bash
# Docker Compose
docker-compose logs -f backend
docker-compose logs -f frontend

# Systemd
sudo journalctl -u ai-creative-hub-backend -f
```

### 监控指标

推荐使用：
- Prometheus + Grafana
- DataDog
- New Relic

关键指标：
- API 响应时间
- 错误率
- 任务队列长度
- 数据库连接数
- 磁盘使用率

## 备份策略

### 数据库备份

```bash
# 每日自动备份
0 2 * * * /opt/scripts/backup-db.sh

# 手动备份
docker-compose exec db pg_dump -U admin ai_creative_hub > backup_$(date +%Y%m%d).sql
```

### 文件备份

```bash
# 备份 uploads 和 outputs
tar -czf files_$(date +%Y%m%d).tar.gz uploads outputs
```

## 性能优化

### 数据库优化

```sql
-- 添加索引
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_workflows_user_created ON workflows(user_id, created_at);
```

### Redis 配置

```ini
maxmemory 2gb
maxmemory-policy allkeys-lru
```

### 前端优化

- 启用 CDN
- 启用 Gzip 压缩
- 配置缓存策略

## 安全加固

1. **使用强密码**
2. **启用 HTTPS**
3. **配置防火墙**
4. **定期更新依赖**
5. **限制 API 访问频率**
6. **启用审计日志**

## 故障排查

### 常见问题

1. **服务无法启动**
   ```bash
   # 检查日志
   docker-compose logs backend

   # 检查端口占用
   netstat -tlnp | grep 8000
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库状态
   docker-compose exec db pg_isready

   # 检查连接
   docker-compose exec backend python -c "from app.database import engine; print(engine.connect())"
   ```

3. **任务队列阻塞**
   ```bash
   # 检查 Celery 状态
   docker-compose exec backend celery -A app.tasks inspect active

   # 重启 worker
   docker-compose restart celery_worker
   ```

## 更新和升级

```bash
# 拉取最新代码
git pull origin main

# 更新依赖
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# 运行迁移
./migrate.sh

# 重启服务
docker-compose restart

# 清理旧镜像
docker image prune -a
```

## 支持和维护

- 查看日志
- 监控性能指标
- 定期备份数据
- 更新安全补丁
- 优化数据库查询

---

**注意**: 生产环境部署前请务必：
1. 修改所有默认密码
2. 配置 SSL/TLS
3. 设置防火墙规则
4. 配置监控和告警
5. 制定灾难恢复计划

# AI Creative Hub 部署步骤

## 📝 快速部署（推荐）

### 方法 1: 使用一键部署脚本

```bash
# 1. 进入项目目录
cd ai-creative-hub

# 2. 首次部署 - 生成密钥
./deploy.sh

# 3. 编辑生成的配置文件
nano .docker.env  # 或使用其他编辑器
nano .env

# 4. 再次运行部署脚本
./deploy.sh

# 5. 生产环境部署
./deploy.sh production
```

### 方法 2: 手动部署

```bash
# 1. 复制环境变量模板
cp .docker.env.example .docker.env
cp .env.example .env

# 2. 生成密钥
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
openssl rand -base64 32  # 数据库密码
openssl rand -base64 24  # Redis 密码

# 3. 编辑配置文件
nano .docker.env
nano .env

# 4. 启动服务
docker-compose up -d

# 5. 初始化数据库
docker-compose exec backend alembic upgrade head

# 6. 验证部署
curl http://localhost:8000/health
```

---

## 🔧 详细配置

### .docker.env 配置示例

```bash
# 数据库配置
POSTGRES_USER=app_db_user
POSTGRES_PASSWORD=<生成的强密码>
POSTGRES_DB=ai_creative_hub

# Redis 配置
REDIS_PASSWORD=<生成的强密码>

# 应用密钥
SECRET_KEY=<生成的强密钥>

# AI API 密钥（可选，根据需要填写）
OPENAI_API_KEY=
HUGGINGFACE_API_KEY=
JIMENG_API_KEY=
KLING_API_KEY=
SUNO_API_KEY=
MINIMAX_API_KEY=

# ComfyUI（可选）
COMFYUI_HOST=localhost
COMFYUI_PORT=8188

# 安全配置
APP_ENV=production
DEBUG=false

# CORS 配置
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CORS_ALLOW_CREDENTIALS=true

# 文件存储
MAX_UPLOAD_SIZE=10485760
```

### .env 配置示例

```bash
APP_NAME=AI Creative Hub
APP_VERSION=0.1.0
APP_ENV=production
DEBUG=true

DATABASE_URL=postgresql+asyncpg://app_db_user:<密码>@localhost:5432/ai_creative_hub
DATABASE_TEST_URL=postgresql+asyncpg://app_db_user:<密码>@localhost:5432/ai_creative_hub_test

REDIS_URL=redis://localhost:6379
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

OPENAI_API_KEY=
HUGGINGFACE_API_KEY=
JIMENG_API_KEY=
KLING_API_KEY=
SUNO_API_KEY=
MINIMAX_API_KEY=

COMFYUI_HOST=localhost
COMFYUI_PORT=8188

SECRET_KEY=<与 .docker.env 相同>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

UPLOAD_DIR=./uploads
OUTPUT_DIR=./outputs
MAX_UPLOAD_SIZE=10485760

CORS_ORIGINS=http://localhost:3000,http://localhost:8000
CORS_ALLOW_CREDENTIALS=true
```

---

## ✅ 验证部署

### 健康检查

```bash
# 后端健康检查
curl http://localhost:8000/health

# 预期响应
{
  "status": "healthy",
  "app": "AI Creative Hub",
  "version": "0.1.0",
  "environment": "production"
}
```

### 检查服务状态

```bash
# 查看所有服务
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
docker-compose logs -f redis
```

### 测试功能

```bash
# 1. 测试 API 端点
curl http://localhost:8000/api/v1/health

# 2. 测试文件上传（如果有）
curl -X POST -F "file=@test.jpg" http://localhost:8000/api/v1/image/upload

# 3. 测试速率限制
for i in {1..70}; do curl http://localhost:8000/api/v1/health; done
# 应该看到 429 状态码
```

---

## 🌐 生产环境配置

### Nginx 反向代理

```bash
# 1. 安装 Nginx
sudo apt-get install nginx

# 2. 创建配置文件
sudo nano /etc/nginx/sites-available/ai-creative-hub

# 3. 复制 Nginx 配置（见 DEPLOYMENT_GUIDE.md）

# 4. 启用站点
sudo ln -s /etc/nginx/sites-available/ai-creative-hub /etc/nginx/sites-enabled/

# 5. 测试配置
sudo nginx -t

# 6. 重启 Nginx
sudo systemctl restart nginx
```

### SSL/TLS 证书

```bash
# 1. 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 2. 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 3. 测试自动续期
sudo certbot renew --dry-run
```

### 防火墙配置

```bash
# 1. 安装 UFW
sudo apt-get install ufw

# 2. 配置规则
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable

# 3. 查看状态
sudo ufw status
```

---

## 🔍 故障排查

### 常见问题

**Q: 服务无法启动**
```bash
# 查看日志
docker-compose logs backend

# 检查端口占用
netstat -tulpn | grep :8000

# 重启服务
docker-compose restart
```

**Q: 数据库连接失败**
```bash
# 检查数据库状态
docker-compose exec db pg_isready

# 重启数据库
docker-compose restart db

# 检查配置
cat .docker.env | grep POSTGRES
```

**Q: 文件上传失败**
```bash
# 检查目录权限
ls -la uploads/
ls -la outputs/

# 修复权限
chmod 755 uploads outputs
```

---

## 📊 监控和维护

### 查看资源使用

```bash
# Docker 容器资源使用
docker stats

# 磁盘使用
df -h

# 内存使用
free -h
```

### 备份数据库

```bash
# 创建备份
docker-compose exec -T db pg_dump -U app_db_user ai_creative_hub | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# 恢复备份
gunzip < backup_YYYYMMDD_HHMMSS.sql.gz | docker-compose exec -T db psql -U app_db_user ai_creative_hub
```

### 更新应用

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建
docker-compose up -d --build

# 3. 执行迁移
docker-compose exec backend alembic upgrade head

# 4. 重启服务
docker-compose restart
```

---

## 📞 获取帮助

- 查看完整部署指南: `DEPLOYMENT_GUIDE.md`
- 查看安全指南: `SECURE_DEPLOYMENT_GUIDE.md`
- 查看文档索引: `COMPLETE_DOCS.md`
- 查看故障排查: 运行 `./pre-build-check.sh`

---

## ✅ 部署检查清单

部署完成后，请确认：

- [ ] 所有服务正常运行
- [ ] 后端 API 健康检查通过
- [ ] 前端页面可访问
- [ ] HTTPS 配置正确
- [ ] SSL 证书有效
- [ ] 文件上传功能正常
- [ ] 数据库连接正常
- [ ] Redis 连接正常
- [ ] 速率限制工作正常
- [ ] 日志正常输出
- [ ] 备份策略已设置
- [ ] 监控已配置

---

**祝您部署顺利！🚀**

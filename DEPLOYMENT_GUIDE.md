# AI Creative Hub 部署指南

本指南提供完整的部署流程，帮助您在生产环境中部署 AI Creative Hub。

---

## 📋 部署前检查清单

### 必须完成

- [ ] ✅ SKILL.md 文件格式正确（已修复）
- [ ] ✅ .coze 文件格式正确（已修复）
- [ ] ✅ 所有问题已修复
- [ ] 服务器环境准备就绪
- [ ] Docker 和 Docker Compose 已安装
- [ ] 域名和 DNS 已配置
- [ ] SSL/TLS 证书已准备

### 配置文件

- [ ] 复制 `.docker.env.example` 到 `.docker.env` 并填写配置
- [ ] 复制 `.env.example` 到 `.env` 并填写配置
- [ ] 生成强密码和密钥
- [ ] 配置 API 密钥（OpenAI, HuggingFace 等）

---

## 🚀 快速部署流程

### 步骤 1: 环境准备

```bash
# 1. 克隆项目
git clone <repository-url>
cd ai-creative-hub

# 2. 复制环境变量模板
cp .docker.env.example .docker.env
cp .env.example .env

# 3. 生成强密码和密钥
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
openssl rand -base64 32  # 数据库密码
openssl rand -base64 24  # Redis 密码
```

### 步骤 2: 配置环境变量

编辑 `.docker.env` 文件：

```bash
# 数据库配置
POSTGRES_USER=your_secure_db_user
POSTGRES_PASSWORD=<生成的强密码>
POSTGRES_DB=ai_creative_hub

# Redis 配置
REDIS_PASSWORD=<生成的强密码>

# 应用密钥
SECRET_KEY=<生成的强密钥>

# API 密钥（可选）
OPENAI_API_KEY=
HUGGINGFACE_API_KEY=
JIMENG_API_KEY=
KLING_API_KEY=
SUNO_API_KEY=
MINIMAX_API_KEY=

# 生产环境设置
APP_ENV=production
DEBUG=false

# CORS 配置
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 步骤 3: 启动服务

```bash
# 1. 构建并启动所有服务
docker-compose up -d

# 2. 查看服务状态
docker-compose ps

# 3. 查看日志
docker-compose logs -f backend
```

### 步骤 4: 初始化数据库

```bash
# 执行数据库迁移
docker-compose exec backend alembic upgrade head

# 或者使用迁移脚本
./migrate.sh
```

### 步骤 5: 验证部署

```bash
# 检查后端健康状态
curl http://localhost:8000/health

# 检查前端
curl http://localhost:3000

# 检查 API 文档（仅在 DEBUG=true 时）
curl http://localhost:8000/api/docs
```

---

## 🔒 生产环境部署

### 使用反向代理（推荐）

#### Nginx 配置示例

创建 `/etc/nginx/sites-available/ai-creative-hub`:

```nginx
upstream backend {
    server localhost:8000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # 后端 API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # 前端应用
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 文件上传
    client_max_body_size 100M;
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/ai-creative-hub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 获取 SSL 证书

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 📊 监控和日志

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
docker-compose logs -f redis

# 查看最近 100 行日志
docker-compose logs --tail=100 backend
```

### 监控指标

```bash
# 检查容器资源使用
docker stats

# 检查容器健康状态
docker-compose ps

# 检查磁盘使用
df -h
```

---

## 🔧 维护操作

### 更新应用

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建并启动
docker-compose up -d --build

# 3. 执行数据库迁移（如果有）
docker-compose exec backend alembic upgrade head
```

### 备份数据库

```bash
# 创建备份
docker-compose exec -T db pg_dump -U your_db_user ai_creative_hub | gzip > backup_$(date +%Y%m%d).sql.gz

# 恢复备份
gunzip < backup_YYYYMMDD.sql.gz | docker-compose exec -T db psql -U your_db_user ai_creative_hub
```

### 清理旧数据

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的卷
docker volume prune
```

---

## 🛠️ 故障排查

### 服务无法启动

```bash
# 检查日志
docker-compose logs backend

# 检查端口占用
netstat -tulpn | grep :8000
netstat -tulpn | grep :3000

# 检查磁盘空间
df -h
```

### 数据库连接失败

```bash
# 检查数据库状态
docker-compose exec db pg_isready

# 检查数据库日志
docker-compose logs db

# 重启数据库
docker-compose restart db
```

### API 速率限制触发

```bash
# 检查速率限制日志
docker-compose logs backend | grep -i rate

# 清空 Redis 缓存（谨慎操作）
docker-compose exec redis redis-cli FLUSHDB
```

---

## 🔐 安全加固

### 防火墙配置

```bash
# 使用 UFW
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable

# 查看状态
sudo ufw status verbose
```

### 定期更新

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 更新 Docker
sudo apt-get install docker-ce docker-ce-cli containerd.io

# 重新部署应用
cd ai-creative-hub
docker-compose up -d --build
```

---

## 📞 获取帮助

### 查看文档

- [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md) - 安全审计报告
- [SECURE_DEPLOYMENT_GUIDE.md](SECURE_DEPLOYMENT_GUIDE.md) - 安全部署指南
- [DEPLOYMENT.md](DEPLOYMENT.md) - 部署文档
- [COMPLETE_DOCS.md](COMPLETE_DOCS.md) - 完整文档

### 常见问题

**Q: 端口被占用怎么办？**
A: 修改 `docker-compose.yml` 中的端口映射，或停止占用端口的服务。

**Q: 如何查看详细错误日志？**
A: 使用 `docker-compose logs --tail=500 backend` 查看更多日志。

**Q: 如何重置数据库？**
A: 警告：这会删除所有数据！
   ```bash
   docker-compose down -v
   docker-compose up -d
   docker-compose exec backend alembic upgrade head
   ```

---

## ✅ 部署验证清单

部署完成后，请验证以下项目：

- [ ] 所有服务正常运行（`docker-compose ps`）
- [ ] 后端 API 健康检查通过（`curl http://localhost:8000/health`）
- [ ] 前端页面可访问（浏览器打开 `http://localhost:3000`）
- [ ] HTTPS 配置正确（访问 `https://yourdomain.com`）
- [ ] SSL 证书有效
- [ ] 文件上传功能正常
- [ ] 数据库连接正常
- [ ] Redis 连接正常
- [ ] 速率限制工作正常
- [ ] 日志正常输出

---

**部署完成后，系统将具备以下安全特性：**

✅ OWASP 标准安全头配置
✅ API 速率限制
✅ 文件上传验证
✅ 优化的数据库连接池
✅ 增强的日志审计
✅ 非 root 容器运行
✅ 环境变量管理敏感信息
✅ HTTPS/TLS 加密

---

**祝您部署顺利！**

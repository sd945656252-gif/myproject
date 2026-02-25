# AI Creative Hub 安全部署指南

本文档提供了在生产环境部署 AI Creative Hub 时需要遵循的安全最佳实践和步骤。

---

## 前置要求

在开始部署之前，请确保：

- [ ] 已阅读并理解 `SECURITY_AUDIT_REPORT.md` 中的所有安全问题
- [ ] 所有高风险和中风险问题已修复
- [ ] 已设置强密码和密钥
- [ ] 已配置防火墙和网络规则
- [ ] 已准备备份策略

---

## 1. 环境配置

### 1.1 创建环境变量文件

```bash
# 复制 Docker 环境变量模板
cp .docker.env.example .docker.env

# 复制应用环境变量模板
cp .env.example .env
```

### 1.2 生成强密钥和密码

```bash
# 生成 SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# 生成数据库密码
openssl rand -base64 32

# 生成 Redis 密码
openssl rand -base64 24
```

### 1.3 填写 .docker.env

编辑 `.docker.env` 文件，填写以下内容：

```bash
# 数据库配置
POSTGRES_USER=<强用户名，如: app_db_user>
POSTGRES_PASSWORD=<强密码，至少 32 字符>
POSTGRES_DB=ai_creative_hub

# Redis 配置
REDIS_PASSWORD=<强密码，至少 24 字符>

# 应用密钥
SECRET_KEY=<从步骤 1.2 生成的密钥>

# API 密钥（根据需要填写）
OPENAI_API_KEY=
HUGGINGFACE_API_KEY=
JIMENG_API_KEY=
KLING_API_KEY=
SUNO_API_KEY=
MINIMAX_API_KEY=
```

### 1.4 配置生产环境设置

在 `.docker.env` 中设置：

```bash
APP_ENV=production
DEBUG=false

# CORS 配置（仅允许信任的域名）
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## 2. Docker 安全配置

### 2.1 使用非 root 用户运行

已通过修改 Dockerfile 实现，容器将以 `appuser` (后端) 和 `nextjs` (前端) 用户运行。

### 2.2 限制容器权限

在 `docker-compose.yml` 中添加资源限制：

```yaml
services:
  backend:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
    read_only: false
    security_opt:
      - no-new-privileges:true
```

### 2.3 网络隔离

Docker Compose 已使用默认网络，确保只暴露必要的端口：

```yaml
services:
  backend:
    ports:
      - "127.0.0.1:8000:8000"  # 仅绑定到本地

  db:
    # 不暴露端口到宿主机
    ports: []

  redis:
    # 不暴露端口到宿主机
    ports: []
```

### 2.4 使用私有镜像仓库（可选）

```bash
# 构建并推送到私有仓库
docker tag ai-creative-hub-backend:latest your-registry.com/ai-creative-hub/backend:latest
docker push your-registry.com/ai-creative-hub/backend:latest

# 在 docker-compose.yml 中使用
backend:
  image: your-registry.com/ai-creative-hub/backend:latest
```

---

## 3. HTTPS/TLS 配置

### 3.1 使用反向代理

推荐使用 Nginx 或 Traefik 作为反向代理，处理 HTTPS 终止。

#### Nginx 配置示例

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # 后端代理
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # 前端代理
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 3.2 获取 SSL 证书

```bash
# 使用 Let's Encrypt 和 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 4. 数据库安全

### 4.1 PostgreSQL 安全配置

确保 `.docker.env` 中的数据库凭据足够强：

```bash
POSTGRES_USER=app_admin_user
POSTGRES_PASSWORD=<至少 32 字符的强密码>
```

### 4.2 数据库备份策略

创建定期备份脚本：

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="ai_creative_hub"
DB_USER="app_admin_user"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
docker-compose exec -T db pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# 删除 7 天前的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

添加到 crontab：

```bash
# 每天凌晨 2 点执行备份
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

### 4.3 数据库访问控制

- 只允许应用服务器访问数据库
- 定期更新数据库密码
- 启用数据库审计日志（可选）

---

## 5. Redis 安全

### 5.1 启用 Redis 密码认证

已在 `docker-compose.yml` 中配置：

```yaml
redis:
  command: redis-server --requirepass ${REDIS_PASSWORD}
```

### 5.2 Redis 访问控制

- 只允许应用服务器访问 Redis
- 定期更新 Redis 密码
- 禁用 Redis 的危险命令（FLUSHDB, FLUSHALL 等）

---

## 6. 应用安全

### 6.1 速率限制

已在生产环境启用，限制规则：

- 默认: 100 请求/分钟
- API: 60 请求/分钟
- 上传: 10 上传/分钟
- 生成: 20 任务/分钟

可通过修改 `backend/app/core/rate_limit.py` 调整。

### 6.2 安全 HTTP 头

已通过 `SecurityMiddleware` 添加所有 OWASP 推荐的安全头。

### 6.3 文件上传安全

已实现：
- 文件扩展名验证
- MIME 类型验证
- Magic Bytes 验证
- 文件大小限制
- 文件名清理

### 6.4 错误处理

- 生产环境隐藏详细错误信息
- 所有错误记录到日志
- 包含请求 ID 用于追踪

---

## 7. 防火墙配置

### 7.1 使用 UFW (Ubuntu)

```bash
# 启用 UFW
sudo ufw enable

# 允许 SSH
sudo ufw allow 22/tcp

# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 拒绝其他所有流量
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 查看状态
sudo ufw status verbose
```

### 7.2 使用 iptables

```bash
# 允许已建立的连接
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# 允许 SSH
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 允许 HTTP/HTTPS
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 拒绝其他所有入站流量
sudo iptables -A INPUT -j DROP

# 保存规则
sudo iptables-save > /etc/iptables/rules.v4
```

---

## 8. 监控和日志

### 8.1 应用日志

```bash
# 查看后端日志
docker-compose logs -f backend

# 查看安全事件
docker-compose logs backend | grep -i "security\|error\|warning"
```

### 8.2 日志聚合（可选）

使用 ELK Stack (Elasticsearch, Logstash, Kibana) 或 Grafana Loki 进行日志聚合。

### 8.3 监控指标

监控以下指标：
- CPU 使用率
- 内存使用率
- 磁盘使用率
- 请求延迟
- 错误率
- 速率限制触发次数

---

## 9. 更新和维护

### 9.1 定期更新依赖

```bash
# 后端依赖更新
cd backend
pip list --outdated
pip install -U <package>

# 前端依赖更新
cd frontend
npm outdated
npm update
```

### 9.2 安全补丁

订阅安全公告，及时应用安全补丁。

### 9.3 定期审计

- 每季度进行一次安全审计
- 定期检查日志中的可疑活动
- 定期更新密码和密钥

---

## 10. 应急响应

### 10.1 安全事件检测

监控以下异常：
- 大量失败的登录尝试
- 异常的 API 调用量
- 速率限制频繁触发
- 未知的错误模式

### 10.2 应急响应流程

1. 隔离受影响的系统
2. 收集日志和证据
3. 分析攻击向量
4. 修复漏洞
5. 恢复服务
6. 总结经验教训

### 10.3 紧急联系人

建立紧急联系清单，包括：
- 系统管理员
- 安全团队
- 管理层

---

## 11. 合规性

### 11.1 数据保护

- 确保符合 GDPR、CCPA 等数据保护法规
- 实施数据加密（传输和存储）
- 提供数据删除功能

### 11.2 审计日志

- 保留审计日志至少 6 个月
- 定期审计日志内容
- 保护日志文件不被篡改

---

## 12. 检查清单

部署前请确认：

### 基础配置
- [ ] .docker.env 已创建并填入正确配置
- [ ] .env 已创建并填入正确配置
- [ ] 所有密码和密钥都是强密码
- [ ] DEBUG 设置为 false
- [ ] APP_ENV 设置为 production

### Docker 配置
- [ ] 使用非 root 用户运行容器
- [ ] 配置了资源限制
- [ ] 数据库和 Redis 端口未暴露
- [ ] 使用私有镜像仓库（可选）

### 网络配置
- [ ] HTTPS/TLS 已配置
- [ ] 防火墙规则已配置
- [ ] 仅允许必要端口访问
- [ ] DNS 已正确配置

### 数据库
- [ ] 强密码已设置
- [ ] 备份策略已实施
- [ ] 访问控制已配置

### 监控
- [ ] 日志收集已配置
- [ ] 监控告警已设置
- [ ] 健康检查端点可用

---

**文档版本:** 1.0
**最后更新:** 2025-02-25

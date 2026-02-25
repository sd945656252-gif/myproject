# 部署故障排查指南

## 常见问题及解决方案

### 1. 环境变量缺失错误

**错误信息:**
```
pydantic_core._pydantic_core.ValidationError: 1 validation error for Settings
database_url: field required (type=value_error.missing)
```

**原因:** 缺少必需的环境变量

**解决方案:**
```bash
# 确保配置文件存在
ls -la .docker.env .env

# 如果不存在，复制模板
cp .docker.env.example .docker.env
cp .env.example .env
```

---

### 2. Docker Compose 命令不存在

**错误信息:**
```
bash: docker-compose: command not found
```

**原因:** Docker Compose 未安装

**解决方案:**
```bash
# 安装 Docker Compose V2
sudo apt-get update
sudo apt-get install docker-compose-plugin

# 验证安装
docker compose version
```

---

### 3. 端口已被占用

**错误信息:**
```
Bind for 0.0.0.0:8000 failed: port is already allocated
```

**原因:** 端口已被其他进程占用

**解决方案:**
```bash
# 查找占用端口的进程
lsof -i :8000
# 或
netstat -tulpn | grep :8000

# 停止占用进程
kill -9 <PID>

# 或修改 docker-compose.yml 中的端口映射
# 例如: "8001:8000" 而不是 "8000:8000"
```

---

### 4. 数据库连接失败

**错误信息:**
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**原因:** 数据库未启动或密码错误

**解决方案:**
```bash
# 检查数据库容器状态
docker-compose ps db

# 查看数据库日志
docker-compose logs db

# 检查数据库是否就绪
docker-compose exec db pg_isready

# 重启数据库
docker-compose restart db
```

---

### 5. 权限错误

**错误信息:**
```
Permission denied: './uploads'
```

**原因:** 目录权限不足

**解决方案:**
```bash
# 修复目录权限
chmod 755 uploads outputs

# 或创建缺失的目录
mkdir -p uploads outputs
chmod 755 uploads outputs
```

---

### 6. 构建失败

**错误信息:**
```
failed to solve: executor failed running [/bin/sh -c ...]
```

**原因:** Dockerfile 语法错误或依赖问题

**解决方案:**
```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache

# 查看构建日志
docker-compose build
```

---

### 7. Python 依赖安装失败

**错误信息:**
```
ERROR: Could not find a version that satisfies the requirement xxx
```

**原因:** 依赖版本冲突或网络问题

**解决方案:**
```bash
# 检查 requirements.txt
cat backend/requirements.txt

# 更新 pip
docker-compose exec backend pip install --upgrade pip

# 使用国内镜像源
docker-compose exec backend pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
```

---

### 8. 健康检查失败

**错误信息:**
```
Backend container exited with code 1
```

**原因:** 应用启动失败

**解决方案:**
```bash
# 查看后端日志
docker-compose logs backend

# 检查环境变量
docker-compose exec backend env | grep DATABASE

# 手动测试启动
docker-compose run backend python -c "from app.config import settings; print(settings.database_url)"
```

---

## 诊断命令

### 快速诊断

```bash
# 运行诊断脚本
./diagnose.sh

# 查看所有容器状态
docker-compose ps -a

# 查看资源使用
docker stats

# 查看磁盘空间
df -h
```

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
docker-compose logs redis

# 实时查看日志
docker-compose logs -f backend

# 查看最后 100 行
docker-compose logs --tail=100 backend
```

### 容器操作

```bash
# 进入容器
docker-compose exec backend bash
docker-compose exec db psql -U app_db_user ai_creative_hub

# 重启服务
docker-compose restart backend
docker-compose restart

# 停止服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器和卷
docker-compose down -v
```

---

## 环境配置检查清单

- [ ] `.docker.env` 文件存在
- [ ] `.env` 文件存在
- [ ] POSTGRES_USER 已设置
- [ ] POSTGRES_PASSWORD 已设置
- [ ] POSTGRES_DB 已设置
- [ ] REDIS_PASSWORD 已设置
- [ ] SECRET_KEY 已设置
- [ ] DATABASE_URL 格式正确
- [ ] REDIS_URL 格式正确
- [ ] 端口 8000, 3000, 5432, 6379 可用

---

## 完全重置

如果遇到无法解决的问题，可以完全重置：

```bash
# 1. 停止所有服务
docker-compose down -v

# 2. 删除所有容器
docker container prune -f

# 3. 删除所有镜像
docker image prune -a -f

# 4. 删除所有卷
docker volume prune -f

# 5. 重新部署
./quick-deploy.sh
```

---

## 获取帮助

如果以上方法都无法解决问题：

1. 查看完整文档
   - `DEPLOYMENT_GUIDE.md` - 完整部署指南
   - `SECURE_DEPLOYMENT_GUIDE.md` - 安全部署指南

2. 运行诊断工具
   ```bash
   ./diagnose.sh > diagnose-report.txt 2>&1
   ```

3. 收集日志
   ```bash
   docker-compose logs > logs.txt 2>&1
   ```

4. 提供以下信息：
   - 操作系统版本
   - Docker 版本
   - 错误信息
   - diagnose-report.txt 内容
   - logs.txt 内容

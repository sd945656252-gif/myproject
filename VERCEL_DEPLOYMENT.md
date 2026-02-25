# Vercel 部署指南

## 🚀 将 AI Creative Hub 部署到 Vercel

本指南将帮助你将前端项目部署到 Vercel，创建一个永久在线的网页端。

---

## 方式一：通过 Vercel Dashboard 部署（推荐）

### 步骤 1：准备 GitHub 仓库

确保你的项目已推送到 GitHub：
```
https://github.com/sd945656252-gif/myproject
```

### 步骤 2：创建 Vercel 账户

1. 访问 https://vercel.com/signup
2. 使用 GitHub 账户登录
3. 免费账户足够个人使用

### 步骤 3：导入项目

1. 访问 Vercel Dashboard: https://vercel.com/dashboard
2. 点击 "Add New" → "Project"
3. 点击 "Import Git Repository"
4. 选择 `myproject` 仓库
5. 点击 "Import"

### 步骤 4：配置项目

**Import Project for Production**

- **Project Name**: `ai-creative-hub`
- **Framework Preset**: `Next.js`
- **Root Directory**: `frontend` (重要！)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 步骤 5：配置环境变量

在 "Environment Variables" 部分添加：

```
NEXT_PUBLIC_API_URL=https://ai-creative-hub-backend.vercel.app
NEXT_PUBLIC_APP_NAME=AI Creative Hub
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 步骤 6：部署

1. 点击 "Deploy"
2. 等待构建完成（约 2-5 分钟）
3. 部署成功后会显示访问地址

### 步骤 7：访问

访问: https://ai-creative-hub.vercel.app

---

## 方式二：使用 Vercel CLI

### 步骤 1：安装 Vercel CLI

```bash
npm install -g vercel
```

### 步骤 2：登录

```bash
vercel login
```

选择使用 GitHub 登录。

### 步骤 3：部署前端

```bash
cd /workspace/projects/ai-creative-hub/frontend
vercel --prod
```

按照提示完成部署。

---

## 方式三：使用提供的脚本

### 方法 A：构建并提示手动部署

```bash
cd /workspace/projects/ai-creative-hub
./deploy-vercel-build.sh
```

这会构建项目并提供详细的部署说明。

### 方法 B：自动部署脚本

```bash
cd /workspace/projects/ai-creative-hub
./deploy-vercel.sh
```

**注意**: 此脚本需要你先配置 Vercel Token 和项目信息。

---

## 配置文件说明

### frontend/vercel.json

已创建的 Vercel 配置文件包含：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["hkg1", "sin1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://ai-creative-hub-backend.vercel.app"
  }
}
```

**配置说明**:
- `regions`: 部署到香港和新加坡节点，降低延迟
- `env`: 默认环境变量

---

## 前端部署状态

### ✅ 已完成
- 前端代码完整
- Next.js 配置正确
- Vercel 配置文件已创建
- 部署脚本已准备

### ⚠️ 需要完成
- 通过 Vercel Dashboard 或 CLI 完成部署
- 配置环境变量
- 验证部署成功

---

## 后端部署说明

前端部署后，后端需要单独部署：

### 选项 1：部署到 Railway / Render / Fly.io

推荐平台：
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Fly.io**: https://fly.io

### 选项 2：使用 Docker + 云服务

- AWS ECS
- Google Cloud Run
- Azure Container Instances

### 选项 3：暂时使用本地后端

前端可以暂时连接到本地运行的后端进行测试。

---

## 部署后配置

### 1. 更新前端 API 地址

如果后端地址不是 `https://ai-creative-hub-backend.vercel.app`，需要：

1. 在 Vercel Dashboard 打开项目
2. 进入 Settings → Environment Variables
3. 更新 `NEXT_PUBLIC_API_URL`
4. 重新部署

### 2. 配置自定义域名（可选）

1. 在 Vercel Dashboard 打开项目
2. 进入 Settings → Domains
3. 添加自定义域名
4. 配置 DNS 记录

### 3. 启用自动部署（可选）

已通过 GitHub 连接，每次推送到 main 分支会自动部署。

---

## 故障排除

### 问题 1：构建失败

**检查**:
1. `frontend/package.json` 中的依赖是否正确
2. Node.js 版本是否符合要求（建议 18+）
3. 查看构建日志中的错误信息

**解决**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 问题 2：部署后页面空白

**检查**:
1. 浏览器控制台是否有错误
2. API 地址是否正确
3. 环境变量是否配置

**解决**:
检查 Vercel Dashboard 中的环境变量配置。

### 问题 3：API 请求失败

**检查**:
1. 后端是否已部署
2. CORS 配置是否正确
3. API 地址是否正确

**解决**:
确保后端已部署且 CORS 允许 Vercel 域名。

---

## 监控和日志

### 查看部署日志

1. 访问 Vercel Dashboard
2. 打开项目
3. 点击 "Deployments"
4. 选择部署版本查看日志

### 查看实时日志

```bash
vercel logs
```

---

## 性能优化

### 已配置的优化

1. **区域部署**: 香港和新加坡节点
2. **自动 CDN**: Vercel Edge Network
3. **图片优化**: Next.js Image 组件
4. **代码分割**: 自动按路由分割

### 额外优化建议

1. 启用 Vercel Analytics
2. 配置缓存策略
3. 优化图片大小
4. 使用 WebP 格式

---

## 成本说明

### Vercel 免费额度

- **Hobby 计划**: 免费永久使用
- **带宽**: 100GB/月
- **构建时间**: 6000分钟/月
- **Serverless Function**: 100GB小时/月

### 超出限制

如果超出免费额度，可以选择：
1. 升级到 Pro 计划 ($20/月)
2. 优化应用减少资源使用
3. 使用其他部署平台

---

## 下一步

1. **完成前端部署**: 按照方式一完成部署
2. **部署后端**: 选择合适的后端部署方案
3. **测试功能**: 验证前后端连接正常
4. **配置域名**: 可选，配置自定义域名

---

## 相关文档

- [Vercel 官方文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [QUICK_START.md](QUICK_START.md) - 快速开始
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - 完整部署指南

---

## 快速参考

### Vercel Dashboard
https://vercel.com/dashboard

### 项目配置
- 项目名称: ai-creative-hub
- Root Directory: frontend
- 框架: Next.js

### 环境变量
```
NEXT_PUBLIC_API_URL=https://ai-creative-hub-backend.vercel.app
NEXT_PUBLIC_APP_NAME=AI Creative Hub
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 预期访问地址
https://ai-creative-hub.vercel.app

---

**需要帮助？** 查看 Vercel 文档或提交 Issue。

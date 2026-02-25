# AI Creative Hub - GitHub 上传指南

## 📤 将项目上传到 GitHub

项目已配置好 Git 仓库，以下是上传到 GitHub 的方法。

---

## 方法一：交互式脚本（推荐）

### 步骤 1：获取 GitHub Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 设置 token 名称（如：AI Creative Hub）
4. 选择权限：
   - ✅ `repo` (完整的仓库访问权限)
   - ✅ `workflow` (如果需要 GitHub Actions)
5. 点击 "Generate token"
6. **重要**：复制生成的 token（只显示一次）

### 步骤 2：运行上传脚本

```bash
cd /workspace/projects/ai-creative-hub
./push-to-github.sh
```

脚本会提示：
- 检查 Git 状态
- 添加所有文件
- 提交更改
- 询问是否现在推送

### 步骤 3：推送时输入认证

如果脚本提示需要认证：
- 用户名：`sd945656252-gif`
- 密码：**粘贴你的 Personal Access Token**

---

## 方法二：使用 Token 直接推送（快速）

### 步骤 1：编辑脚本

编辑 `push-to-github-simple.sh`：

```bash
nano /workspace/projects/ai-creative-hub/push-to-github-simple.sh
```

### 步骤 2：替换 Token

将第一行的 `<YOUR_TOKEN>` 替换为你的实际 token：

```bash
TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 步骤 3：运行脚本

```bash
cd /workspace/projects/ai-creative-hub
./push-to-github-simple.sh
```

---

## 方法三：手动推送（最灵活）

### 步骤 1：初始化仓库

```bash
cd /workspace/projects/ai-creative-hub
git init
```

### 步骤 2：添加远程仓库

```bash
git remote add origin https://github.com/sd945656252-gif/myproject.git
```

### 步骤 3：添加文件

```bash
git add .
```

### 步骤 4：提交

```bash
git commit -m "feat: 初始化 AI Creative Hub 项目"
```

### 步骤 5：推送

```bash
git branch -M main
git push -u origin main
```

如果需要认证，使用 token 作为密码。

---

## 验证上传成功

推送成功后，访问：
🌐 **https://github.com/sd945656252-gif/myproject**

你应该能看到：
- README.md（项目说明）
- backend/（后端代码）
- frontend/（前端代码）
- docker-compose.yml（Docker 配置）
- 其他项目文件

---

## 常见问题

### Q1：推送失败，提示 "Authentication failed"

**解决方案**：
1. 确认使用 Personal Access Token，而不是 GitHub 密码
2. 确认 token 有 `repo` 权限
3. 确认 token 没有过期

### Q2：推送失败，提示 "remote: Repository not found"

**解决方案**：
1. 确认仓库名称正确：`myproject`
2. 确认用户名正确：`sd945656252-gif`
3. 确认你对该仓库有写入权限

### Q3：推送失败，提示 "updates were rejected"

**解决方案**：
远程仓库已有内容，需要强制推送或合并：

```bash
# 方式一：强制推送（会覆盖远程内容）
git push -f origin main

# 方式二：拉取并合并
git pull origin main --allow-unrelated-histories
git push origin main
```

### Q4：上传速度慢或超时

**解决方案**：
1. 检查网络连接
2. 使用 SSH 方式推送（需要配置 SSH 密钥）：
   ```bash
   git remote set-url origin git@github.com:sd945656252-gif/myproject.git
   git push -u origin main
   ```

### Q5：.gitignore 不生效

**解决方案**：
已配置的 `.gitignore` 会忽略：
- `__pycache__/`, `*.pyc` 等 Python 缓存
- `node_modules/` 等 Node 依赖
- `.env`, `.env.local` 等环境变量
- `uploads/`, `outputs/` 等上传输出目录
- `.DS_Store`, `Thumbs.db` 等系统文件

如果之前已提交这些文件，需要先清除：
```bash
git rm -r --cached __pycache__ node_modules
git commit -m "chore: 清理已跟踪的忽略文件"
git push
```

---

## SSH 方式上传（更安全）

### 步骤 1：生成 SSH 密钥

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# 或
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

### 步骤 2：添加到 GitHub

1. 复制公钥：
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
2. 访问 https://github.com/settings/ssh
3. 点击 "New SSH key"
4. 粘贴公钥

### 步骤 3：测试连接

```bash
ssh -T git@github.com
```

### 步骤 4：使用 SSH 推送

```bash
git remote set-url origin git@github.com:sd945656252-gif/myproject.git
git push -u origin main
```

---

## 项目大小检查

上传前可以查看仓库大小：

```bash
du -sh .
```

如果项目过大（>100MB），建议：
1. 使用 `.gitignore` 排除大文件
2. 使用 Git LFS（大文件存储）

---

## 完整上传流程示例

```bash
# 进入项目目录
cd /workspace/projects/ai-creative-hub

# 查看当前状态
git status

# 初始化 Git（如果还没有）
git init

# 添加远程仓库
git remote add origin https://github.com/sd945656252-gif/myproject.git

# 添加所有文件
git add .

# 查看暂存的文件
git status

# 提交
git commit -m "feat: 初始化 AI Creative Hub 项目

- 完成前端 Next.js 应用
- 完成后端 FastAPI 服务
- 配置 Docker 部署
- 完善部署文档

项目状态：就绪部署
版本：v1.0.0"

# 设置主分支
git branch -M main

# 推送
git push -u origin main
```

推送成功后，访问 GitHub 仓库查看！

---

## 📚 相关文档

- [GIT_SETUP.md](GIT_SETUP.md) - Git 仓库配置详细指南
- [QUICK_START.md](QUICK_START.md) - 项目快速开始
- [README.md](README.md) - 项目说明

---

**需要帮助？** 查看以上文档或提交 Issue。

# Git 仓库配置指南

## 方式一：手动上传到 GitHub

### 1. 初始化 Git 仓库

```bash
cd /workspace/projects/ai-creative-hub
git init
```

### 2. 添加远程仓库

```bash
git remote add origin https://github.com/sd945656252-gif/myproject.git
```

### 3. 添加文件到暂存区

```bash
git add .
```

### 4. 提交更改

```bash
git commit -m "feat: 初始化 AI Creative Hub 项目

- 完成前端 Next.js 应用
- 完成后端 FastAPI 服务
- 配置 Docker 部署
- 完善部署文档"
```

### 5. 推送到 GitHub

```bash
git branch -M main
git push -u origin main
```

## 方式二：使用脚本自动推送

创建并运行以下脚本：

```bash
#!/bin/bash

echo "开始设置 Git 仓库..."

# 初始化仓库
git init

# 添加远程仓库
git remote add origin https://github.com/sd945656252-gif/myproject.git

# 添加所有文件
git add .

# 提交
git commit -m "feat: 初始化 AI Creative Hub 项目

- 完成前端 Next.js 应用
- 完成后端 FastAPI 服务
- 配置 Docker 部署
- 完善部署文档"

# 推送到 GitHub
git branch -M main
git push -u origin main

echo "✅ 项目已成功上传到 GitHub！"
```

## 注意事项

### 如果 GitHub 仓库已存在内容

如果目标仓库已经有文件，需要先拉取并合并：

```bash
git pull origin main --allow-unrelated-histories
git push origin main
```

### 如果需要认证

推送时如果需要输入用户名和密码：
- **用户名**: sd945656252-gif
- **密码**: 使用 GitHub Personal Access Token

获取 Personal Access Token：
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择需要的权限（至少需要 `repo` 权限）
4. 生成并复制 token

### 推送时使用 token

```bash
# 方式一：使用 token 作为密码
git push https://<token>@github.com/sd945656252-gif/myproject.git main

# 方式二：配置 Git 凭证存储
git config --global credential.helper store
git push -u origin main
# 输入用户名和 token
```

## 快速一键推送脚本

保存以下内容为 `push-to-github.sh`，然后运行：

```bash
#!/bin/bash

set -e

echo "🚀 开始上传项目到 GitHub..."

# 检查是否在项目目录
if [ ! -f "README.md" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 初始化 Git
echo "📝 初始化 Git 仓库..."
git init

# 添加远程仓库
echo "🔗 添加远程仓库..."
git remote add origin https://github.com/sd945656252-gif/myproject.git

# 添加所有文件
echo "📦 添加文件..."
git add .

# 提交
echo "✍️ 提交更改..."
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
echo "📤 推送到 GitHub..."
echo ""
echo "请输入 GitHub Personal Access Token:"
echo "获取地址：https://github.com/settings/tokens"
echo ""

# 提示用户手动推送（避免在脚本中输入 token）
echo ""
echo "请手动执行以下命令完成推送："
echo ""
echo "git push -u origin main"
echo ""
echo "如果需要认证，输入 token 作为密码"
echo ""

# 或者尝试推送
read -p "是否现在推送？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push -u origin main
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ 项目已成功上传到 GitHub！"
        echo "🌐 访问地址：https://github.com/sd945656252-gif/myproject"
    else
        echo ""
        echo "❌ 推送失败，请手动执行："
        echo "git push -u origin main"
    fi
fi
```

运行脚本：
```bash
chmod +x push-to-github.sh
./push-to-github.sh
```

## 验证上传成功

推送成功后，访问：
https://github.com/sd945656252-gif/myproject

应该能看到项目文件和 README.md。

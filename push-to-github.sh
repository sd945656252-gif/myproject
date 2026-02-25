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
if [ -d ".git" ]; then
    echo "⚠️ Git 仓库已存在，跳过初始化"
else
    git init
fi

# 添加远程仓库
echo "🔗 添加远程仓库..."
if git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️ 远程仓库已存在，更新 URL"
    git remote set-url origin https://github.com/sd945656252-gif/myproject.git
else
    git remote add origin https://github.com/sd945656252-gif/myproject.git
fi

# 添加所有文件
echo "📦 添加文件..."
git add .

# 提交
echo "✍️ 提交更改..."
if git diff --cached --quiet; then
    echo "⚠️ 没有需要提交的更改"
else
    git commit -m "feat: 初始化 AI Creative Hub 项目

- 完成前端 Next.js 应用
- 完成后端 FastAPI 服务
- 配置 Docker 部署
- 完善部署文档

项目状态：就绪部署
版本：v1.0.0"
fi

# 设置主分支
git branch -M main

# 推送
echo "📤 推送到 GitHub..."
echo ""
echo "请输入 GitHub Personal Access Token:"
echo "获取地址：https://github.com/settings/tokens"
echo ""
echo "提示：如果推送失败，请手动执行以下命令："
echo "git push -u origin main"
echo ""

# 尝试推送
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
        echo "❌ 推送失败，可能需要认证"
        echo ""
        echo "请尝试以下方法："
        echo "1. 获取 Personal Access Token: https://github.com/settings/tokens"
        echo "2. 使用 token 推送: git push https://<token>@github.com/sd945656252-gif/myproject.git main"
        echo ""
    fi
else
    echo ""
    echo "跳过自动推送。稍后可手动执行："
    echo "git push -u origin main"
    echo ""
fi

#!/bin/bash

# Vercel 部署脚本
# 将前端项目部署到 Vercel

set -e

echo "🚀 开始部署 AI Creative Hub 到 Vercel..."
echo ""

# 检查是否安装 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm install -g vercel
fi

# 进入前端目录
cd frontend

# 设置 Vercel Token
# export VERCEL_TOKEN="your_vercel_token_here"
if [ -z "$VERCEL_TOKEN" ]; then
    echo "请设置 VERCEL_TOKEN 环境变量"
    echo "export VERCEL_TOKEN=your_token_here"
    exit 1
fi
export VERCEL_ORG_ID=""
export VERCEL_PROJECT_ID=""

echo ""
echo "📝 部署配置："
echo "- 项目名称: ai-creative-hub"
echo "- 区域: 香港 (hkg1), 新加坡 (sin1)"
echo "- 框架: Next.js"
echo ""

# 部署到 Vercel
echo "📤 正在部署..."
echo ""

vercel --token "$VERCEL_TOKEN" --yes \
  --prod \
  --name "ai-creative-hub" \
  --regions hkg1,sin1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 部署成功！"
    echo ""
    echo "🌐 访问地址: https://ai-creative-hub.vercel.app"
    echo ""
else
    echo ""
    echo "❌ 部署失败"
    echo ""
    exit 1
fi

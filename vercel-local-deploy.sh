#!/bin/bash

# Vercel 本地部署脚本
# 在你的本地机器上运行此脚本

set -e

echo "============================================"
echo "  AI Creative Hub - Vercel 部署脚本"
echo "============================================"
echo ""

# 检查是否安装 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm install -g vercel
fi

# 检查是否已登录
echo "🔐 检查登录状态..."
if ! vercel whoami &> /dev/null; then
    echo ""
    echo "请先登录 Vercel："
    vercel login
fi

# 设置 Token（可选，如果已登录可跳过）
# 在运行脚本前设置环境变量:
# export VERCEL_TOKEN="your_token_here"
if [ -z "$VERCEL_TOKEN" ]; then
    echo "未设置 VERCEL_TOKEN 环境变量"
    echo "将使用已登录的账户进行部署"
    VERCEL_TOKEN=""
fi

echo ""
echo "📂 进入前端目录..."
cd frontend

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 构建
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo ""
echo "✅ 构建成功"
echo ""

# 部署
echo "📤 开始部署到 Vercel..."
echo ""

vercel --token "$VERCEL_TOKEN" --prod --name "ai-creative-hub" --regions hkg1,sin1

if [ $? -eq 0 ]; then
    echo ""
    echo "============================================"
    echo "  🎉 部署成功！"
    echo "============================================"
    echo ""
    echo "🌐 访问地址: https://ai-creative-hub.vercel.app"
    echo "📊 Vercel Dashboard: https://vercel.com/dashboard"
    echo ""
else
    echo ""
    echo "❌ 部署失败"
    echo ""
    echo "请检查："
    echo "1. 是否正确登录 Vercel"
    echo "2. Token 是否有效"
    echo "3. 网络连接是否正常"
    echo ""
    exit 1
fi

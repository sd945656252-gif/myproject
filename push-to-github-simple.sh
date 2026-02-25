#!/bin/bash

# 一键上传到 GitHub 脚本
# 使用方法：将 <YOUR_TOKEN> 替换为你的 GitHub Personal Access Token

TOKEN="<YOUR_TOKEN>"
REPO="https://github.com/sd945656252-gif/myproject.git"

echo "🚀 开始上传项目到 GitHub..."

# 初始化 Git
git init

# 添加远程仓库
git remote add origin "$REPO"

# 添加所有文件
git add .

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
echo "📤 推送到 GitHub..."
git push https://${TOKEN}@github.com/sd945656252-gif/myproject.git main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 项目已成功上传到 GitHub！"
    echo "🌐 访问地址：https://github.com/sd945656252-gif/myproject"
else
    echo ""
    echo "❌ 推送失败"
    echo "请检查："
    echo "1. 是否正确替换了 TOKEN"
    echo "2. TOKEN 是否有 repo 权限"
    echo "3. 仓库地址是否正确"
fi

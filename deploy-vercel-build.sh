# 使用 Vercel API 直接部署
# 不需要交互式确认

set -e

# 从环境变量获取 Token，或提示用户输入
if [ -z "$VERCEL_TOKEN" ]; then
    echo "请设置 VERCEL_TOKEN 环境变量"
    echo "export VERCEL_TOKEN=your_token_here"
    exit 1
fi
PROJECT_NAME="ai-creative-hub"

echo "🚀 开始部署 AI Creative Hub 前端到 Vercel..."
echo ""

# 进入前端目录
cd frontend

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo ""
echo "✅ 构建成功"
echo ""
echo "📝 部署说明："
echo ""
echo "由于 Vercel 需要配置项目和获取 Project ID，请手动完成以下步骤："
echo ""
echo "1. 访问 Vercel Dashboard: https://vercel.com/dashboard"
echo "2. 创建新项目"
echo "3. 连接 GitHub 仓库: https://github.com/sd945656252-gif/myproject"
echo "4. 选择 Root Directory: frontend"
echo "5. 配置环境变量："
echo "   - NEXT_PUBLIC_API_URL: https://ai-creative-hub-backend.vercel.app"
echo "   - NEXT_PUBLIC_APP_NAME: AI Creative Hub"
echo "   - NEXT_PUBLIC_APP_VERSION: 1.0.0"
echo "6. 点击 Deploy"
echo ""
echo "或者使用 Vercel CLI："
echo ""
echo "  cd frontend"
echo "  vercel login"
echo "  vercel --prod"
echo ""
echo "🌐 部署成功后访问: https://ai-creative-hub.vercel.app"
echo ""

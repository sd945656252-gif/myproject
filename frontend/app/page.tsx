export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Creative Hub
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            全能 AI 创作工作站
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                🎨 AI 生图
              </h2>
              <p className="text-gray-600">
                文本生图、图生图、局部重绘
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                🎬 视频生成
              </h2>
              <p className="text-gray-600">
                文本生视频、图像生视频
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                🎵 音乐生成
              </h2>
              <p className="text-gray-600">
                AI 音乐合成、语音合成
              </p>
            </div>
          </div>
          <div className="mt-12">
            <p className="text-gray-500 text-sm">
              前端部署成功 | Powered by Next.js
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

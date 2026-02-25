import Link from 'next/link'

export default function WorkflowPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">一键工作流</h1>
        <p className="text-muted-foreground mt-2">
          从故事构思到成片的六步完整创作流程
        </p>
      </div>

      {/* Workflow Steps Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { step: 1, title: '故事起稿', desc: '一句话转三幕剧大纲' },
          { step: 2, title: '分段脚本', desc: '拆解分镜、旁白、画面描述' },
          { step: 3, title: '创作配置', desc: '推荐尺寸/画风/帧率及最优模型匹配' },
          { step: 4, title: '角色设定', desc: '生成参考图与三视图保持一致性' },
          { step: 5, title: '分镜生成', desc: '批量图转视频或直接生视频' },
          { step: 6, title: '剪辑建议', desc: '生成拼接顺序、转场及配乐提示' },
        ].map((item) => (
          <Link
            key={item.step}
            href={`/workflow/step${item.step}`}
            className="p-6 bg-card rounded-lg border hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Start Button */}
      <div className="flex justify-center pt-8">
        <Link
          href="/workflow/step1"
          className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-lg font-medium"
        >
          开始创作 →
        </Link>
      </div>
    </div>
  )
}

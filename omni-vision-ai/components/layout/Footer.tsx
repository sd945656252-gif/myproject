export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Omni-Vision AI - 全能视觉创作引擎
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>支持多种 AI API</span>
          <span>|</span>
          <span>混合模式运行</span>
          <span>|</span>
          <span>一键工作流</span>
        </div>
      </div>
    </footer>
  );
}

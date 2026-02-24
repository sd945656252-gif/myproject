'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Image,
  Video,
  Wand2,
  Settings,
  Home,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/helpers';

const navItems = [
  { href: '/', label: '首页', icon: Home, description: '功能概览' },
  { href: '/prompt', label: '提示词工程', icon: Sparkles, description: '图片反推/优化' },
  { href: '/image', label: '图像生成', icon: Image, description: '文生图/图生图' },
  { href: '/video', label: '视频生成', icon: Video, description: '文生视频/图生视频' },
  { href: '/workflow', label: '一键工作流', icon: Wand2, description: '全流程创作' },
  { href: '/settings', label: '设置', icon: Settings, description: 'API配置' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-b hover:bg-muted transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                    collapsed && 'justify-center'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.label}</div>
                      <div className="text-xs opacity-70 truncate">{item.description}</div>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground text-center">
            Omni-Vision AI v1.0
          </div>
        </div>
      )}
    </aside>
  );
}

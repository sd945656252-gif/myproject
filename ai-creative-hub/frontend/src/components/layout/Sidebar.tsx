"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Image,
  Video,
  Workflow,
  Music,
  Mic,
  Settings,
  LogOut,
  User,
  Menu,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUserStore, useApiConfigStore } from "@/stores";
import { useState } from "react";

const navItems = [
  {
    title: "提示词专家",
    href: "/prompt",
    icon: Sparkles,
    description: "图像反推、提示词优化",
  },
  {
    title: "生图矩阵",
    href: "/image",
    icon: Image,
    description: "文生图、图生图、智能编辑",
  },
  {
    title: "生视频矩阵",
    href: "/video",
    icon: Video,
    description: "文/图生视频、风格转绘",
  },
  {
    title: "一键工作流",
    href: "/workflow",
    icon: Workflow,
    description: "从故事到成片",
  },
  {
    title: "音乐生成",
    href: "/music",
    icon: Music,
    description: "AI 音乐与音效",
  },
  {
    title: "语音合成",
    href: "/voice",
    icon: Mic,
    description: "TTS 与语音克隆",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useUserStore();
  const { configs } = useApiConfigStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasActiveConfig = configs.some((c) => c.isActive);

  const NavContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold">AI Creative Hub</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <div className="flex flex-col">
                <span>{item.title}</span>
                <span
                  className={cn(
                    "text-xs",
                    isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}
                >
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}

        {/* API 设置入口 */}
        <div className="pt-4 border-t mt-4">
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/settings"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Key className="h-5 w-5" />
            <div className="flex flex-col">
              <span>API 设置</span>
              <span
                className={cn(
                  "text-xs",
                  pathname === "/settings" ? "text-primary-foreground/70" : "text-muted-foreground"
                )}
              >
                配置 API 接口密钥
              </span>
            </div>
            {!hasActiveConfig && (
              <span className="ml-auto flex h-2 w-2 rounded-full bg-orange-500" />
            )}
            {hasActiveConfig && (
              <span className="ml-auto flex h-2 w-2 rounded-full bg-green-500" />
            )}
          </Link>
        </div>
      </nav>

      <div className="border-t p-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                个人中心
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  API 设置
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="space-y-2">
            <Link href="/settings" className="block">
              <Button variant="outline" className="w-full gap-2">
                <Key className="h-4 w-4" />
                API 设置
                {!hasActiveConfig && (
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                )}
              </Button>
            </Link>
            <Link href="/login">
              <Button className="w-full">登录</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-64 flex-shrink-0 border-r bg-background lg:block">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <NavContent />
        </SheetContent>
      </Sheet>
    </>
  );
}

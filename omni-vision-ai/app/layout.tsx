import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header, Sidebar, Footer } from "@/components/layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Omni-Vision AI - 全能视觉创作引擎",
  description: "集成提示词工程、图像生成、视频生成、一键工作流的完整 AI 视觉创作解决方案",
  keywords: ["AI", "图像生成", "视频生成", "提示词工程", "Midjourney", "Sora", "即梦", "可灵"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}

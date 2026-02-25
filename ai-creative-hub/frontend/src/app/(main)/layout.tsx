"use client";

import { Sidebar } from "@/components/layout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="container mx-auto h-full max-w-7xl p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

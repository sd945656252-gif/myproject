export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <div className="container mx-auto px-4 py-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}

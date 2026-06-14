import AdminNav from '@/components/admin/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      <AdminNav />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = () => {
    sessionStorage.removeItem('nondevhub-user')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <h1 className="text-2xl font-bold tracking-tight">ProjectNonDevHub — Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-950/50 hover:bg-rose-900 text-rose-200 text-sm rounded-lg border border-rose-500/30 transition-all cursor-pointer"
          >
            ออกจากระบบ
          </button>
        </div>
        <div className="p-6 bg-zinc-900/60 border border-white/10 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-zinc-300">ยินดีต้อนรับเข้าสู่ระบบจัดการข้อมูล Enterprise (ProjectNonDevHub)</p>
        </div>
      </div>
    </div>
  )
}
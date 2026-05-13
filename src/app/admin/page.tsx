// src/app/admin/page.tsx
import { getAdminStats, getArchivedDrops, getTodayDrop } from '@/lib/supabase'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [stats, recentDrops, liveDrops] = await Promise.all([
    getAdminStats(),
    getArchivedDrops(0, 8),
    getTodayDrop(),
  ])

  return <AdminDashboard stats={stats} recentDrops={recentDrops} liveDrop={liveDrops} />
}

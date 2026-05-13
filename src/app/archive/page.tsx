// src/app/archive/page.tsx
import { getArchivedDrops } from '@/lib/supabase'
import { ArchiveGrid } from '@/components/archive/ArchiveGrid'

export const revalidate = 300

export default async function ArchivePage() {
  const drops = await getArchivedDrops(0, 24)

  return (
    <div className="min-h-screen pt-24 px-12 pb-24 bg-black">
      {/* Header */}
      <div className="flex items-end justify-between mb-16 pt-8" style={{ borderTop: '1px solid #2a2a2a' }}>
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px bg-white/30" />
            <span className="font-mono text-[0.65rem] tracking-widest uppercase text-white/40">The Archive</span>
          </div>
          <h1 className="font-display text-[clamp(3.5rem,7vw,8rem)] leading-[0.92] tracking-wide">
            RETIRED<br />FOREVER
          </h1>
        </div>
        <div className="text-right">
          <span className="font-mono text-[0.6rem] tracking-widest uppercase text-white/30 block mb-2">Designs retired</span>
          <span className="font-display text-[3.5rem] text-white leading-none">{String(drops.length).padStart(3, '0')}</span>
        </div>
      </div>

      <ArchiveGrid drops={drops} />
    </div>
  )
}

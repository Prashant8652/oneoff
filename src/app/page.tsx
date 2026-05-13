// src/app/page.tsx
import { Hero } from '@/components/layout/Hero'
import { Ticker } from '@/components/ui/Ticker'
import { DropPreview } from '@/components/drop/DropPreview'
import { ArchivePreview } from '@/components/archive/ArchivePreview'
import { OwnersRoll } from '@/components/drop/OwnersRoll'
import { Manifesto } from '@/components/layout/Manifesto'
import { getTodayDrop, getArchivedDrops, getAllOwners } from '@/lib/supabase'

export const revalidate = 60 // Revalidate every minute

const TICKER_ITEMS = [
  'ONE DESIGN •',
  'ONE OWNER •',
  'FOREVER RETIRED •',
  'DROP LIVE NOW •',
  'NEVER REPRINTED •',
  'PERMANENT ARCHIVE •',
]

export default async function HomePage() {
  const [todayDrop, archivedDrops, owners] = await Promise.all([
    getTodayDrop(),
    getArchivedDrops(0, 6),
    getAllOwners(6),
  ])

  return (
    <div className="bg-black">
      {/* Hero */}
      <Hero dropNumber={todayDrop?.drop_number ?? 1} />

      {/* Ticker */}
      <Ticker items={TICKER_ITEMS} />

      {/* Today's drop preview */}
      {todayDrop && (
        <section className="px-12 py-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-8 h-px bg-white/30" />
            <span className="font-mono text-[0.65rem] tracking-widest uppercase text-white/40">Today's Drop</span>
          </div>
          <DropPreview drop={todayDrop} />
        </section>
      )}

      {/* Archive preview */}
      {archivedDrops.length > 0 && (
        <ArchivePreview drops={archivedDrops} />
      )}

      {/* Owners */}
      {owners.length > 0 && (
        <OwnersRoll owners={owners} />
      )}

      {/* Manifesto */}
      <Manifesto />
    </div>
  )
}

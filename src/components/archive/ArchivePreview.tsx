import Link from 'next/link'
import { ArchiveGrid } from './ArchiveGrid'

export function ArchivePreview({ drops }: { drops: any[] }) {
  return (
    <section className="px-12 py-24 border-t border-[#2a2a2a]">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="font-display text-[clamp(3rem,5vw,5.5rem)] leading-none">
            RETIRED<br />FOREVER
          </h2>
        </div>
        <Link href="/archive" className="font-mono text-[0.65rem] tracking-widest uppercase text-white/40 hover:text-white underline underline-offset-4 transition-colors">
          View All Drops
        </Link>
      </div>
      <ArchiveGrid drops={drops.slice(0, 6)} />
    </section>
  )
}

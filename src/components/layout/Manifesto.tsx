// src/components/layout/Manifesto.tsx
'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export function Manifesto() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-40 px-12 border-t border-[#2a2a2a] text-center">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-[clamp(2.5rem,5.5vw,6rem)] leading-[0.95] max-w-4xl mx-auto mb-10 tracking-wide"
      >
        Fashion was never meant{' '}
        <em className="not-italic font-body font-light text-[0.75em] opacity-60">
          to be repeated.
        </em>{' '}
        We made sure of that.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 0.3 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="font-mono text-[0.7rem] tracking-widest uppercase"
      >
        ONE/OFF — Est. 2023 — Mumbai, India
      </motion.p>
    </section>
  )
}

// src/components/drop/OwnersRoll.tsx
'use client'
import { motion } from 'framer-motion'
import { formatDropNumber, generateInitials } from '@/lib/utils'

interface OwnersRollProps {
  owners: any[]
}

export function OwnersRoll({ owners }: OwnersRollProps) {
  return (
    <section className="px-12 py-24 border-t border-[#2a2a2a]">
      <div className="grid grid-cols-2 gap-24 items-start">
        {/* Left: heading */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px bg-white/30" />
            <span className="font-mono text-[0.65rem] tracking-widest uppercase text-white/40">Hall of Owners</span>
          </div>
          <h2 className="font-display text-[clamp(2.5rem,4vw,4.5rem)] leading-[0.95] mb-6">
            ONE<br />SHIRT.<br />ONE<br />SOUL.
          </h2>
          <p className="text-base font-light text-white/40 leading-relaxed max-w-xs">
            Every owner is memorialized here forever. You don't just buy a shirt — you enter the archive.
          </p>
        </div>

        {/* Right: owner list */}
        <div>
          {owners.map((owner, i) => (
            <motion.div
              key={owner.id}
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-5 py-5 border-b border-[#1a1a1a] first:border-t hover:bg-[#050505] transition-colors px-2"
            >
              {/* Rank */}
              <span className="font-display text-[2rem] text-white/15 min-w-[2.5rem] leading-none">{i + 1}</span>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full border border-[#2a2a2a] bg-[#111] flex items-center justify-center font-mono text-[0.6rem] text-white/50 flex-shrink-0">
                {generateInitials(owner.user?.username ?? 'XX')}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[0.95rem] font-medium truncate">@{owner.user?.username}</p>
                <p className="font-mono text-[0.6rem] tracking-widest uppercase text-white/35 mt-0.5 truncate">
                  {owner.drop?.name} — Drop #{owner.drop?.drop_number ? formatDropNumber(owner.drop.drop_number) : '—'}
                </p>
              </div>

              {/* Serial */}
              <span className="font-mono text-[0.6rem] text-white/20 flex-shrink-0 hidden lg:block">
                {owner.serial_number}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// src/components/drop/DropPreview.tsx
import Link from 'next/link'
import { formatPrice, formatDropNumber } from '@/lib/utils'

export function DropPreview({ drop }: { drop: any }) {
  return (
    <div className="grid grid-cols-2 border border-[#2a2a2a]">
      {/* Image */}
      <div className="bg-[#050505] aspect-square flex items-center justify-center border-r border-[#2a2a2a]">
        <div className="font-display text-[8rem] text-white/[0.04] leading-none">
          {formatDropNumber(drop.drop_number)}
        </div>
      </div>
      {/* Info */}
      <div className="p-12 flex flex-col justify-between">
        <div>
          <p className="font-mono text-[0.65rem] tracking-widest uppercase text-white/35 mb-3">Issue № {formatDropNumber(drop.drop_number)}</p>
          <h2 className="font-display text-[3.5rem] leading-none mb-4">{drop.name}</h2>
          <p className="text-[0.95rem] font-light text-white/45 leading-relaxed max-w-xs">{drop.story}</p>
        </div>
        <div>
          <div className="flex items-baseline gap-4 mb-6">
            <span className="font-display text-[2.5rem]">{formatPrice(drop.price / 100)}</span>
            <span className="font-mono text-[0.6rem] uppercase tracking-widest text-white/30">One owner only</span>
          </div>
          <Link
            href="/drop"
            className="inline-block font-mono text-[0.75rem] tracking-widest uppercase bg-white text-black px-10 py-4 hover:bg-black hover:text-white border border-white transition-all duration-300"
          >
            {drop.status === 'sold' ? 'View Drop' : 'Claim Now'}
          </Link>
        </div>
      </div>
    </div>
  )
}

// src/components/archive/ArchivePreview.tsx
import Link from 'next/link'
import { ArchiveGrid } from './ArchiveGrid'

export function ArchivePreview({ drops }: { drops: any[] }) {
  return (
    <section className="px-12 py-24 border-t border-[#2a2a2a]">
      <div className="flex items-end justify-between mb-12">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px bg-white/30" />
            <span className="font-mono text-[0.65rem] tracking-widest uppercase text-white/40">The Archive</span>
          </div>
          <h2 className="font-display text-[clamp(3rem,5vw,5.5rem)] leading-none">RETIRED<br />FOREVER</h2>
        </div>
        <Link
          href="/archive"
          className="font-mono text-[0.65rem] tracking-widest uppercase text-white/40 hover:text-white underline underline-offset-4 transition-colors"
        >
          View All Drops
        </Link>
      </div>
      <ArchiveGrid drops={drops.slice(0, 6)} />
    </section>
  )
}

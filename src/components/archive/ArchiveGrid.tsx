'use client'
// src/components/archive/ArchiveGrid.tsx
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatDropNumber, formatDropDate } from '@/lib/utils'

interface ArchiveGridProps {
  drops: any[]
}

export function ArchiveGrid({ drops }: ArchiveGridProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div
      className="grid grid-cols-3 gap-px"
      style={{ background: '#2a2a2a' }}
    >
      {drops.map((drop, i) => (
        <Link key={drop.slug} href={`/archive/${drop.slug}`}>
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setHovered(drop.slug)}
            onMouseLeave={() => setHovered(null)}
            className="relative bg-black overflow-hidden cursor-pointer group"
            style={{ aspectRatio: '3/4' }}
          >
            {/* Image / placeholder */}
            <div className="absolute inset-0 bg-[#0a0a0a] overflow-hidden">
              {drop.design_image_url ? (
                <Image
                  src={drop.design_image_url}
                  alt={drop.name}
                  fill
                  className="object-cover grayscale transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display text-[5rem] text-white/[0.04] leading-none">
                    {formatDropNumber(drop.drop_number)}
                  </span>
                </div>
              )}
            </div>

            {/* SOLD badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="font-mono text-[0.55rem] tracking-widest uppercase bg-white text-black px-2 py-1">
                SOLD
              </span>
            </div>

            {/* Drop number */}
            <div className="absolute top-4 left-4 z-10">
              <span className="font-display text-[2.5rem] text-white/[0.08] leading-none">
                {formatDropNumber(drop.drop_number)}
              </span>
            </div>

            {/* Hover overlay */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={hovered === drop.slug ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20 flex flex-col justify-end p-6"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 60%)' }}
            >
              <h3 className="font-display text-[1.8rem] leading-none mb-1">{drop.name}</h3>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[0.6rem] tracking-widest uppercase text-white/40">
                  Drop {formatDropNumber(drop.drop_number)}
                </span>
                <span className="font-mono text-[0.6rem] text-white/30">·</span>
                <span className="font-mono text-[0.6rem] tracking-widest uppercase text-white/40">
                  {formatDropDate(drop.expires_at)}
                </span>
              </div>
              {drop.owner?.[0]?.user?.username && (
                <p className="font-mono text-[0.55rem] tracking-widest uppercase text-white/25 mt-1">
                  Owner: @{drop.owner[0].user.username}
                </p>
              )}
            </motion.div>
          </motion.article>
        </Link>
      ))}
    </div>
  )
}

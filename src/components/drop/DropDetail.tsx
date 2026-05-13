'use client'
// src/components/drop/DropDetail.tsx
import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Countdown } from './Countdown'
import { ClaimButton } from './ClaimButton'
import { formatPrice, formatDropNumber } from '@/lib/utils'
import type { Drop } from '@/types'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

interface DropDetailProps {
  drop: Drop
  userId?: string | null
}

export function DropDetail({ drop, userId = null }: DropDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const isSold = drop.status === 'sold' || drop.status === 'retired'

  return (
    <div className="min-h-screen pt-24">
      <div className="grid grid-cols-2 min-h-[calc(100vh-6rem)]" style={{ borderTop: '1px solid #2a2a2a' }}>

        {/* ── Left: Image Panel ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative border-r border-[#2a2a2a] bg-[#050505] flex items-center justify-center overflow-hidden"
        >
          {/* Design image */}
          <div className="relative w-full h-full flex items-center justify-center p-16">
            {drop.mockup_image_url ? (
              <Image
                src={drop.mockup_image_url}
                alt={drop.name}
                fill
                className="object-contain grayscale"
                priority
              />
            ) : (
              /* Placeholder t-shirt SVG */
              <svg viewBox="0 0 400 480" width="320" height="384" className="drop-shadow-2xl">
                <path
                  d="M60 120 L0 80 L80 20 L120 60 C140 40 260 40 280 60 L320 20 L400 80 L340 120 L340 460 L60 460 Z"
                  fill="#111"
                  stroke="#2a2a2a"
                  strokeWidth="1"
                />
                <path d="M120 60 Q200 100 280 60" fill="none" stroke="#222" strokeWidth="1.5" />
                <circle cx="200" cy="250" r="80" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
                <circle cx="200" cy="250" r="55" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
                <circle cx="200" cy="250" r="30" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.7" />
                <line x1="200" y1="170" x2="200" y2="330" stroke="#fff" strokeWidth="0.5" opacity="0.4" />
                <line x1="120" y1="250" x2="280" y2="250" stroke="#fff" strokeWidth="0.5" opacity="0.4" />
                <circle cx="200" cy="250" r="4" fill="#fff" opacity="1" />
                <text x="200" y="390" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#333" letterSpacing="6">ONE/OFF</text>
                <text x="200" y="406" textAnchor="middle" fontFamily="monospace" fontSize="6" fill="#2a2a2a" letterSpacing="4">
                  № {formatDropNumber(drop.drop_number)}
                </text>
                <line x1="60" y1="120" x2="60" y2="460" stroke="#1e1e1e" strokeWidth="0.5" />
                <line x1="340" y1="120" x2="340" y2="460" stroke="#1e1e1e" strokeWidth="0.5" />
              </svg>
            )}
          </div>

          {/* Bottom meta */}
          <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black/50 to-transparent">
            <div className="flex gap-6">
              {[drop.material, 'Screen Printed', 'Mumbai, IN'].map(tag => (
                <span key={tag} className="font-mono text-[0.55rem] tracking-widest uppercase text-white/25">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Sold overlay */}
          {isSold && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="border border-white/20 px-8 py-4">
                <p className="font-display text-4xl tracking-widest text-white/30">RETIRED</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Right: Info Panel ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col justify-between p-16"
        >
          {/* Top section */}
          <div>
            {/* Status */}
            <div className="flex gap-6 mb-10">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isSold ? 'bg-white/30' : 'bg-[var(--color-accent)] pulse'}`} />
                <span className="font-mono text-[0.6rem] tracking-widest uppercase text-white/40">
                  {isSold ? 'Sold Out' : 'Live Now'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="font-mono text-[0.6rem] tracking-widest uppercase text-white/40">
                  {isSold ? '0 Available' : '1 Available'}
                </span>
              </div>
            </div>

            {/* Title */}
            <p className="font-mono text-[0.65rem] tracking-widest uppercase text-white/35 mb-3">
              Issue № {formatDropNumber(drop.drop_number)} — {new Date(drop.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="font-display text-[clamp(3rem,5vw,5.5rem)] leading-[0.92] tracking-wide text-white mb-6">
              {drop.name}
            </h1>
            <p className="text-base font-light leading-relaxed text-white/50 max-w-sm mb-10">
              {drop.story}
            </p>

            {/* Size selector */}
            {!isSold && (
              <div className="mb-10">
                <p className="font-mono text-[0.6rem] tracking-widest uppercase text-white/35 mb-3">Select Size</p>
                <div className="flex gap-2 flex-wrap">
                  {drop.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        font-mono text-[0.65rem] tracking-wider px-4 py-2.5 border transition-all duration-200
                        ${selectedSize === size
                          ? 'bg-white text-black border-white'
                          : 'bg-transparent text-white border-[#333] hover:border-white/50'
                        }
                      `}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Countdown */}
            {!isSold && (
              <Countdown expiresAt={drop.expires_at} />
            )}

            {/* Owner info if sold */}
            {isSold && drop.owner && (
              <div className="border border-[#2a2a2a] p-5 mt-4">
                <p className="font-mono text-[0.6rem] tracking-widest uppercase text-white/30 mb-3">Claimed By</p>
                <p className="font-mono text-[0.8rem] text-white/70">@{(drop.owner as any)?.user?.username}</p>
                <p className="font-mono text-[0.65rem] text-white/25 mt-1">{(drop.owner as any)?.serial_number}</p>
              </div>
            )}
          </div>

          {/* Purchase block */}
          <div className="border-t border-[#2a2a2a] pt-8">
            <div className="flex items-end justify-between mb-6">
              <span className="font-display text-[2.5rem] leading-none">{formatPrice(drop.price / 100)}</span>
              <div className="text-right">
                <p className="font-mono text-[0.55rem] tracking-widest uppercase text-white/30">One-time purchase</p>
                <p className="font-mono text-[0.55rem] tracking-widest uppercase text-white/30">Never reprinted</p>
              </div>
            </div>

            <ClaimButton drop={drop} selectedSize={selectedSize} userId={userId} />

            <p className="font-mono text-[0.55rem] tracking-widest uppercase text-white/20 text-center mt-4">
              Serial № will be generated upon purchase
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

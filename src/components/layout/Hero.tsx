'use client'
// src/components/layout/Hero.tsx
import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'

const CONTAINER_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.8 } },
}

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
}

interface HeroProps {
  dropNumber: number
}

export function Hero({ dropNumber }: HeroProps) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <section ref={ref} className="relative h-screen flex flex-col justify-end pb-16 px-12 overflow-hidden bg-black">

      {/* Editorial image — right side */}
      <motion.div
        style={{ y: imageY }}
        className="absolute right-0 top-0 w-[55%] h-full"
      >
        {/* Generative model silhouette */}
        <div className="relative w-full h-full bg-[#060606]">
          <svg
            viewBox="0 0 600 900"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Abstract figure */}
            <rect x="150" y="0" width="300" height="900" fill="#080808" />
            <ellipse cx="300" cy="160" rx="70" ry="80" fill="#121212" />
            <rect x="230" y="230" width="140" height="380" rx="4" fill="#101010" />
            <rect x="220" y="245" width="160" height="200" rx="2" fill="#151515" />

            {/* Drop design on shirt */}
            <circle cx="300" cy="330" r="55" fill="none" stroke="#252525" strokeWidth="0.8" />
            <circle cx="300" cy="330" r="38" fill="none" stroke="#1e1e1e" strokeWidth="0.8" />
            <circle cx="300" cy="330" r="20" fill="none" stroke="#1a1a1a" strokeWidth="0.8" />
            <line x1="300" y1="275" x2="300" y2="385" stroke="#1e1e1e" strokeWidth="0.5" />
            <line x1="245" y1="330" x2="355" y2="330" stroke="#1e1e1e" strokeWidth="0.5" />
            <circle cx="300" cy="330" r="3" fill="#222" />

            {/* Typography on shirt */}
            <text x="300" y="410" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#252525" letterSpacing="5">ONE/OFF</text>
            <text x="300" y="425" textAnchor="middle" fontFamily="monospace" fontSize="6" fill="#1e1e1e" letterSpacing="4">
              № {String(dropNumber).padStart(3, '0')}
            </text>

            {/* Legs */}
            <rect x="245" y="605" width="42" height="290" rx="2" fill="#0e0e0e" />
            <rect x="308" y="605" width="42" height="290" rx="2" fill="#0e0e0e" />

            {/* Arms */}
            <rect x="185" y="240" width="40" height="160" rx="18" fill="#0e0e0e" transform="rotate(-8 205 310)" />
            <rect x="373" y="240" width="40" height="160" rx="18" fill="#0e0e0e" transform="rotate(8 395 310)" />

            {/* Scan lines for editorial texture */}
            <rect width="600" height="900" fill="url(#lines)" opacity="0.015" />
            <defs>
              <pattern id="lines" width="1" height="4" patternUnits="userSpaceOnUse">
                <rect width="1" height="1" fill="#fff" />
              </pattern>
            </defs>
          </svg>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: textY, opacity }}
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-2xl"
      >
        <motion.p variants={ITEM_VARIANTS} className="font-mono text-[0.65rem] tracking-widest uppercase text-white/50 mb-6">
          Drop {String(dropNumber).padStart(3, '0')} — {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} — Limited to 1
        </motion.p>

        <motion.h1 variants={ITEM_VARIANTS} className="font-display text-[clamp(4rem,9vw,9rem)] leading-[0.92] tracking-wide text-white mb-8">
          Tomorrow<br />
          this design<br />
          <em className="not-italic font-body font-light text-[0.6em] opacity-90">disappears forever.</em>
        </motion.h1>

        <motion.p variants={ITEM_VARIANTS} className="font-body text-base font-light leading-relaxed text-white/50 max-w-sm mb-10">
          One design. One owner. One day. When it's gone, it's gone — permanently sealed in the archive.
        </motion.p>

        <motion.div variants={ITEM_VARIANTS} className="flex items-center gap-8">
          <Link
            href="/drop"
            className="font-mono text-[0.75rem] tracking-widest uppercase bg-white text-black px-10 py-4 hover:bg-transparent hover:text-white border border-white transition-all duration-300"
          >
            Claim Today's Drop
          </Link>
          <Link
            href="/archive"
            className="font-mono text-[0.7rem] tracking-widest uppercase text-white/40 hover:text-white/80 underline underline-offset-4 transition-colors"
          >
            View Archive
          </Link>
        </motion.div>
      </motion.div>

      {/* Drop number watermark */}
      <motion.div
        style={{ opacity }}
        className="absolute right-12 bottom-16 z-10 text-right"
      >
        <span className="font-mono text-[0.6rem] tracking-widest uppercase text-white/30 block mb-1">Current Drop</span>
        <span className="font-display text-[6rem] text-white/[0.07] leading-none">
          {String(dropNumber).padStart(3, '0')}
        </span>
      </motion.div>

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none z-20" />
    </section>
  )
}

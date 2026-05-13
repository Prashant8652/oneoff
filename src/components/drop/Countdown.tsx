'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useCountdown } from '@/hooks/useCountdown'

interface CountdownProps {
  expiresAt: string
}

function CountdownDigit({ value }: { value: string }) {
  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="block font-display text-[3.5rem] leading-none"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

export function Countdown({ expiresAt }: CountdownProps) {
  const { hours, minutes, seconds, total } = useCountdown(expiresAt)

  if (total === 0) {
    return (
      <p className="font-mono text-[0.65rem] tracking-widest uppercase text-white/50">
        Design Retired — Gone Forever
      </p>
    )
  }

  const pad = (n: number) => String(n).padStart(2, '0')
  const h = pad(hours)
  const m = pad(minutes)
  const s = pad(seconds)

  return (
    <div>
      <p className="font-mono text-[0.6rem] tracking-widest uppercase opacity-35 mb-4">
        Design Retires In
      </p>
      <div className="flex items-end gap-2">
        <div className="text-center">
          <div className="flex">
            <CountdownDigit value={h[0]} />
            <CountdownDigit value={h[1]} />
          </div>
          <span className="font-mono text-[0.55rem] tracking-widest uppercase opacity-35 block mt-1">Hrs</span>
        </div>
        <span className="font-display text-[3.5rem] opacity-20 leading-none pb-1">:</span>
        <div className="text-center">
          <div className="flex">
            <CountdownDigit value={m[0]} />
            <CountdownDigit value={m[1]} />
          </div>
          <span className="font-mono text-[0.55rem] tracking-widest uppercase opacity-35 block mt-1">Min</span>
        </div>
        <span className="font-display text-[3.5rem] opacity-20 leading-none pb-1">:</span>
        <div className="text-center">
          <div className="flex">
            <CountdownDigit value={s[0]} />
            <CountdownDigit value={s[1]} />
          </div>
          <span className="font-mono text-[0.55rem] tracking-widest uppercase opacity-35 block mt-1">Sec</span>
        </div>
      </div>
    </div>
  )
}

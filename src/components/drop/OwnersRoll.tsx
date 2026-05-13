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
              <span className="font-display text-[2rem] text-white/15 min-w-[2.5rem] leading-none">{i + 1}</span>
              <div className="w-10 h-10 rounded-full border border-[#2a2a2a] bg-[#111] flex items-center justify-center font-mono text-[0.6rem] text-white/50 flex-shrink-0">
                {generateInitials(owner.user?.username ?? 'XX')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.95rem] font-medium truncate">@{owner.user?.username}</p>
                <p className="font-mono text-[0.6rem] tracking-widest uppercase text-white/35 mt-0.5 truncate">
                  {owner.drop?.name} — Drop #{owner.drop?.drop_number ? formatDropNumber(owner.drop.drop_number) : '—'}
                </p>
              </div>
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

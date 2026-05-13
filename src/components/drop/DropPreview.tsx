import Link from 'next/link'
import { formatPrice, formatDropNumber } from '@/lib/utils'

export function DropPreview({ drop }: { drop: any }) {
  return (
    <div className="grid grid-cols-2 border border-[#2a2a2a]">
      <div className="bg-[#050505] aspect-square flex items-center justify-center border-r border-[#2a2a2a]">
        <div className="font-display text-[8rem] text-white/[0.04] leading-none">
          {formatDropNumber(drop.drop_number)}
        </div>
      </div>
      <div className="p-12 flex flex-col justify-between">
        <div>
          <p className="font-mono text-[0.65rem] tracking-widest uppercase text-white/35 mb-3">
            Issue № {formatDropNumber(drop.drop_number)}
          </p>
          <h2 className="font-display text-[3.5rem] leading-none mb-4">{drop.name}</h2>
          <p className="text-[0.95rem] font-light text-white/45 leading-relaxed max-w-xs">{drop.story}</p>
        </div>
        <div>
          <div className="flex items-baseline gap-4 mb-6">
            <span className="font-display text-[2.5rem]">{formatPrice(drop.price / 100)}</span>
            <span className="font-mono text-[0.6rem] uppercase tracking-widest text-white/30">One owner only</span>
          </div>
          <Link href="/drop" className="inline-block font-mono text-[0.75rem] tracking-widest uppercase bg-white text-black px-10 py-4 hover:bg-black hover:text-white border border-white transition-all duration-300">
            {drop.status === 'sold' ? 'View Drop' : 'Claim Now'}
          </Link>
        </div>
      </div>
    </div>
  )
}

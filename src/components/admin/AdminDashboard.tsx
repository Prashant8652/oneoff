'use client'
// src/components/admin/AdminDashboard.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatPrice, formatDropNumber } from '@/lib/utils'
import type { Drop } from '@/types'

interface AdminDashboardProps {
  stats: {
    totalDrops: number
    totalRevenue: number
    totalOwners: number
    liveDrops: number
    soldDrops: number
  }
  recentDrops: any[]
  liveDrop: Drop | null
}

const STAT_CARDS = (stats: AdminDashboardProps['stats']) => [
  { label: 'Total Drops', value: String(stats.totalDrops).padStart(3, '0'), icon: '◈' },
  { label: 'Revenue', value: formatPrice(stats.totalRevenue / 100), icon: '₹' },
  { label: 'Archive Size', value: String(stats.soldDrops).padStart(3, '0'), icon: '∞' },
  { label: 'Active Drop', value: stats.liveDrops > 0 ? 'Live' : 'None', icon: '⬟' },
]

export function AdminDashboard({ stats, recentDrops, liveDrop }: AdminDashboardProps) {
  const [form, setForm] = useState({
    name: '',
    story: '',
    price: '',
    material: '100% Organic Cotton',
    scheduled_at: '',
  })
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setUploading(true)
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      const expiresAt = new Date(tomorrow)
      expiresAt.setHours(23, 59, 59, 0)

      const res = await fetch('/api/drops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Math.round(parseFloat(form.price) * 100),
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          scheduled_at: form.scheduled_at || tomorrow.toISOString(),
          expires_at: expiresAt.toISOString(),
          design_image_url: '',
          mockup_image_url: '',
        }),
      })
      if (res.ok) {
        setSuccess(true)
        setForm({ name: '', story: '', price: '', material: '100% Organic Cotton', scheduled_at: '' })
        setTimeout(() => setSuccess(false), 3000)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 px-12 pb-24 bg-black">
      {/* Header */}
      <div className="pt-8 mb-16" style={{ borderTop: '1px solid #2a2a2a' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-8 h-px bg-white/30" />
          <span className="font-mono text-[0.65rem] tracking-widest uppercase text-white/40">Admin Dashboard</span>
        </div>
        <h1 className="font-display text-[clamp(2.5rem,5vw,6rem)] leading-[0.92] tracking-wide">
          CONTROL<br />CENTER
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-px mb-px" style={{ background: '#2a2a2a' }}>
        {STAT_CARDS(stats).map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-black p-8 hover:bg-[#0a0a0a] transition-colors"
          >
            <div className="font-display text-[3rem] text-white/10 leading-none mb-4">{card.icon}</div>
            <p className="font-mono text-[0.6rem] tracking-widest uppercase text-white/40 mb-2">{card.label}</p>
            <p className="font-display text-[2rem] leading-none">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Live drop status */}
      {liveDrop && (
        <div className="p-8 mb-px" style={{ background: '#0a0a0a', border: '1px solid #2a2a2a', marginTop: '1px' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[0.6rem] tracking-widest uppercase text-[var(--color-accent)] mb-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mr-2 pulse" />
                Currently Live
              </p>
              <h2 className="font-display text-3xl">
                Drop #{formatDropNumber(liveDrop.drop_number)} — {liveDrop.name}
              </h2>
            </div>
            <div className="text-right">
              <p className="font-mono text-[0.55rem] uppercase tracking-widest text-white/30 mb-1">Status</p>
              <p className="font-display text-2xl text-[var(--color-accent)]">
                {liveDrop.status === 'sold' ? 'SOLD' : 'LIVE'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload new drop */}
      <div className="grid grid-cols-2 gap-px mt-px" style={{ background: '#2a2a2a' }}>
        <div className="bg-black p-10">
          <h2 className="font-display text-[2.5rem] leading-[0.92] mb-4">UPLOAD<br />NEXT DROP</h2>
          <p className="text-base font-light text-white/40 leading-relaxed">
            Schedule tomorrow's design. Once uploaded and activated, the drop goes live at midnight and is retired 24 hours later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-black p-10 flex flex-col gap-4">
          {/* Image upload placeholder */}
          <div
            className="border border-dashed border-[#333] p-8 text-center cursor-pointer hover:border-white/30 transition-colors"
            onDragOver={e => e.preventDefault()}
          >
            <p className="font-mono text-[0.65rem] tracking-widest uppercase text-white/30">
              Drop Design Image Here
            </p>
            <p className="font-mono text-[0.5rem] uppercase tracking-widest text-white/15 mt-1">
              PNG / JPG — Max 20MB
            </p>
          </div>

          <input
            required
            type="text"
            placeholder="Drop Name (e.g. MERIDIAN ZERO)"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="bg-black border border-[#2a2a2a] text-white font-mono text-[0.7rem] tracking-wider px-4 py-3 focus:border-white/40 outline-none transition-colors placeholder:text-white/25"
          />
          <textarea
            required
            placeholder="Design Story..."
            value={form.story}
            onChange={e => setForm(p => ({ ...p, story: e.target.value }))}
            rows={3}
            className="bg-black border border-[#2a2a2a] text-white font-mono text-[0.7rem] tracking-wider px-4 py-3 focus:border-white/40 outline-none transition-colors resize-none placeholder:text-white/25"
          />
          <input
            required
            type="number"
            placeholder="Price (₹)"
            value={form.price}
            onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
            className="bg-black border border-[#2a2a2a] text-white font-mono text-[0.7rem] tracking-wider px-4 py-3 focus:border-white/40 outline-none transition-colors placeholder:text-white/25"
          />
          <input
            type="datetime-local"
            placeholder="Schedule Date/Time"
            value={form.scheduled_at}
            onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))}
            className="bg-black border border-[#2a2a2a] text-white font-mono text-[0.7rem] tracking-wider px-4 py-3 focus:border-white/40 outline-none transition-colors"
          />

          <button
            type="submit"
            disabled={uploading}
            className="font-mono text-[0.7rem] tracking-widest uppercase bg-white text-black py-4 hover:bg-black hover:text-white border border-white transition-all duration-300 disabled:opacity-40"
          >
            {uploading ? 'Scheduling...' : success ? '✓ Drop Scheduled' : `Schedule Drop #${String(stats.totalDrops + 1).padStart(3, '0')}`}
          </button>
        </form>
      </div>

      {/* Recent drops table */}
      <div className="mt-px" style={{ border: '1px solid #2a2a2a', borderTop: 'none' }}>
        <div className="p-8 border-b border-[#2a2a2a]">
          <h3 className="font-display text-2xl">RECENT DROPS</h3>
        </div>
        <div>
          {recentDrops.map((drop, i) => (
            <div
              key={drop.slug}
              className="flex items-center justify-between px-8 py-5 border-b border-[#1a1a1a] hover:bg-[#050505] transition-colors"
            >
              <div className="flex items-center gap-6">
                <span className="font-display text-2xl text-white/20">
                  {formatDropNumber(drop.drop_number)}
                </span>
                <div>
                  <p className="font-mono text-[0.75rem] tracking-wider">{drop.name}</p>
                  <p className="font-mono text-[0.55rem] uppercase tracking-widest text-white/30 mt-0.5">
                    {new Date(drop.expires_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <span className="font-mono text-[0.6rem] tracking-widest uppercase bg-white text-black px-3 py-1">
                  {drop.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

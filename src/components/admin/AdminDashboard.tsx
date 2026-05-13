'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatPrice, formatDropNumber } from '@/lib/utils'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AdminDashboardProps {
  stats: {
    totalDrops: number
    totalRevenue: number
    totalOwners: number
    liveDrops: number
    soldDrops: number
  }
  recentDrops: any[]
  liveDrop: any | null
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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File must be under 20MB')
      return
    }
    setImageFile(file)
    setError('')
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!imageFile) { setError('Please select a design image'); return }
    if (!form.name || !form.story || !form.price) { setError('Please fill all fields'); return }

    setUploading(true)
    setError('')

    try {
      // 1. Upload image to Supabase Storage
      setUploadProgress('Uploading image...')
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `drop-${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('drops')
        .upload(fileName, imageFile, { cacheControl: '3600', upsert: false })

      if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)

      // 2. Get public URL
      const { data: urlData } = supabase.storage.from('drops').getPublicUrl(fileName)
      const imageUrl = urlData.publicUrl
      setUploadProgress('Scheduling drop...')

      // 3. Create drop via API
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      const expiresAt = new Date(tomorrow)
      expiresAt.setHours(23, 59, 59, 0)

      const res = await fetch('/api/drops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.toUpperCase(),
          story: form.story,
          price: Math.round(parseFloat(form.price) * 100),
          material: form.material,
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          design_image_url: imageUrl,
          mockup_image_url: imageUrl,
          scheduled_at: form.scheduled_at || tomorrow.toISOString(),
          expires_at: expiresAt.toISOString(),
        }),
      })

      const result = await res.json()
      if (result.error) throw new Error(result.error)

      setSuccess(true)
      setForm({ name: '', story: '', price: '', material: '100% Organic Cotton', scheduled_at: '' })
      setImageFile(null)
      setImagePreview(null)
      setUploadProgress('')
      setTimeout(() => setSuccess(false), 4000)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
      setUploadProgress('')
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
              <p className="font-mono text-[0.6rem] tracking-widest uppercase text-[#4eff91] mb-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4eff91] mr-2" />
                Currently Live
              </p>
              <h2 className="font-display text-3xl">
                Drop #{formatDropNumber(liveDrop.drop_number)} — {liveDrop.name}
              </h2>
            </div>
            <div className="text-right">
              <p className="font-mono text-[0.55rem] uppercase tracking-widest text-white/30 mb-1">Status</p>
              <p className="font-display text-2xl text-[#4eff91]">
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
          <p className="text-base font-light text-white/40 leading-relaxed mb-6">
            Upload your design image and fill in the details. The drop will go live at the scheduled time and retire automatically after 24 hours.
          </p>
          <div className="space-y-3 text-white/25">
            {['Design image is uploaded to secure storage', 'Serial number auto-generated on purchase', 'Drop retires automatically at midnight', 'Owner permanently recorded in archive'].map(tip => (
              <p key={tip} className="font-mono text-[0.6rem] tracking-widest flex items-center gap-2">
                <span className="text-white/40">—</span> {tip}
              </p>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-black p-10 flex flex-col gap-4">

          {/* Image upload zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => document.getElementById('fileInput')?.click()}
            className="relative cursor-pointer transition-all duration-300"
            style={{
              border: dragOver ? '1px dashed #fff' : imagePreview ? '1px solid #2a2a2a' : '1px dashed #333',
              background: dragOver ? '#0a0a0a' : 'transparent',
            }}
          >
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-contain"
                  style={{ filter: 'grayscale(100%)' }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/70">
                  <p className="font-mono text-[0.65rem] tracking-widest uppercase text-white">Click to Change Image</p>
                </div>
                <div className="absolute top-2 right-2 bg-black/80 px-2 py-1">
                  <p className="font-mono text-[0.55rem] text-[#4eff91] tracking-widest">✓ IMAGE READY</p>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center">
                <div className="font-display text-[3rem] text-white/10 mb-3">↑</div>
                <p className="font-mono text-[0.65rem] tracking-widest uppercase text-white/30">
                  {dragOver ? 'Drop it here' : 'Click or drag image here'}
                </p>
                <p className="font-mono text-[0.5rem] uppercase tracking-widest text-white/15 mt-1">
                  PNG / JPG — Max 20MB
                </p>
              </div>
            )}
          </div>

          <input
            required
            type="text"
            placeholder="Drop Name (e.g. VOID THEORY)"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="bg-black border border-[#2a2a2a] text-white font-mono text-[0.7rem] tracking-wider px-4 py-3 focus:border-white/40 outline-none transition-colors placeholder:text-white/25"
          />

          <textarea
            required
            placeholder="Design Story — what inspired this design?"
            value={form.story}
            onChange={e => setForm(p => ({ ...p, story: e.target.value }))}
            rows={3}
            className="bg-black border border-[#2a2a2a] text-white font-mono text-[0.7rem] tracking-wider px-4 py-3 focus:border-white/40 outline-none transition-colors resize-none placeholder:text-white/25"
          />

          <input
            required
            type="number"
            placeholder="Price in ₹ (e.g. 3999)"
            value={form.price}
            onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
            className="bg-black border border-[#2a2a2a] text-white font-mono text-[0.7rem] tracking-wider px-4 py-3 focus:border-white/40 outline-none transition-colors placeholder:text-white/25"
          />

          <div>
            <p className="font-mono text-[0.55rem] uppercase tracking-widest text-white/30 mb-2">Schedule (leave blank for tomorrow midnight)</p>
            <input
              type="datetime-local"
              value={form.scheduled_at}
              onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))}
              className="w-full bg-black border border-[#2a2a2a] text-white font-mono text-[0.7rem] tracking-wider px-4 py-3 focus:border-white/40 outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="font-mono text-[0.6rem] text-red-400 tracking-wider">{error}</p>
          )}

          {uploadProgress && (
            <p className="font-mono text-[0.6rem] text-white/50 tracking-widest uppercase">{uploadProgress}</p>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="font-mono text-[0.7rem] tracking-widest uppercase py-4 border transition-all duration-300 disabled:opacity-40"
            style={{
              background: success ? '#000' : '#fff',
              color: success ? '#4eff91' : '#000',
              borderColor: success ? '#4eff91' : '#fff',
            }}
          >
            {uploading ? uploadProgress || 'Uploading...' : success ? '✓ DROP SCHEDULED SUCCESSFULLY' : `SCHEDULE DROP #${String(stats.totalDrops + 1).padStart(3, '0')}`}
          </button>
        </form>
      </div>

      {/* Recent drops */}
      <div className="mt-px" style={{ border: '1px solid #2a2a2a', borderTop: 'none' }}>
        <div className="p-8 border-b border-[#2a2a2a]">
          <h3 className="font-display text-2xl">RECENT DROPS</h3>
        </div>
        {recentDrops.length === 0 ? (
          <div className="p-8">
            <p className="font-mono text-[0.65rem] uppercase tracking-widest text-white/25">No drops yet — schedule your first drop above</p>
          </div>
        ) : (
          recentDrops.map((drop) => (
            <div
              key={drop.slug}
              className="flex items-center justify-between px-8 py-5 border-b border-[#1a1a1a] hover:bg-[#050505] transition-colors"
            >
              <div className="flex items-center gap-6">
                <span className="font-display text-2xl text-white/20">{formatDropNumber(drop.drop_number)}</span>
                <div>
                  <p className="font-mono text-[0.75rem] tracking-wider">{drop.name}</p>
                  <p className="font-mono text-[0.55rem] uppercase tracking-widest text-white/30 mt-0.5">
                    {new Date(drop.expires_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              <span className="font-mono text-[0.6rem] tracking-widest uppercase bg-white text-black px-3 py-1">
                {drop.status.toUpperCase()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

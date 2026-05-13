'use client'
// src/app/auth/login/page.tsx
import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createSupabaseClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/drop')
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="font-display text-3xl tracking-widest text-white block mb-12">
          ONE/OFF
        </Link>

        <h1 className="font-display text-[3rem] leading-none mb-2">SIGN IN</h1>
        <p className="font-mono text-[0.65rem] tracking-widest uppercase text-white/35 mb-10">
          Access your archive & drops
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-black border border-[#2a2a2a] text-white font-mono text-[0.75rem] tracking-wider px-5 py-4 focus:border-white/40 outline-none transition-colors placeholder:text-white/20"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-black border border-[#2a2a2a] text-white font-mono text-[0.75rem] tracking-wider px-5 py-4 focus:border-white/40 outline-none transition-colors placeholder:text-white/20"
          />

          {error && (
            <p className="font-mono text-[0.6rem] text-red-400 tracking-wider">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="font-mono text-[0.75rem] tracking-widest uppercase bg-white text-black py-4 mt-2 hover:bg-black hover:text-white border border-white transition-all duration-300 disabled:opacity-40"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="font-mono text-[0.6rem] tracking-widest text-white/30 mt-8 text-center">
          New here?{' '}
          <Link href="/auth/register" className="text-white/60 hover:text-white underline underline-offset-4 transition-colors">
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

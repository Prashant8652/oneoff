'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      setError('Check your email to confirm your account!')
      setLoading(false)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/admin')
    }
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

        <h1 className="font-display text-[3rem] leading-none mb-2">
          {isRegister ? 'CREATE ACCOUNT' : 'SIGN IN'}
        </h1>
        <p className="font-mono text-[0.65rem] tracking-widest uppercase text-white/35 mb-10">
          {isRegister ? 'Join the archive' : 'Access your drops'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <p className="font-mono text-[0.6rem] text-white/60 tracking-wider">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="font-mono text-[0.75rem] tracking-widest uppercase bg-white text-black py-4 mt-2 hover:bg-black hover:text-white border border-white transition-all duration-300 disabled:opacity-40"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => setIsRegister(!isRegister)}
          className="font-mono text-[0.6rem] tracking-widest text-white/30 mt-8 text-center w-full hover:text-white/60 transition-colors"
        >
          {isRegister ? 'Already have an account? Sign in' : "New here? Create account"}
        </button>
      </motion.div>
    </div>
  )
}

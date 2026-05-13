'use client'
// src/components/drop/ClaimButton.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { openRazorpay } from '@/lib/utils'
import { formatPrice, formatDropNumber } from '@/lib/utils'
import type { Drop } from '@/types'

interface ClaimButtonProps {
  drop: Drop
  selectedSize: string | null
  userId: string | null
}

type ClaimState = 'idle' | 'loading' | 'processing' | 'success' | 'error' | 'sold'

export function ClaimButton({ drop, selectedSize, userId }: ClaimButtonProps) {
  const [state, setState] = useState<ClaimState>(drop.status === 'sold' ? 'sold' : 'idle')
  const [serial, setSerial] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isSold = state === 'sold' || drop.status === 'sold'

  async function handleClaim() {
    if (isSold || state !== 'idle') return
    if (!userId) {
      window.location.href = `/auth/login?redirect=/drop`
      return
    }
    if (!selectedSize) {
      setError('Please select a size')
      return
    }

    setState('loading')
    setError(null)

    try {
      // 1. Create Razorpay order
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dropId: drop.id, size: selectedSize }),
      })
      const { orderId, amount, currency, error: orderError } = await res.json()
      if (orderError) throw new Error(orderError)

      setState('processing')

      // 2. Open Razorpay checkout
      await openRazorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount,
        currency,
        name: 'ONE/OFF',
        description: `Drop #${formatDropNumber(drop.drop_number)} — ${drop.name}`,
        order_id: orderId,
        theme: { color: '#ffffff' },
        handler: async ({ razorpay_payment_id, razorpay_order_id, razorpay_signature }) => {
          // 3. Verify payment & generate serial
          const verifyRes = await fetch('/api/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id,
              razorpay_order_id,
              razorpay_signature,
              dropId: drop.id,
              size: selectedSize,
            }),
          })
          const { serialNumber, error: verifyError } = await verifyRes.json()
          if (verifyError) throw new Error(verifyError)
          setSerial(serialNumber)
          setState('success')
        },
       modal: {
  ondismiss: () => {
    setState('idle')
  },
        },
      })
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
      setState('idle')
    }
  }

  if (state === 'success' && serial) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-[var(--color-accent)] p-5"
      >
        <p className="font-mono text-[0.6rem] tracking-widest uppercase text-[var(--color-accent)] mb-2">
          ✓ Drop Claimed — Permanently Yours
        </p>
        <p className="font-mono text-[0.75rem] tracking-widest text-white">{serial}</p>
        <p className="font-mono text-[0.55rem] opacity-40 mt-2 uppercase tracking-widest">
          Certificate of ownership registered in the archive
        </p>
      </motion.div>
    )
  }

  return (
    <div>
      <AnimatePresence>
        {isSold ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full py-5 border border-[#333] flex items-center justify-center gap-4"
          >
            <span className="w-2 h-2 rounded-full bg-white/30" />
            <span className="font-mono text-[0.7rem] tracking-widest uppercase text-white/30">
              Sold — Permanently Retired
            </span>
          </motion.div>
        ) : (
          <motion.button
            onClick={handleClaim}
            disabled={state !== 'idle'}
            whileHover={{ scale: 1 }}
            whileTap={{ scale: 0.98 }}
            className="
              w-full py-5 relative overflow-hidden
              font-mono text-[0.75rem] tracking-widest uppercase
              bg-white text-black border border-white
              transition-all duration-300
              hover:bg-black hover:text-white
              disabled:opacity-50 disabled:cursor-not-allowed
              group
            "
          >
            <span className="relative z-10">
              {state === 'idle' && `Claim Drop #${formatDropNumber(drop.drop_number)} — ${formatPrice(drop.price / 100)}`}
              {state === 'loading' && 'Creating Order...'}
              {state === 'processing' && 'Processing Payment...'}
            </span>
            {(state === 'loading' || state === 'processing') && (
              <motion.div
                className="absolute inset-0 bg-black/10"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-[0.6rem] tracking-wider text-red-400 mt-2 text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

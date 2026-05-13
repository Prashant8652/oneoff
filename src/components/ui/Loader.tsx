'use client'
// src/components/ui/Loader.tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Loader() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const steps = [15, 30, 52, 71, 88, 100]
    let i = 0
    const iv = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i++])
      } else {
        clearInterval(iv)
        setTimeout(() => setVisible(false), 400)
      }
    }, 180)
    return () => clearInterval(iv)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.87, 0, 0.13, 1] }}
          className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-6xl tracking-widest text-white mb-12"
          >
            ONE/OFF
          </motion.div>

          {/* Progress bar */}
          <div className="w-48 h-px bg-white/10 relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-white"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.15 }}
            />
          </div>

          {/* Status text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.3 }}
            className="font-mono text-[0.6rem] tracking-widest uppercase text-white mt-6"
          >
            {progress < 40 ? 'Initializing drop system...' : progress < 80 ? 'Loading design archive...' : 'Almost ready...'}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

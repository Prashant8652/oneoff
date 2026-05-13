'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export function Manifesto() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-40 px-12 border-t border-[#2a2a2a] text-center">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-[clamp(2.5rem,5.5vw,6rem)] leading-[0.95] max-w-4xl mx-auto mb-10 tracking-wide"
      >
        Fashion was never meant{' '}
        <em className="not-italic font-body font-light text-[0.75em] opacity-60">
          to be repeated.
        </em>{' '}
        We made sure of that.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity:

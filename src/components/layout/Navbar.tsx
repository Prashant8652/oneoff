'use client'
// src/components/layout/Navbar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/drop', label: "Today's Drop" },
  { href: '/archive', label: 'Archive' },
  { href: '/owners', label: 'Owners' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-6 mix-blend-difference"
      style={{ mixBlendMode: 'difference' }}
    >
      {/* Logo */}
      <Link href="/" className="font-display text-3xl tracking-widest text-white hover:opacity-70 transition-opacity">
        ONE/OFF
      </Link>

      {/* Links */}
      <ul className="flex gap-10 list-none">
        {NAV_LINKS.map(link => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                'font-mono text-[0.65rem] tracking-widest uppercase text-white transition-opacity hover-underline',
                pathname === link.href ? 'opacity-100' : 'opacity-50 hover:opacity-100'
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Serial / Auth */}
      <div className="flex items-center gap-6">
        <Link
          href="/auth/login"
          className="font-mono text-[0.6rem] tracking-widest uppercase text-white opacity-30 hover:opacity-70 transition-opacity"
        >
          Sign In
        </Link>
      </div>
    </motion.nav>
  )
}

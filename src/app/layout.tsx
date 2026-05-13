// src/app/layout.tsx
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import '../styles/globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Loader } from '@/components/ui/Loader'

export const metadata: Metadata = {
  title: 'ONE/OFF — One Design. One Owner. Forever.',
  description: 'Every day one unique t-shirt is released. Once purchased, the design is permanently retired and never printed again.',
  keywords: ['limited edition', 'fashion', 'collectible', 'streetwear', 'one of a kind'],
  openGraph: {
    title: 'ONE/OFF',
    description: 'Tomorrow this design disappears forever.',
    type: 'website',
    siteName: 'ONE/OFF',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="grain scanlines">
      <body>
        <Loader />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}

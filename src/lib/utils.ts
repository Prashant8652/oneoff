// src/lib/serial.ts
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6)

export function generateSerial(dropNumber: number): string {
  const padded = String(dropNumber).padStart(3, '0')
  const unique = nanoid()
  return `ONE-OFF-${padded}-${unique}`
}

export function parseSerial(serial: string) {
  const parts = serial.split('-')
  if (parts.length !== 4 || parts[0] !== 'ONE' || parts[1] !== 'OFF') {
    return null
  }
  return {
    brand: 'ONE/OFF',
    dropNumber: parseInt(parts[2], 10),
    uniqueCode: parts[3],
    formatted: serial,
  }
}

// src/lib/razorpay.ts
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window === 'undefined') return resolve(false)
    if ((window as any).Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void
  modal?: { ondismiss?: () => void }
}

export async function openRazorpay(options: RazorpayOptions) {
  const loaded = await loadRazorpayScript()
  if (!loaded) throw new Error('Razorpay SDK failed to load')
  const rzp = new (window as any).Razorpay(options)
  rzp.open()
  return rzp
}

// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDropNumber(n: number): string {
  return String(n).padStart(3, '0')
}

export function getCountdown(expiresAt: string) {
  const now = Date.now()
  const end = new Date(expiresAt).getTime()
  const diff = Math.max(0, end - now)
  return {
    total: diff,
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    isExpired: diff === 0,
  }
}

export function timeAgo(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDropDate(date: string): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function generateInitials(name: string): string {
  return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// src/types/index.ts

export interface Drop {
  id: string
  drop_number: number
  name: string
  slug: string
  story: string
  design_image_url: string
  mockup_image_url: string
  price: number
  currency: string
  material: string
  sizes: string[]
  status: 'upcoming' | 'live' | 'sold' | 'retired'
  scheduled_at: string
  expires_at: string
  created_at: string
  owner?: Owner | null
}

export interface Owner {
  id: string
  drop_id: string
  user_id: string
  serial_number: string
  size: string
  purchased_at: string
  user?: {
    username: string
    avatar_url?: string
  }
}

export interface Order {
  id: string
  drop_id: string
  user_id: string
  size: string
  amount: number
  currency: string
  razorpay_order_id: string
  razorpay_payment_id?: string
  status: 'pending' | 'paid' | 'failed'
  serial_number?: string
  created_at: string
}

export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  role: 'user' | 'admin'
  created_at: string
}

export interface ArchiveItem {
  drop_number: number
  name: string
  slug: string
  design_image_url: string
  status: 'sold' | 'retired'
  expires_at: string
  owner?: {
    username: string
    serial_number: string
  }
}

export type DropStatus = 'upcoming' | 'live' | 'sold' | 'retired'

export interface CountdownTime {
  hours: number
  minutes: number
  seconds: number
  total: number
}

export interface SerialNumber {
  formatted: string
  raw: string
  drop_number: number
  timestamp: number
}

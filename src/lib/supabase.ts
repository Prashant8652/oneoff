// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser use
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side admin client (never expose to browser)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Auth helper for Next.js App Router
export const createSupabaseClient = () => createClientComponentClient()

// ─── Drop queries ──────────────────────────────────────────────

export async function getTodayDrop() {
  const now = new Date().toISOString()
  const { data, error } = await supabaseAdmin
    .from('drops')
    .select(`
      *,
      owner:owners(
        id, serial_number, size, purchased_at,
        user:users(username, avatar_url)
      )
    `)
    .eq('status', 'live')
    .lte('scheduled_at', now)
    .gte('expires_at', now)
    .single()
  if (error) return null
  return data
}

export async function getDropBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('drops')
    .select(`
      *,
      owner:owners(
        id, serial_number, size, purchased_at,
        user:users(username, avatar_url)
      )
    `)
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function getArchivedDrops(page = 0, limit = 12) {
  const { data, error } = await supabaseAdmin
    .from('drops')
    .select(`
      drop_number, name, slug, design_image_url, status, expires_at,
      owner:owners(user:users(username), serial_number)
    `)
    .in('status', ['sold', 'retired'])
    .order('drop_number', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)
  if (error) return []
  return data
}

export async function getAllOwners(limit = 20) {
  const { data, error } = await supabaseAdmin
    .from('owners')
    .select(`
      id, serial_number, size, purchased_at,
      user:users(username, avatar_url),
      drop:drops(drop_number, name, slug)
    `)
    .order('purchased_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return data
}

// ─── Admin queries ─────────────────────────────────────────────

export async function getAdminStats() {
  const [dropsRes, ordersRes, ownersRes] = await Promise.all([
    supabaseAdmin.from('drops').select('id, status', { count: 'exact' }),
    supabaseAdmin.from('orders').select('amount', { count: 'exact' }).eq('status', 'paid'),
    supabaseAdmin.from('owners').select('id', { count: 'exact' }),
  ])
  const totalRevenue = ordersRes.data?.reduce((sum, o) => sum + o.amount, 0) ?? 0
  return {
    totalDrops: dropsRes.count ?? 0,
    totalRevenue,
    totalOwners: ownersRes.count ?? 0,
    liveDrops: dropsRes.data?.filter(d => d.status === 'live').length ?? 0,
    soldDrops: dropsRes.data?.filter(d => d.status === 'sold').length ?? 0,
  }
}

export async function createDrop(data: {
  name: string
  story: string
  design_image_url: string
  mockup_image_url: string
  price: number
  material: string
  sizes: string[]
  scheduled_at: string
  expires_at: string
}) {
  // Get next drop number
  const { data: latest } = await supabaseAdmin
    .from('drops')
    .select('drop_number')
    .order('drop_number', { ascending: false })
    .limit(1)
    .single()

  const nextNumber = (latest?.drop_number ?? 0) + 1
  const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const { data: drop, error } = await supabaseAdmin
    .from('drops')
    .insert({
      ...data,
      drop_number: nextNumber,
      slug: `${slug}-${nextNumber}`,
      status: 'upcoming',
      currency: 'INR',
    })
    .select()
    .single()

  if (error) throw error
  return drop
}

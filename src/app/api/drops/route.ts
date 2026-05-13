// src/app/api/drops/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createDrop, supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify admin role
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const drop = await createDrop(body)
    return NextResponse.json(drop)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  const { data } = await supabaseAdmin
    .from('drops')
    .select('*')
    .order('drop_number', { ascending: false })
  return NextResponse.json(data ?? [])
}

// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { supabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const { dropId, size } = await req.json()

    // Validate drop is available
    const { data: drop, error: dropError } = await supabaseAdmin
      .from('drops')
      .select('id, drop_number, name, price, currency, status')
      .eq('id', dropId)
      .eq('status', 'live')
      .single()

    if (dropError || !drop) {
      return NextResponse.json({ error: 'Drop not available' }, { status: 400 })
    }

    // Check not already sold
    const { data: existingOwner } = await supabaseAdmin
      .from('owners')
      .select('id')
      .eq('drop_id', dropId)
      .single()

    if (existingOwner) {
      return NextResponse.json({ error: 'Drop already sold' }, { status: 400 })
    }

    // Get authenticated user
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Razorpay order
    const rpOrder = await razorpay.orders.create({
      amount: drop.price, // already in paise
      currency: drop.currency,
      receipt: `oneoff-${drop.drop_number}-${Date.now()}`,
      notes: { dropId, userId: user.id, size },
    })

    // Save order to DB
    await supabaseAdmin.from('orders').insert({
      drop_id: dropId,
      user_id: user.id,
      size,
      amount: drop.price,
      currency: drop.currency,
      razorpay_order_id: rpOrder.id,
      status: 'pending',
    })

    return NextResponse.json({
      orderId: rpOrder.id,
      amount: drop.price,
      currency: drop.currency,
    })
  } catch (err: any) {
    console.error('Order creation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

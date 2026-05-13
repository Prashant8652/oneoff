import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const { dropId, size } = await req.json()

    const { data: drop } = await supabaseAdmin
      .from('drops')
      .select('id, drop_number, name, price, currency, status')
      .eq('id', dropId)
      .eq('status', 'live')
      .single()

    if (!drop) {
      return NextResponse.json({ error: 'Drop not available' }, { status: 400 })
    }

    const { data: existingOwner } = await supabaseAdmin
      .from('owners')
      .select('id')
      .eq('drop_id', dropId)
      .single()

    if (existingOwner) {
      return NextResponse.json({ error: 'Drop already sold' }, { status: 400 })
    }

    const rpOrder = await razorpay.orders.create({
      amount: drop.price,
      currency: drop.currency,
      receipt: `oneoff-${drop.drop_number}-${Date.now()}`,
      notes: { dropId, size },
    })

    return NextResponse.json({
      orderId: rpOrder.id,
      amount: drop.price,
      currency: drop.currency,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

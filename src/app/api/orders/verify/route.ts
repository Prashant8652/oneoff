// src/app/api/orders/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { generateSerial } from '@/lib/utils'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      dropId,
      size,
    } = await req.json()

    // 1. Verify Razorpay signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // 2. Get authenticated user
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 3. Check drop still available (race condition guard)
    const { data: drop } = await supabaseAdmin
      .from('drops')
      .select('id, drop_number, status')
      .eq('id', dropId)
      .single()

    if (!drop || drop.status === 'sold') {
      return NextResponse.json({ error: 'Drop no longer available' }, { status: 400 })
    }

    // 4. Generate unique serial
    const serialNumber = generateSerial(drop.drop_number)

    // 5. Update order status
    const { data: order } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'paid',
        razorpay_payment_id,
        razorpay_signature,
        serial_number: serialNumber,
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .single()

    if (!order) throw new Error('Order not found')

    // 6. Create owner record (this triggers the mark_drop_sold DB function)
    await supabaseAdmin.from('owners').insert({
      drop_id: dropId,
      user_id: user.id,
      order_id: order.id,
      serial_number: serialNumber,
      size,
    })

    return NextResponse.json({ serialNumber, success: true })
  } catch (err: any) {
    console.error('Payment verification error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

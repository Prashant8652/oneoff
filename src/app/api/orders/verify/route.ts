import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { generateSerial } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      dropId,
      size,
      userId,
    } = await req.json()

    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const { data: drop } = await supabaseAdmin
      .from('drops')
      .select('id, drop_number, status')
      .eq('id', dropId)
      .single()

    if (!drop || drop.status === 'sold') {
      return NextResponse.json({ error: 'Drop no longer available' }, { status: 400 })
    }

    const serialNumber = generateSerial(drop.drop_number)

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

    await supabaseAdmin.from('owners').insert({
      drop_id: dropId,
      user_id: userId,
      order_id: order.id,
      serial_number: serialNumber,
      size,
    })

    return NextResponse.json({ serialNumber, success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

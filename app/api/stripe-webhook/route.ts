import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { emailRideScheduled } from '@/lib/email'
import { sendTelegramMessage } from '@/lib/telegram'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new NextResponse('Invalid signature', { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded' || event.type === 'checkout.session.completed') {
    const supabase = createServiceClient()

    // Get ride_id from metadata
    let rideId: string | undefined
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      rideId = session.metadata?.ride_id
    }

    if (!rideId) return new NextResponse('ok')

    const { data: ride } = await supabase.from('rides').select('*').eq('id', rideId).single()
    if (!ride) return new NextResponse('ok')

    // Update to scheduled
    await supabase
      .from('rides')
      .update({ status: 'scheduled' })
      .eq('id', rideId)

    // Email client
    await emailRideScheduled({
      email: ride.client_email,
      name: ride.client_name,
      pickup: ride.pickup_address,
      dropoff: ride.dropoff_address,
      date: ride.ride_date,
      time: ride.ride_time,
      price: ride.price_usd,      
    })

    // Notify admin via Telegram
    await sendTelegramMessage(
      process.env.TELEGRAM_ADMIN_CHAT_ID!,
      `💰 <b>Payment received!</b>\n\n${ride.client_name} paid $${ride.price_usd} via Stripe.\n📅 ${ride.ride_date} ${ride.ride_time}\n🚗 Ride is now <b>SCHEDULED</b>.`
    )
  }

  return new NextResponse('ok')
}

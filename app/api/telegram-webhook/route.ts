import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendTelegramMessage } from '@/lib/telegram'
import { emailPaymentOptions } from '@/lib/email'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

// This route receives button presses from Telegram inline keyboard
// Set webhook via: https://api.telegram.org/bot{TOKEN}/setWebhook?url={YOUR_URL}/api/telegram-webhook
export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = createServiceClient()

  // Handle callback_query (button press)
  const callback = body.callback_query
  if (!callback) return NextResponse.json({ ok: true })

  const chatId = String(callback.from.id)
  const data: string = callback.data // e.g. "approve:uuid" or "decline:uuid"
  const messageId = callback.message?.message_id

  // Security: only allow admin
  if (chatId !== process.env.TELEGRAM_ADMIN_CHAT_ID) {
    return NextResponse.json({ ok: true })
  }

  const [action, rideId] = data.split(':')

  if (action === 'decline') {
    await supabase.from('rides').update({ status: 'cancelled' }).eq('id', rideId)
    await sendTelegramMessage(chatId, `❌ Ride <code>${rideId.slice(0, 8)}</code> declined.`)
    return NextResponse.json({ ok: true })
  }

  if (action === 'approve') {
    // Fetch ride
    const { data: ride } = await supabase.from('rides').select('*').eq('id', rideId).single()
    if (!ride) {
      await sendTelegramMessage(chatId, '⚠️ Ride not found.')
      return NextResponse.json({ ok: true })
    }

    // Ask for price
    await sendTelegramMessage(
      chatId,
      `💰 Enter the price for <b>${ride.client_name}</b>'s ride:\n\n` +
        `📍 ${ride.pickup_address} → ${ride.dropoff_address}\n` +
        `📅 ${ride.ride_date} ${ride.ride_time}\n\n` +
        `Reply with just the number, e.g. <code>45</code>`,
      {
        force_reply: { force_reply: true, selective: true },
      }
    )

    // Store pending approval state
    await supabase.from('rides').update({ status: 'approved' }).eq('id', rideId)

    // Store rideId in a temp way — we'll use a separate table or cache
    // For simplicity: store in ride as a flag, price will come via /api/approve
    return NextResponse.json({ ok: true })
  }

  // Handle price reply (when you reply to bot with just a number)
  if (body.message?.reply_to_message && body.message?.text) {
    const priceText = body.message.text.trim()
    const price = parseFloat(priceText)

    if (isNaN(price) || price <= 0) {
      await sendTelegramMessage(chatId, '⚠️ Invalid price. Send just a number like <code>45</code>')
      return NextResponse.json({ ok: true })
    }

    // We need to know which ride — look for most recent approved ride without price
    const { data: pendingRides } = await supabase
      .from('rides')
      .select('*')
      .eq('status', 'approved')
      .is('price_usd', null)
      .order('created_at', { ascending: false })
      .limit(1)

    const ride = pendingRides?.[0]
    if (!ride) {
      await sendTelegramMessage(chatId, '⚠️ No pending ride found to set price for.')
      return NextResponse.json({ ok: true })
    }

    let stripeLink: string | undefined

    // Create Stripe payment link if client wants card
    if (ride.payment_method === 'stripe') {
      try {
        // First create a price object
        const priceObj = await stripe.prices.create({
          currency: 'usd',
          unit_amount: Math.round(price * 100),
          product_data: {
            name: `Private Ride — ${ride.ride_date} ${ride.ride_time}`,
            description: `${ride.pickup_address} → ${ride.dropoff_address}`,
          },
        })
        const paymentLink = await stripe.paymentLinks.create({
          line_items: [{ price: priceObj.id, quantity: 1 }],
          metadata: { ride_id: ride.id },
        })
        stripeLink = paymentLink.url
      } catch (err) {
        console.error('Stripe error:', err)
        await sendTelegramMessage(chatId, '⚠️ Stripe link failed. Falling back to Zelle.')
      }
    }

    // Update ride with price
    await supabase
      .from('rides')
      .update({
        price_usd: price,
        stripe_payment_link: stripeLink,
      })
      .eq('id', ride.id)

    // Email client with payment options
    await emailPaymentOptions({
      email: ride.client_email,
      name: ride.client_name,
      pickup: ride.pickup_address,
      dropoff: ride.dropoff_address,
      date: ride.ride_date,
      time: ride.ride_time,
      price,
      paymentMethod: ride.payment_method,
      stripeLink,
      rideId: ride.id,
    })

    await sendTelegramMessage(
      chatId,
      `✅ Approved! $${price} sent to <b>${ride.client_name}</b> (${ride.client_email}).\n` +
        `${ride.payment_method === 'stripe' ? `💳 Stripe link: ${stripeLink}` : `📲 Zelle instructions sent.`}`
    )
  }

  return NextResponse.json({ ok: true })
}
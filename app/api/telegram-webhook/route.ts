import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendTelegramMessage } from '@/lib/telegram'
import { emailPaymentOptions } from '@/lib/email'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = createServiceClient()
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID!

  // ── Inline button press (Approve / Decline) ──
  const callback = body.callback_query
  if (callback) {
    const chatId = String(callback.from.id)
    if (chatId !== adminChatId) return NextResponse.json({ ok: true })

    const [action, rideId] = (callback.data as string).split(':')

    if (action === 'decline') {
      await supabase.from('rides').update({ status: 'cancelled' }).eq('id', rideId)
      await sendTelegramMessage(chatId, `❌ Ride <code>${rideId.slice(0, 8)}</code> declined.`)
      return NextResponse.json({ ok: true })
    }

    if (action === 'approve') {
      const { data: ride } = await supabase.from('rides').select('*').eq('id', rideId).single()
      if (!ride) {
        await sendTelegramMessage(chatId, '⚠️ Ride not found.')
        return NextResponse.json({ ok: true })
      }

      await supabase.from('rides').update({ status: 'approved' }).eq('id', rideId)

      await sendTelegramMessage(
        chatId,
        `✅ Approved <b>${ride.client_name}</b>\n` +
        `📍 ${ride.pickup_address} → ${ride.dropoff_address}\n` +
        `📅 ${ride.ride_date} ${ride.ride_time}\n` +
        `💳 Payment: <b>${ride.payment_method}</b>\n\n` +
        `Now send the price:\n<code>/price ${rideId.slice(0, 8)} 45</code>\n\n` +
        `Replace <code>45</code> with the actual price.`
      )
      return NextResponse.json({ ok: true })
    }
  }

  // ── Text message (commands) ──
  const message = body.message
  if (!message?.text) return NextResponse.json({ ok: true })

  const chatId = String(message.chat.id)
  if (chatId !== adminChatId) return NextResponse.json({ ok: true })

  const text: string = message.text.trim()

  // /price <ride_id_prefix> <amount>
  // Example: /price db00861d 45
  if (text.startsWith('/price')) {
    const parts = text.split(/\s+/)
    if (parts.length < 3) {
      await sendTelegramMessage(chatId, '⚠️ Usage: <code>/price &lt;ride_id&gt; &lt;amount&gt;</code>\nExample: <code>/price db00861d 45</code>')
      return NextResponse.json({ ok: true })
    }

    const ridePrefix = parts[1]
    const price = parseFloat(parts[2])

    if (isNaN(price) || price <= 0) {
      await sendTelegramMessage(chatId, '⚠️ Invalid price. Example: <code>/price db00861d 45</code>')
      return NextResponse.json({ ok: true })
    }

    // Find ride by ID prefix
    const { data: rides } = await supabase
      .from('rides')
      .select('*')
      .ilike('id', `${ridePrefix}%`)
      .eq('status', 'approved')
      .limit(1)

    const ride = rides?.[0]
    if (!ride) {
      await sendTelegramMessage(chatId, `⚠️ No approved ride found with ID starting with <code>${ridePrefix}</code>`)
      return NextResponse.json({ ok: true })
    }

    let stripeLink: string | undefined

    if (ride.payment_method === 'stripe') {
      try {
        const priceObj = await stripe.prices.create({
          currency: 'usd',
          unit_amount: Math.round(price * 100),
          product_data: {
            name: `Private Ride — ${ride.ride_date} ${ride.ride_time}`,
          },
        })
        const paymentLink = await stripe.paymentLinks.create({
          line_items: [{ price: priceObj.id, quantity: 1 }],
          metadata: { ride_id: ride.id },
        })
        stripeLink = paymentLink.url
      } catch (err) {
        console.error('Stripe error:', err)
        await sendTelegramMessage(chatId, '⚠️ Stripe link failed. Sending Zelle instructions instead.')
      }
    }

    await supabase
      .from('rides')
      .update({ price_usd: price, stripe_payment_link: stripeLink ?? null })
      .eq('id', ride.id)

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
      `💰 $${price} sent to <b>${ride.client_name}</b> (${ride.client_email})\n` +
      `${ride.payment_method === 'stripe' ? `💳 Stripe: ${stripeLink}` : `📲 Zelle instructions sent.`}`
    )

    return NextResponse.json({ ok: true })
  }

  // /pending — show all pending rides
  if (text === '/pending') {
    const { data: rides } = await supabase
      .from('rides')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (!rides?.length) {
      await sendTelegramMessage(chatId, '📭 No pending rides.')
      return NextResponse.json({ ok: true })
    }

    for (const ride of rides) {
      await sendTelegramMessage(
        chatId,
        `🚗 <b>${ride.client_name}</b>\n` +
        `📧 ${ride.client_email}\n` +
        `📍 ${ride.pickup_address} → ${ride.dropoff_address}\n` +
        `📅 ${ride.ride_date} ${ride.ride_time}\n` +
        `💳 ${ride.payment_method}\n` +
        `ID: <code>${ride.id.slice(0, 8)}</code>`,
        {
          inline_keyboard: [
            [
              { text: '✅ Approve', callback_data: `approve:${ride.id}` },
              { text: '❌ Decline', callback_data: `decline:${ride.id}` },
            ],
          ],
        }
      )
    }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { emailRideScheduled } from '@/lib/email'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  const { rideId, secret } = await req.json()

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: ride } = await supabase.from('rides').select('*, drivers(name)').eq('id', rideId).single()

  if (!ride) return NextResponse.json({ error: 'Ride not found' }, { status: 404 })

  // Update to scheduled
  await supabase.from('rides').update({ status: 'scheduled' }).eq('id', rideId)

  // Email client confirmation
  await emailRideScheduled({
    email: ride.client_email,
    name: ride.client_name,
    pickup: ride.pickup_address,
    dropoff: ride.dropoff_address,
    date: ride.ride_date,
    time: ride.ride_time,
    price: ride.price_usd,
    driverName: ride.drivers?.name,
  })

  // Notify yourself
  await sendTelegramMessage(
    process.env.TELEGRAM_ADMIN_CHAT_ID!,
    `📲 Zelle confirmed for <b>${ride.client_name}</b> — $${ride.price_usd}. Ride is now <b>SCHEDULED</b>.`
  )

  return NextResponse.json({ success: true })
}

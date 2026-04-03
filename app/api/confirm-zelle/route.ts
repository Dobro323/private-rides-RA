import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { emailRideScheduled } from '@/lib/email'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  try {
    const { rideId, secret } = await req.json()
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = createServiceClient()
    const { data: ride, error: rideError } = await supabase
    .from('rides')
    .select('*')  // убери drivers(name)
    .eq('id', rideId)
    .single()
    
    console.log('ride:', ride, 'error:', rideError)
    if (!ride) return NextResponse.json({ error: 'Ride not found' }, { status: 404 })

    await supabase.from('rides').update({ status: 'scheduled' }).eq('id', rideId)

    await emailRideScheduled({
      email: ride.client_email,
      name: ride.client_name,
      pickup: ride.pickup_address,
      dropoff: ride.dropoff_address,
      date: ride.ride_date,
      time: ride.ride_time,
      price: ride.price_usd,
      driverName: ride.drivers?.name,
      lang: ride.lang,
    })

    await sendTelegramMessage(
      process.env.TELEGRAM_ADMIN_CHAT_ID!,
      `📲 Zelle confirmed for <b>${ride.client_name}</b> — $${ride.price_usd}. Ride is now <b>SCHEDULED</b>.`
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('confirm-zelle error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

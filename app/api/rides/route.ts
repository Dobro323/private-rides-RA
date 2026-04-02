import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { notifyNewRide } from '@/lib/telegram'
import { emailBookingReceived } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      client_name,
      client_email,
      client_phone,
      pickup_address,
      dropoff_address,
      ride_date,
      ride_time,
      passengers,
      payment_method,
      notes,
      lang = 'en',
    } = body

    // Basic validation
    if (!client_name || !client_email || !pickup_address || !dropoff_address || !ride_date || !ride_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Insert into Supabase
    const supabase = createServiceClient()
    const { data: ride, error } = await supabase
      .from('rides')
      .insert({
        client_name,
        client_email,
        client_phone,
        pickup_address,
        dropoff_address,
        ride_date,
        ride_time,
        passengers: parseInt(passengers) || 1,
        payment_method,
        notes,
        lang,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to save booking' }, { status: 500 })
    }

    // Send Telegram notification to admin (you)
    await notifyNewRide({
      id: ride.id,
      client_name,
      client_email,
      client_phone,
      pickup_address,
      dropoff_address,
      ride_date,
      ride_time,
      passengers: parseInt(passengers) || 1,
      notes,
      payment_method,
      lang,
    })

    // Send confirmation email to client
    await emailBookingReceived({
      email: client_email,
      name: client_name,
      pickup: pickup_address,
      dropoff: dropoff_address,
      date: ride_date,
      time: ride_time,
    })

    return NextResponse.json({ success: true, rideId: ride.id })
  } catch (err) {
    console.error('Booking error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

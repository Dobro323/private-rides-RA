const RESEND_API = 'https://api.resend.com/emails'

async function send(to: string, subject: string, html: string) {
  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('Resend error:', err)
  }
}

// Email 1: Booking received (immediately after form submit)
export async function emailBookingReceived(client: {
  email: string
  name: string
  pickup: string
  dropoff: string
  date: string
  time: string
}) {
  await send(
    client.email,
    'Ride Request Received — Private Rides Sacramento',
    `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto;color:#1a1a1a;">
      <h2 style="margin-bottom:8px;">We got your request, ${client.name}!</h2>
      <p style="color:#555;">We'll review and send you a price quote within a few hours.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p><strong>From:</strong> ${client.pickup}</p>
      <p><strong>To:</strong> ${client.dropoff}</p>
      <p><strong>Date:</strong> ${client.date} at ${client.time}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="color:#555;font-size:13px;">
        Your ride is <strong>not confirmed yet</strong>. 
        You'll get another email once we approve and send payment options.
      </p>
      <p style="color:#555;font-size:13px;">Questions? Just reply to this email.</p>
    </div>
    `
  )
}

// Email 2: Approved — here's how to pay
export async function emailPaymentOptions(client: {
  email: string
  name: string
  pickup: string
  dropoff: string
  date: string
  time: string
  price: number
  paymentMethod: 'stripe' | 'zelle'
  stripeLink?: string
  rideId: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const zellePhone = process.env.ZELLE_PHONE
  const zelleName = process.env.ZELLE_NAME

  const paymentBlock =
    client.paymentMethod === 'stripe' && client.stripeLink
      ? `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:24px 0;">
          <p style="margin:0 0 12px;font-weight:600;">Pay by Card (Stripe)</p>
          <a href="${client.stripeLink}" style="background:#16a34a;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">
            Pay $${client.price} now →
          </a>
          <p style="margin:12px 0 0;font-size:12px;color:#666;">Secure payment via Stripe. Your card details are never stored by us.</p>
        </div>
      `
      : `
        <div style="background:#eff6ff;border:1px solid #bfdbfe;padding:20px;border-radius:8px;margin:24px 0;">
          <p style="margin:0 0 8px;font-weight:600;">Pay via Zelle</p>
          <p style="margin:0 0 4px;">Send <strong>$${client.price}</strong> to:</p>
          <p style="margin:0 0 4px;font-size:18px;font-weight:700;">${zellePhone}</p>
          <p style="margin:0 0 12px;color:#555;">${zelleName}</p>
          <p style="font-size:12px;color:#666;margin:0;">
            ⚠️ After sending, your ride will be confirmed within 30 minutes. 
            You'll get a final confirmation email once we verify the payment.
          </p>
        </div>
      `

  await send(
    client.email,
    `✅ Your Ride is Approved — $${client.price} — Private Rides`,
    `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto;color:#1a1a1a;">
      <h2 style="margin-bottom:8px;">Great news, ${client.name}!</h2>
      <p style="color:#555;">Your ride request has been approved. Here are the details:</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p><strong>From:</strong> ${client.pickup}</p>
      <p><strong>To:</strong> ${client.dropoff}</p>
      <p><strong>Date:</strong> ${client.date} at ${client.time}</p>
      <p><strong>Price:</strong> $${client.price}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <h3 style="margin-bottom:4px;">Complete your payment to confirm</h3>
      <p style="color:#555;font-size:14px;">
        Your ride is <strong>not scheduled until payment is confirmed.</strong>
      </p>
      ${paymentBlock}
      <p style="color:#555;font-size:13px;">Questions? Just reply to this email.</p>
    </div>
    `
  )
}

// Email 3: Ride confirmed / scheduled
export async function emailRideScheduled(client: {
  email: string
  name: string
  pickup: string
  dropoff: string
  date: string
  time: string
  price: number
  driverName?: string
}) {
  await send(
    client.email,
    `🚗 Ride Confirmed for ${client.date} — Private Rides`,
    `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto;color:#1a1a1a;">
      <h2 style="margin-bottom:8px;">You're all set, ${client.name}!</h2>
      <p style="color:#555;">Payment received. Your ride is confirmed.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p><strong>📍 From:</strong> ${client.pickup}</p>
      <p><strong>🏁 To:</strong> ${client.dropoff}</p>
      <p><strong>📅 Date:</strong> ${client.date} at ${client.time}</p>
      ${client.driverName ? `<p><strong>🧑 Driver:</strong> ${client.driverName}</p>` : ''}
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="color:#555;font-size:14px;">
        Your driver will arrive at the pickup address at the scheduled time. 
        They will help with any luggage, strollers, or mobility equipment.
      </p>
      <p style="color:#555;font-size:13px;">Need to make a change? Reply to this email as soon as possible.</p>
    </div>
    `
  )
}

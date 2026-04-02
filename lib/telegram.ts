const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function sendTelegramMessage(chatId: string, text: string, replyMarkup?: object) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
  }
  if (replyMarkup) body.reply_markup = replyMarkup

  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Telegram error:', err)
  }
}

export async function notifyNewRide(ride: {
  id: string
  client_name: string
  client_email: string
  client_phone?: string
  pickup_address: string
  dropoff_address: string
  ride_date: string
  ride_time: string
  passengers: number
  notes?: string
  payment_method: string
  lang: string
}) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID!
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  const paymentIcon = ride.payment_method === 'stripe' ? '💳' : '📲'
  const langFlag: Record<string, string> = { en: '🇺🇸', es: '🇲🇽', ru: '🇷🇺', zh: '🇨🇳' }

  const text = `
🚗 <b>New Ride Request</b> ${langFlag[ride.lang] ?? ''}

👤 <b>${ride.client_name}</b>
📧 ${ride.client_email}
${ride.client_phone ? `📱 ${ride.client_phone}` : ''}

📍 <b>From:</b> ${ride.pickup_address}
🏁 <b>To:</b> ${ride.dropoff_address}

📅 ${ride.ride_date} at ${ride.ride_time}
👥 ${ride.passengers} passenger(s)
${paymentIcon} Wants to pay via <b>${ride.payment_method === 'stripe' ? 'Card (Stripe)' : 'Zelle'}</b>

${ride.notes ? `📝 <i>${ride.notes}</i>` : ''}
`.trim()

  await sendTelegramMessage(adminChatId, text, {
    inline_keyboard: [
      [
        { text: '✅ Approve', callback_data: `approve:${ride.id}` },
        { text: '❌ Decline', callback_data: `decline:${ride.id}` },
      ],
      [{ text: '🔗 Open in Admin', url: `${appUrl}/admin` }],
    ],
  })
}

export async function notifyRideApproved(ride: {
  id: string
  client_name: string
  price_usd: number
  ride_date: string
  ride_time: string
}) {
  // Notify yourself after you set a price — confirmation
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID!
  await sendTelegramMessage(
    adminChatId,
    `✅ Ride approved for <b>${ride.client_name}</b> — $${ride.price_usd}. Payment info sent to client.`
  )
}

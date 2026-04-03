import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  const { message } = await req.json()
  if (!message?.trim()) return NextResponse.json({ ok: false })

  await sendTelegramMessage(
    process.env.TELEGRAM_ADMIN_CHAT_ID!,
    `🐛 <b>Bug Report</b>\n\n${message}`
  )

  return NextResponse.json({ ok: true })
}

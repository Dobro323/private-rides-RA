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

const i18n = {
  en: {
    received_subject: 'Ride Request Received — Private Rides Sacramento',
    received_title: (name: string) => `We got your request, ${name}!`,
    received_sub: "We'll review and send you a price quote within a few hours.",
    received_from: 'From',
    received_to: 'To',
    received_date: 'Date',
    received_note: 'Your ride is <strong>not confirmed yet</strong>. You\'ll get another email once we approve and send payment options.',
    received_questions: 'Questions? Just reply to this email.',
    approved_subject: (price: number) => `✅ Your Ride is Approved — $${price} — Private Rides`,
    approved_title: (name: string) => `Great news, ${name}!`,
    approved_sub: 'Your ride request has been approved. Here are the details:',
    approved_from: 'From',
    approved_to: 'To',
    approved_date: 'Date',
    approved_price: 'Price',
    approved_payment_title: 'Complete your payment to confirm',
    approved_payment_note: 'Your ride is <strong>not scheduled until payment is confirmed.</strong>',
    approved_stripe_btn: (price: number) => `Pay $${price} now →`,
    approved_stripe_note: "Secure payment via Stripe. Your card details are never stored by us.",
    approved_zelle_title: 'Pay via Zelle',
    approved_zelle_send: (price: number) => `Send <strong>$${price}</strong> to:`,
    approved_zelle_note: '⚠️ After sending, your ride will be confirmed within 30 minutes. You\'ll get a final confirmation email once we verify the payment.',
    approved_questions: 'Questions? Just reply to this email.',
    scheduled_subject: (date: string) => `🚗 Ride Confirmed for ${date} — Private Rides`,
    scheduled_title: (name: string) => `You're all set, ${name}!`,
    scheduled_sub: 'Payment received. Your ride is confirmed.',
    scheduled_from: 'From',
    scheduled_to: 'To',
    scheduled_date: 'Date',
    scheduled_driver: 'Driver',
    scheduled_note: 'Your driver will arrive at the pickup address at the scheduled time. They will help with any luggage, strollers, or mobility equipment.',
    scheduled_change: 'Need to make a change? Reply to this email as soon as possible.',
  },
  es: {
    received_subject: 'Solicitud de viaje recibida — Private Rides Sacramento',
    received_title: (name: string) => `¡Recibimos tu solicitud, ${name}!`,
    received_sub: 'Revisaremos y te enviaremos un presupuesto en pocas horas.',
    received_from: 'Desde',
    received_to: 'Hasta',
    received_date: 'Fecha',
    received_note: 'Tu viaje <strong>aún no está confirmado</strong>. Recibirás otro email cuando lo aprobemos y enviemos las opciones de pago.',
    received_questions: '¿Preguntas? Responde a este email.',
    approved_subject: (price: number) => `✅ Tu viaje está aprobado — $${price} — Private Rides`,
    approved_title: (name: string) => `¡Buenas noticias, ${name}!`,
    approved_sub: 'Tu solicitud de viaje ha sido aprobada. Aquí están los detalles:',
    approved_from: 'Desde',
    approved_to: 'Hasta',
    approved_date: 'Fecha',
    approved_price: 'Precio',
    approved_payment_title: 'Completa tu pago para confirmar',
    approved_payment_note: 'Tu viaje <strong>no está programado hasta que se confirme el pago.</strong>',
    approved_stripe_btn: (price: number) => `Pagar $${price} ahora →`,
    approved_stripe_note: 'Pago seguro vía Stripe. Tus datos de tarjeta nunca son almacenados por nosotros.',
    approved_zelle_title: 'Pagar vía Zelle',
    approved_zelle_send: (price: number) => `Envía <strong>$${price}</strong> a:`,
    approved_zelle_note: '⚠️ Después de enviar, tu viaje se confirmará en 30 minutos. Recibirás un email de confirmación final una vez que verifiquemos el pago.',
    approved_questions: '¿Preguntas? Responde a este email.',
    scheduled_subject: (date: string) => `🚗 Viaje confirmado para ${date} — Private Rides`,
    scheduled_title: (name: string) => `¡Todo listo, ${name}!`,
    scheduled_sub: 'Pago recibido. Tu viaje está confirmado.',
    scheduled_from: 'Desde',
    scheduled_to: 'Hasta',
    scheduled_date: 'Fecha',
    scheduled_driver: 'Conductor',
    scheduled_note: 'Tu conductor llegará a la dirección de recogida a la hora programada. Te ayudará con el equipaje, carriola o equipo de movilidad.',
    scheduled_change: '¿Necesitas hacer un cambio? Responde a este email lo antes posible.',
  },
  ru: {
    received_subject: 'Заявка на поездку получена — Private Rides Sacramento',
    received_title: (name: string) => `Мы получили вашу заявку, ${name}!`,
    received_sub: 'Мы рассмотрим её и пришлём стоимость в течение нескольких часов.',
    received_from: 'Откуда',
    received_to: 'Куда',
    received_date: 'Дата',
    received_note: 'Ваша поездка <strong>ещё не подтверждена</strong>. Вы получите ещё одно письмо когда мы одобрим и отправим варианты оплаты.',
    received_questions: 'Вопросы? Просто ответьте на это письмо.',
    approved_subject: (price: number) => `✅ Ваша поездка одобрена — $${price} — Private Rides`,
    approved_title: (name: string) => `Отличные новости, ${name}!`,
    approved_sub: 'Ваша заявка одобрена. Вот детали:',
    approved_from: 'Откуда',
    approved_to: 'Куда',
    approved_date: 'Дата',
    approved_price: 'Стоимость',
    approved_payment_title: 'Завершите оплату для подтверждения',
    approved_payment_note: 'Поездка <strong>не будет запланирована до подтверждения оплаты.</strong>',
    approved_stripe_btn: (price: number) => `Оплатить $${price} →`,
    approved_stripe_note: 'Безопасная оплата через Stripe. Данные карты не хранятся нами.',
    approved_zelle_title: 'Оплата через Zelle',
    approved_zelle_send: (price: number) => `Отправьте <strong>$${price}</strong> на:`,
    approved_zelle_note: '⚠️ После отправки поездка будет подтверждена в течение 30 минут. Вы получите финальное письмо как только мы проверим оплату.',
    approved_questions: 'Вопросы? Просто ответьте на это письмо.',
    scheduled_subject: (date: string) => `🚗 Поездка подтверждена на ${date} — Private Rides`,
    scheduled_title: (name: string) => `Всё готово, ${name}!`,
    scheduled_sub: 'Оплата получена. Ваша поездка подтверждена.',
    scheduled_from: 'Откуда',
    scheduled_to: 'Куда',
    scheduled_date: 'Дата',
    scheduled_driver: 'Водитель',
    scheduled_note: 'Водитель прибудет по адресу подачи в назначенное время. Он поможет с багажом, коляской или средствами передвижения.',
    scheduled_change: 'Нужно что-то изменить? Ответьте на это письмо как можно скорее.',
  },
  zh: {
    received_subject: '乘车请求已收到 — Private Rides Sacramento',
    received_title: (name: string) => `我们收到了您的请求，${name}！`,
    received_sub: '我们将在几小时内审核并发送报价。',
    received_from: '出发地',
    received_to: '目的地',
    received_date: '日期',
    received_note: '您的行程<strong>尚未确认</strong>。一旦我们批准并发送付款选项，您将收到另一封邮件。',
    received_questions: '有问题？直接回复此邮件即可。',
    approved_subject: (price: number) => `✅ 您的行程已批准 — $${price} — Private Rides`,
    approved_title: (name: string) => `好消息，${name}！`,
    approved_sub: '您的乘车请求已获批准。以下是详细信息：',
    approved_from: '出发地',
    approved_to: '目的地',
    approved_date: '日期',
    approved_price: '价格',
    approved_payment_title: '完成付款以确认行程',
    approved_payment_note: '在<strong>确认付款之前，您的行程不会被安排。</strong>',
    approved_stripe_btn: (price: number) => `立即支付 $${price} →`,
    approved_stripe_note: '通过 Stripe 安全付款。您的银行卡信息不会被我们存储。',
    approved_zelle_title: '通过 Zelle 付款',
    approved_zelle_send: (price: number) => `发送 <strong>$${price}</strong> 至：`,
    approved_zelle_note: '⚠️ 发送后，您的行程将在30分钟内确认。一旦我们核实付款，您将收到最终确认邮件。',
    approved_questions: '有问题？直接回复此邮件即可。',
    scheduled_subject: (date: string) => `🚗 ${date} 的行程已确认 — Private Rides`,
    scheduled_title: (name: string) => `一切就绪，${name}！`,
    scheduled_sub: '已收到付款。您的行程已确认。',
    scheduled_from: '出发地',
    scheduled_to: '目的地',
    scheduled_date: '日期',
    scheduled_driver: '司机',
    scheduled_note: '司机将在预定时间到达上车地址。他们将协助搬运行李、婴儿车或行动辅助设备。',
    scheduled_change: '需要更改？请尽快回复此邮件。',
  },
}

type Lang = keyof typeof i18n

function getLang(lang?: string): Lang {
  if (lang && lang in i18n) return lang as Lang
  return 'en'
}

export async function emailBookingReceived(client: {
  email: string
  name: string
  pickup: string
  dropoff: string
  date: string
  time: string
  lang?: string
}) {
  const t = i18n[getLang(client.lang)]
  await send(
    client.email,
    t.received_subject,
    `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto;color:#1a1a1a;">
      <h2 style="margin-bottom:8px;">${t.received_title(client.name)}</h2>
      <p style="color:#555;">${t.received_sub}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p><strong>${t.received_from}:</strong> ${client.pickup}</p>
      <p><strong>${t.received_to}:</strong> ${client.dropoff}</p>
      <p><strong>${t.received_date}:</strong> ${client.date} at ${client.time}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="color:#555;font-size:13px;">${t.received_note}</p>
      <p style="color:#555;font-size:13px;">${t.received_questions}</p>
    </div>
    `
  )
}

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
  lang?: string
}) {
  const t = i18n[getLang(client.lang)]
  const zellePhone = process.env.ZELLE_PHONE
  const zelleName = process.env.ZELLE_NAME

  const paymentBlock =
    client.paymentMethod === 'stripe' && client.stripeLink
      ? `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:24px 0;">
          <a href="${client.stripeLink}" style="background:#16a34a;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">
            ${t.approved_stripe_btn(client.price)}
          </a>
          <p style="margin:12px 0 0;font-size:12px;color:#666;">${t.approved_stripe_note}</p>
        </div>
      `
      : `
        <div style="background:#eff6ff;border:1px solid #bfdbfe;padding:20px;border-radius:8px;margin:24px 0;">
          <p style="margin:0 0 8px;font-weight:600;">${t.approved_zelle_title}</p>
          <p style="margin:0 0 4px;">${t.approved_zelle_send(client.price)}</p>
          <p style="margin:0 0 4px;font-size:18px;font-weight:700;">${zellePhone}</p>
          <p style="margin:0 0 12px;color:#555;">${zelleName}</p>
          <p style="font-size:12px;color:#666;margin:0;">${t.approved_zelle_note}</p>
        </div>
      `

  await send(
    client.email,
    t.approved_subject(client.price),
    `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto;color:#1a1a1a;">
      <h2 style="margin-bottom:8px;">${t.approved_title(client.name)}</h2>
      <p style="color:#555;">${t.approved_sub}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p><strong>${t.approved_from}:</strong> ${client.pickup}</p>
      <p><strong>${t.approved_to}:</strong> ${client.dropoff}</p>
      <p><strong>${t.approved_date}:</strong> ${client.date} at ${client.time}</p>
      <p><strong>${t.approved_price}:</strong> $${client.price}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <h3 style="margin-bottom:4px;">${t.approved_payment_title}</h3>
      <p style="color:#555;font-size:14px;">${t.approved_payment_note}</p>
      ${paymentBlock}
      <p style="color:#555;font-size:13px;">${t.approved_questions}</p>
    </div>
    `
  )
}

export async function emailRideScheduled(client: {
  email: string
  name: string
  pickup: string
  dropoff: string
  date: string
  time: string
  price: number
  driverName?: string
  lang?: string
}) {
  const t = i18n[getLang(client.lang)]
  await send(
    client.email,
    t.scheduled_subject(client.date),
    `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto;color:#1a1a1a;">
      <h2 style="margin-bottom:8px;">${t.scheduled_title(client.name)}</h2>
      <p style="color:#555;">${t.scheduled_sub}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p><strong>📍 ${t.scheduled_from}:</strong> ${client.pickup}</p>
      <p><strong>🏁 ${t.scheduled_to}:</strong> ${client.dropoff}</p>
      <p><strong>📅 ${t.scheduled_date}:</strong> ${client.date} at ${client.time}</p>
      ${client.driverName ? `<p><strong>🧑 ${t.scheduled_driver}:</strong> ${client.driverName}</p>` : ''}
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="color:#555;font-size:14px;">${t.scheduled_note}</p>
      <p style="color:#555;font-size:13px;">${t.scheduled_change}</p>
    </div>
    `
  )
}

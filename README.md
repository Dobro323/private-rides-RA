# Private Rides — Setup Guide

## Stack
- **Next.js 14** (App Router) — frontend + API routes
- **Supabase** — database + RLS
- **Telegram Bot** — you receive notifications, approve/decline rides
- **Resend** — emails to clients
- **Stripe** — card payments (auto)
- **Vercel** — hosting (free tier works)

---

## Step 1: Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. Open **SQL Editor** → paste contents of `supabase/migrations/001_initial.sql` → Run
3. Go to **Settings → API** → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2: Telegram Bot

1. Open Telegram → message **@BotFather**
2. `/newbot` → give it a name (e.g. "Private Rides Admin") → get the token
3. Copy token → `TELEGRAM_BOT_TOKEN`
4. Get your personal chat ID:
   - Message **@userinfobot** on Telegram
   - Copy the ID → `TELEGRAM_ADMIN_CHAT_ID`
5. After deploying, register the webhook:
   ```
   https://api.telegram.org/bot{YOUR_TOKEN}/setWebhook?url=https://your-domain.vercel.app/api/telegram-webhook
   ```
   Open this URL in browser — should return `{"ok":true}`

### How the bot flow works:
```
New booking → You get Telegram message with [✅ Approve] [❌ Decline] buttons
  → Tap Approve → Bot asks you to reply with the price (e.g. "45")
  → You reply "45" → System creates Stripe link (if card) or sends Zelle instructions
  → Client gets email with payment info
  → Client pays → Ride becomes SCHEDULED → Client gets confirmation email
  → You get Telegram notification
```

---

## Step 3: Resend (email)

1. Go to [resend.com](https://resend.com) → Sign up (free: 3,000 emails/month)
2. Add your domain or use their sandbox for testing
3. Create API key → `RESEND_API_KEY`
4. Set `RESEND_FROM_EMAIL` to e.g. `rides@yourdomain.com`

> **Testing without a domain**: Use `onboarding@resend.dev` as FROM and your own email as TO temporarily.

---

## Step 4: Stripe

1. Go to [stripe.com](https://stripe.com) → Create account
2. **Settings → API keys**:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
3. **Webhooks** → Add endpoint:
   - URL: `https://your-domain.vercel.app/api/stripe-webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy signing secret → `STRIPE_WEBHOOK_SECRET`

---

## Step 5: Zelle

No API needed. Just set:
- `ZELLE_PHONE` — your Zelle phone number, e.g. `+19165550000`
- `ZELLE_NAME` — your name as it appears on Zelle, e.g. `Rich Alter`

When a client chooses Zelle, they see your number and instructions to send manually.
You confirm payment in the **Admin panel** → click "Confirm Zelle Payment" → client gets scheduled email.

---

## Step 6: Deploy to Vercel

```bash
# Install dependencies
npm install

# Test locally first
cp .env.example .env.local
# Fill in all values in .env.local

npm run dev
# Open http://localhost:3000
```

**Deploy:**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add all environment variables from `.env.example`
4. Deploy → get your URL

After deploy, register Telegram webhook (Step 2, point 5).

---

## Admin Panel

Access at: `https://your-domain.vercel.app/admin?secret=YOUR_ADMIN_SECRET`

Features:
- View all rides filtered by status
- See client info, addresses, payment method
- **Confirm Zelle payments** with one click
- Links back to full ride details

> Bookmark this URL on your phone. You'll use it to confirm Zelle payments.

---

## Adding Future Drivers

When you hire someone:
1. Add them to the `drivers` table in Supabase
2. Assign rides to them via `driver_id` field
3. Their name will appear in client confirmation emails

---

## Status Flow

```
pending → approved → [paid/scheduled] → completed
                   ↘ cancelled
```

| Status | Meaning |
|--------|---------|
| `pending` | Client submitted, waiting for your approval |
| `approved` | You approved + set price, waiting for client payment |
| `paid` | Stripe payment received (auto) |
| `scheduled` | Payment confirmed (Stripe auto or Zelle manual) |
| `completed` | Ride done |
| `cancelled` | Declined or cancelled |

---

## Environment Variables Checklist

```env
NEXT_PUBLIC_SUPABASE_URL=          ✅ from Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=     ✅ from Supabase
SUPABASE_SERVICE_ROLE_KEY=         ✅ from Supabase (secret!)

TELEGRAM_BOT_TOKEN=                ✅ from @BotFather
TELEGRAM_ADMIN_CHAT_ID=            ✅ from @userinfobot

RESEND_API_KEY=                    ✅ from Resend
RESEND_FROM_EMAIL=                 ✅ your sending email

STRIPE_SECRET_KEY=                 ✅ from Stripe
STRIPE_WEBHOOK_SECRET=             ✅ from Stripe webhook
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= ✅ from Stripe

ZELLE_PHONE=                       ✅ your Zelle number
ZELLE_NAME=                        ✅ your name on Zelle

NEXT_PUBLIC_APP_URL=               ✅ https://your-domain.vercel.app
ADMIN_SECRET=                      ✅ any long random string
```

---

## Cost at Zero Scale

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel | 100GB bandwidth | $20/mo |
| Supabase | 500MB DB, 2GB bandwidth | $25/mo |
| Resend | 3,000 emails/mo | $20/mo |
| Telegram | Free forever | — |
| Stripe | 2.9% + 30¢ per transaction | — |
| Zelle | Free | — |

**Total fixed cost at start: $0/month**

'use client'

import { useState } from 'react'

type Ride = {
  id: string
  client_name: string
  client_email: string
  client_phone?: string
  pickup_address: string
  dropoff_address: string
  ride_date: string
  ride_time: string
  passengers: number
  status: string
  price_usd?: number
  payment_method?: string
  notes?: string
  lang: string
  created_at: string
  drivers?: { name: string }
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  approved: '#3b82f6',
  paid: '#8b5cf6',
  scheduled: '#10b981',
  completed: '#6b7280',
  cancelled: '#ef4444',
}

const STATUSES = ['all', 'pending', 'approved', 'paid', 'scheduled', 'completed', 'cancelled']
const LANG_FLAG: Record<string, string> = { en: '🇺🇸', es: '🇲🇽', ru: '🇷🇺', zh: '🇨🇳' }

export default function AdminClient({
  rides,
  secret,
  currentStatus,
}: {
  rides: Ride[]
  secret: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [msg, setMsg] = useState('')

  async function confirmZelle(ride: Ride) {
    setLoading((l) => ({ ...l, [ride.id]: true }))
    const res = await fetch('/api/confirm-zelle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rideId: ride.id, secret }),
    })
    if (res.ok) {
      setMsg(`✅ Zelle confirmed for ${ride.client_name}. Confirmation email sent.`)
      setTimeout(() => location.reload(), 1500)
    } else {
      setMsg('❌ Error confirming Zelle payment.')
    }
    setLoading((l) => ({ ...l, [ride.id]: false }))
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Private Rides — Admin</h1>
        <span style={{ color: '#888', fontSize: 13 }}>{rides.length} rides</span>
      </div>

      {msg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
          {msg}
        </div>
      )}

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {STATUSES.map((s) => (
          <a
            key={s}
            href={`/admin?secret=${secret}&status=${s}`}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
              background: currentStatus === s ? '#1a1a1a' : '#f3f4f6',
              color: currentStatus === s ? '#fff' : '#374151',
            }}
          >
            {s}
          </a>
        ))}
      </div>

      {rides.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#9ca3af' }}>
          No rides with status "{currentStatus}"
        </div>
      )}

      {/* Ride cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rides.map((ride) => (
          <div
            key={ride.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: '20px 24px',
              background: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{ride.client_name}</span>
                  <span style={{ fontSize: 12 }}>{LANG_FLAG[ride.lang] ?? ''}</span>
                  <span
                    style={{
                      background: STATUS_COLORS[ride.status] + '20',
                      color: STATUS_COLORS[ride.status],
                      padding: '2px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    {ride.status}
                  </span>
                </div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>
                  {ride.client_email}
                  {ride.client_phone && ` · ${ride.client_phone}`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {ride.price_usd && (
                  <div style={{ fontWeight: 700, fontSize: 20 }}>${ride.price_usd}</div>
                )}
                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                  {ride.payment_method?.toUpperCase()}
                </div>
              </div>
            </div>

            <div style={{ margin: '16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>From</div>
                <div style={{ fontSize: 14 }}>{ride.pickup_address}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>To</div>
                <div style={{ fontSize: 14 }}>{ride.dropoff_address}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Date & Time</div>
                <div style={{ fontSize: 14 }}>{ride.ride_date} at {ride.ride_time}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Passengers</div>
                <div style={{ fontSize: 14 }}>{ride.passengers}</div>
              </div>
            </div>

            {ride.notes && (
              <div style={{ background: '#fafafa', padding: '10px 14px', borderRadius: 8, fontSize: 13, color: '#555', marginBottom: 12 }}>
                📝 {ride.notes}
              </div>
            )}

            {/* Actions */}
            {ride.status === 'approved' && ride.payment_method === 'zelle' && (
              <button
                onClick={() => confirmZelle(ride)}
                disabled={loading[ride.id]}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                {loading[ride.id] ? 'Confirming...' : '📲 Confirm Zelle Payment'}
              </button>
            )}

            <div style={{ fontSize: 11, color: '#d1d5db', marginTop: 8 }}>
              {new Date(ride.created_at).toLocaleString()} · ID: {ride.id.slice(0, 8)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import { translations, Lang, T } from '@/lib/i18n'

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'es', label: 'ES', flag: '🇲🇽' },
  { code: 'ru', label: 'RU', flag: '🇷🇺' },
  { code: 'zh', label: '中', flag: '🇨🇳' },
]

export default function Home() {
  const [lang, setLang] = useState<Lang>('en')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const t: T = translations[lang]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, lang }),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  

      function updateTime() {
      const h = (document.getElementById('time_hour') as HTMLSelectElement)?.value
      const m = (document.getElementById('time_min') as HTMLSelectElement)?.value
      const ampm = (document.getElementById('time_ampm') as HTMLSelectElement)?.value
      if (!h || !m) return
      let hour = parseInt(h)
      if (ampm === 'PM' && hour !== 12) hour += 12
      if (ampm === 'AM' && hour === 12) hour = 0
      const val = `${String(hour).padStart(2,'0')}:${m}`
      const input = document.getElementById('ride_time') as HTMLInputElement
      if (input) input.value = val
    }
    
    return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg: #0e0e0d; --surface: #161614; --border: #2a2a26; --text: #f0ede6; --muted: #7a7770; --accent: #c8a96e; --radius: 4px; }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; font-weight: 300; line-height: 1.6; overflow-x: hidden; }
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        body::before { content:''; position:fixed; inset:0; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events:none; z-index:1000; opacity:0.4; }
        nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; justify-content:space-between; align-items:center; padding:20px 48px; background:rgba(14,14,13,0.85); backdrop-filter:blur(12px); border-bottom:1px solid var(--border); }
        .nav-logo { font-family:'DM Serif Display',serif; font-size:18px; color:var(--text); text-decoration:none; }
        .lang-switcher { display:flex; gap:4px; }
        .lang-btn { background:transparent; border:1px solid transparent; color:var(--muted); font-size:12px; font-weight:500; padding:5px 10px; cursor:pointer; border-radius:var(--radius); transition:all 0.15s; letter-spacing:0.05em; }
        .lang-btn.active { border-color:var(--accent); color:var(--accent); }
        .nav-right { display:flex; align-items:center; gap:16px; }
        .nav-cta { background:var(--accent); color:#0e0e0d; font-size:12px; font-weight:500; letter-spacing:0.08em; text-transform:uppercase; padding:9px 20px; border:none; cursor:pointer; text-decoration:none; transition:opacity 0.2s; }
        .nav-cta:hover { opacity:0.85; }
        .hero { min-height:100vh; display:grid; place-items:center; padding:120px 48px 80px; position:relative; overflow:hidden; }
        .hero-bg { position:absolute; inset:0; background:radial-gradient(ellipse 60% 50% at 70% 40%, rgba(200,169,110,0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 20% 70%, rgba(200,169,110,0.04) 0%, transparent 60%); }
        .hero-inner { position:relative; max-width:780px; text-align:center; animation:fadeUp 1s ease both; }
        .hero-eyebrow { font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--accent); margin-bottom:28px; display:flex; align-items:center; justify-content:center; gap:12px; }
        .hero-eyebrow::before, .hero-eyebrow::after { content:''; display:block; width:32px; height:1px; background:var(--accent); opacity:0.5; }
        h1 { font-family:'DM Serif Display',serif; font-size:clamp(48px,8vw,92px); line-height:1.02; letter-spacing:-0.01em; margin-bottom:28px; }
        h1 em { font-style:italic; color:var(--accent); }
        .hero-sub { font-size:17px; color:var(--muted); max-width:520px; margin:0 auto 44px; line-height:1.7; }
        .hero-actions { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }
        .btn-primary { background:var(--accent); color:#0e0e0d; font-size:13px; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; padding:16px 36px; border:none; cursor:pointer; text-decoration:none; display:inline-block; transition:opacity 0.2s, transform 0.2s; }
        .btn-primary:hover { opacity:0.9; transform:translateY(-1px); }
        .btn-secondary { background:transparent; color:var(--muted); font-size:13px; padding:16px 36px; border:1px solid var(--border); cursor:pointer; text-decoration:none; display:inline-block; transition:border-color 0.2s, color 0.2s; }
        .btn-secondary:hover { border-color:var(--muted); color:var(--text); }
        .perks { border-top:1px solid var(--border); border-bottom:1px solid var(--border); display:grid; grid-template-columns:repeat(4,1fr); }
        .perk { padding:32px 24px; display:flex; align-items:flex-start; gap:16px; border-right:1px solid var(--border); }
        .perk:last-child { border-right:none; }
        .perk-icon { font-size:20px; flex-shrink:0; margin-top:2px; }
        .perk-label { font-size:13px; font-weight:500; margin-bottom:4px; }
        .perk-desc { font-size:12px; color:var(--muted); line-height:1.5; }
        section { padding:80px 48px; }
        .section-label { font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:var(--accent); margin-bottom:12px; }
        .section-title { font-family:'DM Serif Display',serif; font-size:clamp(28px,4vw,48px); line-height:1.1; margin-bottom:16px; }
        .how { background:var(--surface); }
        .how-grid { max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:start; }
        .how-left p { color:var(--muted); max-width:360px; }
        .steps { display:flex; flex-direction:column; }
        .step { display:flex; gap:20px; padding:24px 0; border-bottom:1px solid var(--border); }
        .step:last-child { border-bottom:none; }
        .step-num { font-family:'DM Serif Display',serif; font-size:32px; color:var(--accent); opacity:0.3; line-height:1; flex-shrink:0; width:44px; }
        .step-title { font-size:14px; font-weight:500; margin-bottom:4px; }
        .step-text { font-size:13px; color:var(--muted); line-height:1.6; }
        .booking { background:var(--surface); border-top:1px solid var(--border); }
        .booking-inner { max-width:600px; margin:0 auto; text-align:center; }
        .booking-inner > p { color:var(--muted); margin-bottom:40px; }
        .form { text-align:left; display:flex; flex-direction:column; gap:14px; }
        .form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .field { display:flex; flex-direction:column; gap:7px; }
        label { font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted); }
        input, textarea, select { background:var(--bg); border:1px solid var(--border); color:var(--text); font-family:'DM Sans',sans-serif; font-size:14px; font-weight:300; padding:13px 15px; outline:none; transition:border-color 0.2s; width:100%; -webkit-appearance:none; border-radius:0; }
        input::placeholder, textarea::placeholder { color:var(--muted); }
        input:focus, textarea:focus, select:focus { border-color:var(--accent); }
        select option { background:#1a1a18; }
        textarea { resize:vertical; min-height:90px; }
        input[type="date"], input[type="time"] { cursor:pointer; color-scheme:dark; }
        input[type="date"]::-webkit-calendar-picker-indicator, input[type="time"]::-webkit-calendar-picker-indicator { cursor:pointer; padding:4px; width:20px; height:20px; filter:invert(0.75) sepia(0.5) saturate(2) hue-rotate(10deg); opacity:0.8; }
        input[type="date"]::-webkit-calendar-picker-indicator:hover, input[type="time"]::-webkit-calendar-picker-indicator:hover { opacity:1; }
        .form-submit { margin-top:6px; background:var(--accent); color:#0e0e0d; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; padding:17px; border:none; cursor:pointer; width:100%; transition:opacity 0.2s; }
        .form-submit:hover:not(:disabled) { opacity:0.9; }
        .form-submit:disabled { opacity:0.5; cursor:not-allowed; }
        .form-note { font-size:12px; color:var(--muted); text-align:center; margin-top:10px; }
        .form-error { background:#fee2e2; border:1px solid #fca5a5; color:#b91c1c; padding:12px 16px; font-size:13px; }
        .bug-toggle { background:none; border:none; color:var(--muted); font-size:12px; cursor:pointer; text-decoration:underline; text-underline-offset:3px; padding:0; margin-top:16px; display:block; width:100%; text-align:center; }
        .bug-toggle:hover { color:var(--text); }
        .bug-box { margin-top:12px; padding:16px; border:1px solid var(--border); background:var(--bg); display:flex; flex-direction:column; gap:10px; }
        .bug-box textarea { min-height:70px; font-size:13px; }
        .bug-submit { background:transparent; border:1px solid var(--border); color:var(--muted); font-size:12px; font-weight:500; letter-spacing:0.08em; text-transform:uppercase; padding:10px; cursor:pointer; transition:border-color 0.2s, color 0.2s; width:100%; }
        .bug-submit:hover { border-color:var(--muted); color:var(--text); }
        .bug-sent { font-size:12px; color:var(--accent); text-align:center; padding:8px 0; margin-top:12px; }
        .success-msg { padding:48px 0; }
        .success-icon { font-size:48px; margin-bottom:16px; }
        .success-msg h3 { font-family:'DM Serif Display',serif; font-size:28px; margin-bottom:8px; }
        .success-msg p { color:var(--muted); }
        .long-trip { border:1px solid var(--border); padding:24px 28px; display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; margin-top:16px; }
        .long-trip-text { font-size:13px; color:var(--muted); }
        .long-trip-text strong { color:var(--text); display:block; margin-bottom:4px; font-size:14px; }
        .long-trip a { background:transparent; border:1px solid var(--border); color:var(--muted); font-size:12px; padding:9px 18px; text-decoration:none; white-space:nowrap; transition:border-color 0.2s, color 0.2s; }
        .long-trip a:hover { border-color:var(--muted); color:var(--text); }
        footer { border-top:1px solid var(--border); padding:28px 48px; display:flex; justify-content:space-between; align-items:center; color:var(--muted); font-size:12px; }
        .footer-logo { font-family:'DM Serif Display',serif; font-size:16px; color:var(--text); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        @media (max-width:768px) {
          nav { padding:16px 20px; }
          .hero { padding:100px 20px 60px; }
          .perks { grid-template-columns:1fr 1fr; }
          .perk { border-right:none; border-bottom:1px solid var(--border); }
          .perk:nth-child(odd) { border-right:1px solid var(--border); }
          .perk:last-child, .perk:nth-last-child(2):nth-child(odd) { border-bottom:none; }
          section { padding:56px 20px; }
          .how-grid { grid-template-columns:1fr; gap:36px; }
          .form-row { grid-template-columns:1fr; }
          footer { flex-direction:column; gap:8px; text-align:center; }
        }
        @media (max-width:480px) {
          .perks { grid-template-columns:1fr; }
          .perk { border-right:none !important; }
          .lang-btn { padding:4px 7px; font-size:11px; }
        }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <nav>
        <a href="#" className="nav-logo">Private Rides</a>
        <div className="nav-right">
          <div className="lang-switcher">
            {LANGS.map((l) => (
              <button key={l.code} className={`lang-btn ${lang === l.code ? 'active' : ''}`} onClick={() => setLang(l.code)}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>
          <a href="#book" className="nav-cta">{t.nav_book}</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-inner">
          <div className="hero-eyebrow">{t.hero_eyebrow}</div>
          <h1>{t.hero_title}<br /><em>{t.hero_title_em}</em></h1>
          <p className="hero-sub">{t.hero_sub}</p>
          <div className="hero-actions">
            <a href="#book" className="btn-primary">{t.hero_cta}</a>
            <a href="#how" className="btn-secondary">{t.hero_cta2}</a>
          </div>
        </div>
      </section>

      <div className="perks">
        {[
          { icon: '🤝', label: t.perk1_label, desc: t.perk1_desc },
          { icon: '🔒', label: t.perk2_label, desc: t.perk2_desc },
          { icon: '⏱', label: t.perk3_label, desc: t.perk3_desc },
          { icon: '💳', label: t.perk4_label, desc: t.perk4_desc },
        ].map((p, i) => (
          <div className="perk" key={i}>
            <div className="perk-icon">{p.icon}</div>
            <div>
              <div className="perk-label">{p.label}</div>
              <div className="perk-desc">{p.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <section className="how" id="how">
        <div className="how-grid">
          <div>
            <div className="section-label">{t.how_label}</div>
            <h2 className="section-title">{t.how_title}</h2>
            <p>{t.hero_sub}</p>
          </div>
          <div className="steps">
            {[
              { n: '01', title: t.step1_title, text: t.step1_text },
              { n: '02', title: t.step2_title, text: t.step2_text },
              { n: '03', title: t.step3_title, text: t.step3_text },
            ].map((s) => (
              <div className="step" key={s.n}>
                <div className="step-num">{s.n}</div>
                <div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-text">{s.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="booking" id="book">
        <div className="booking-inner">
          <div className="section-label">{t.form_label}</div>
          <h2 className="section-title">{t.form_title}</h2>
          <p>{t.form_sub}</p>

          {submitted ? (
            <div className="success-msg">
              <div className="success-icon">✅</div>
              <h3>{t.success_title}</h3>
              <p>{t.success_text}</p>
            </div>
          ) : (
            <form className="form" ref={formRef} onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="client_name">{t.field_name}</label>
                  <input id="client_name" name="client_name" type="text" required placeholder="Jane Smith" />
                </div>
                <div className="field">
                  <label htmlFor="client_email">{t.field_email}</label>
                  <input id="client_email" name="client_email" type="email" required placeholder="jane@email.com" />
                </div>
              </div>

              <div className="field">
                <label htmlFor="client_phone">{t.field_phone}</label>
                <input id="client_phone" name="client_phone" type="tel" placeholder="(916) 555-0100" />
              </div>

              <div className="field">
                <label htmlFor="pickup_address">{t.field_pickup}</label>
                <input id="pickup_address" name="pickup_address" type="text" required placeholder="123 Main St, Sacramento" />
              </div>

              <div className="field">
                <label htmlFor="dropoff_address">{t.field_dropoff}</label>
                <input id="dropoff_address" name="dropoff_address" type="text" required placeholder="SMF Airport, Kaiser on Morse..." />
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="ride_date">{t.field_date}</label>
                  <input
                    id="ride_date" name="ride_date" type="date" required
                    min={new Date().toISOString().split('T')[0]}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  />
                </div>
                
                <div className="field">
                  <label>{t.field_time}</label>
                  <input type="hidden" id="ride_time" name="ride_time" required />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select id="time_hour" style={{ flex: 1 }} onChange={() => updateTime()}>
                      <option value="">HH</option>
                      {[12,1,2,3,4,5,6,7,8,9,10,11].map(h => (
                        <option key={h} value={String(h)}>{String(h).padStart(2,'0')}</option>
                      ))}
                    </select>
                    <select id="time_min" style={{ flex: 1 }} onChange={() => updateTime()}>
                      <option value="">MM</option>
                      {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select id="time_ampm" style={{ flex: 1 }} onChange={() => updateTime()}>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="field">
                <label htmlFor="payment_method">{t.field_payment}</label>
                <select id="payment_method" name="payment_method">
                  <option value="stripe">{t.payment_stripe}</option>
                  <option value="zelle">{t.payment_zelle}</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="notes">{t.field_notes}</label>
                <textarea id="notes" name="notes" placeholder={t.field_notes_ph} />
              </div>

              {error && <div className="form-error">{error}</div>}

              <button type="submit" className="form-submit" disabled={loading}>
                {loading ? '...' : t.submit}
              </button>
              <p className="form-note">{t.form_note}</p>
            </form>
          )}

          <div className="long-trip">
            <div className="long-trip-text">
              <strong>{t.long_trip_label}</strong>
              {t.long_trip_text}
            </div>
            <a href="mailto:rides@justrideforyou.com">{t.long_trip_cta}</a>
          </div>

          <BugReport />
        </div>
      </section>

      <footer>
        <div className="footer-logo">Private Rides</div>
        <div>Sacramento, CA &nbsp;·&nbsp; justrideforyou.com</div>
      </footer>
    </>
  )
}

function BugReport() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  async function submit() {
    if (!text.trim()) return
    setSending(true)
    try {
      await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      setSent(true)
      setText('')
    } finally {
      setSending(false)
    }
  }

  if (sent) return <div className="bug-sent">✓ Thanks for the report!</div>

  return (
    <div style={{ marginTop: 24 }}>
      <button className="bug-toggle" onClick={() => setOpen(!open)}>
        Found a bug? Let us know
      </button>
      {open && (
        <div className="bug-box">
          <textarea
            placeholder="Describe what happened..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="bug-submit" onClick={submit} disabled={sending}>
            {sending ? '...' : 'Send report'}
          </button>
        </div>
      )}
    </div>
  )
}

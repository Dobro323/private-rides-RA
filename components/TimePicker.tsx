'use client'

import { useState, useRef, useEffect } from 'react'

interface TimePickerProps {
  id: string
  name: string
  required?: boolean
}

export default function TimePicker({ id, name, required }: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const [hour, setHour] = useState<number | null>(null)
  const [minute, setMinute] = useState<number | null>(null)
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM')
  const [display, setDisplay] = useState('--:-- --')
  const [value, setValue] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function update(h: number | null, m: number | null, ap: 'AM' | 'PM') {
    if (h === null || m === null) return
    const disp = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ap}`
    setDisplay(disp)
    let h24 = h
    if (ap === 'PM' && h !== 12) h24 = h + 12
    if (ap === 'AM' && h === 12) h24 = 0
    setValue(`${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    setOpen(false)
  }

  function selectHour(h: number) {
    setHour(h)
    update(h, minute, ampm)
  }
  function selectMinute(m: number) {
    setMinute(m)
    update(hour, m, ampm)
  }
  function selectAmpm(ap: 'AM' | 'PM') {
    setAmpm(ap)
    update(hour, minute, ap)
  }

  const isEmpty = hour === null && minute === null

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input type="hidden" id={id} name={name} value={value} required={required} />
      <div
        onClick={() => setOpen(!open)}
        style={{
          background: 'var(--bg)',
          border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
          color: isEmpty ? 'var(--muted)' : 'var(--text)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 300,
          padding: '13px 15px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none',
          transition: 'border-color 0.2s',
        }}
      >
        <span>{display}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5 }}>
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          zIndex: 200,
          background: '#1a1a18',
          border: '1px solid var(--border)',
          display: 'flex',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          <div style={{ flex: 1, maxHeight: 220, overflowY: 'auto', borderRight: '1px solid var(--border)' }}>
            {hours.map(h => (
              <div key={h} onClick={() => selectHour(h)} style={{
                padding: '10px 0', textAlign: 'center', fontSize: 14, cursor: 'pointer',
                background: hour === h ? 'rgba(200,169,110,0.15)' : 'transparent',
                color: hour === h ? 'var(--accent)' : 'var(--text)',
                fontWeight: hour === h ? 500 : 300,
              }}>
                {String(h).padStart(2, '0')}
              </div>
            ))}
          </div>

          <div style={{ flex: 1, maxHeight: 220, overflowY: 'auto', borderRight: '1px solid var(--border)' }}>
            {minutes.map(m => (
              <div key={m} onClick={() => selectMinute(m)} style={{
                padding: '10px 0', textAlign: 'center', fontSize: 14, cursor: 'pointer',
                background: minute === m ? 'rgba(200,169,110,0.15)' : 'transparent',
                color: minute === m ? 'var(--accent)' : 'var(--text)',
                fontWeight: minute === m ? 500 : 300,
              }}>
                {String(m).padStart(2, '0')}
              </div>
            ))}
          </div>

          <div style={{ width: 64 }}>
            {(['AM', 'PM'] as const).map(ap => (
              <div key={ap} onClick={() => selectAmpm(ap)} style={{
                padding: '10px 0', textAlign: 'center', fontSize: 14, cursor: 'pointer',
                background: ampm === ap ? 'rgba(200,169,110,0.15)' : 'transparent',
                color: ampm === ap ? 'var(--accent)' : 'var(--text)',
                fontWeight: ampm === ap ? 500 : 300,
              }}>
                {ap}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect } from 'react'

export default function OfflinePage() {
  useEffect(() => {
    const handleOnline = () => window.location.reload()
    window.addEventListener('online', handleOnline)
    const interval = setInterval(() => {
      if (navigator.onLine) window.location.href = '/'
    }, 5000)
    return () => {
      window.removeEventListener('online', handleOnline)
      clearInterval(interval)
    }
  }, [])

  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        margin: 0,
        padding: 20,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: 400,
          padding: '40px 20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 20,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          width: '100%'
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            margin: '0 auto 20px',
            background: 'white',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
          }}
        >
          📱
        </div>
        <h1 style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 600 }}>
          Je bent offline
        </h1>
        <p style={{ margin: '0 0 30px', opacity: 0.9, lineHeight: 1.5 }}>
          Geen internetverbinding gevonden. Maar geen zorgen - QCode werkt ook
          offline!
        </p>
        <div style={{ marginTop: 30, textAlign: 'left' }}>
          {[
            'Bekijk je opgeslagen kortingscodes',
            'Zoek en filter je codes',
            'Voeg nieuwe codes toe',
            'Alles wordt gesynchroniseerd zodra je weer online bent',
          ].map((text) => (
            <div
              key={text}
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '10px 0',
                opacity: 0.9,
              }}
            >
              <span style={{ marginRight: 10, color: '#4ade80', fontWeight: 'bold' }}>
                ✓
              </span>
              <span>{text}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: 'white',
            color: '#667eea',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 12,
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: 20,
          }}
        >
          Opnieuw proberen
        </button>
      </div>
    </div>
  )
}
"use client"

import { useState } from 'react'

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/criar-assinatura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const data = await res.json()

      // Mercado Pago preapproval usually returns an init_point to redirect the user
      const redirectUrl = data.init_point || data.sandbox_init_point || data.init_point_url || data.url

      if (redirectUrl) {
        window.location.href = redirectUrl
        return
      }

      alert('Não foi possível iniciar o checkout. Tente novamente.')
      setLoading(false)
    } catch (e) {
      alert('Erro ao criar assinatura. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={`inline-block rounded-full px-6 py-3 text-sm font-semibold text-black ${loading ? 'opacity-60' : ''}`}
      style={{ backgroundColor: '#22c55e' }}
    >
      {loading ? 'Redirecionando...' : 'Assinar Pro'}
    </button>
  )
}

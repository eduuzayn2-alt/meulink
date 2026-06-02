"use client"

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        alert('Faça login antes de assinar.')
        setLoading(false)
        return
      }

      const user = userData.user

      const body = {
        payer_email: user.email,
        user_id: user.id,
        external_reference: user.id,
      }

      const res = await fetch('/api/criar-assinatura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

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

'use client'

import { useEffect, useState } from 'react'

const COOKIE_KEY = 'cookieConsent'

export default function CookieBanner() {
  const [consent, setConsent] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    const stored = window.localStorage.getItem(COOKIE_KEY)
    setConsent(stored)
  }, [])

  const handleConsent = (value: 'accepted' | 'rejected') => {
    window.localStorage.setItem(COOKIE_KEY, value)
    setConsent(value)
  }

  if (consent === undefined || consent) {
    return null
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-[#0f0f0f] px-4 py-4 shadow-[0_-15px_40px_rgba(0,0,0,0.4)] sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Utilizamos cookies para personalizar sua experiência, analisar o uso da plataforma e manter a segurança. Ao continuar navegando, você concorda com a nossa Política de Privacidade.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleConsent('accepted')}
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            Aceitar cookies
          </button>
          <button
            type="button"
            onClick={() => handleConsent('rejected')}
            className="rounded-full border border-zinc-700 bg-transparent px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500"
          >
            Recusar cookies
          </button>
        </div>
      </div>
    </div>
  )
}

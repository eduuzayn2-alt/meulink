"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function RelatoriosPage() {
  const [events, setEvents] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        const userId = userData?.user?.id

        if (!userId) {
          setError('Sessão expirada. Faça login novamente.')
          setLoading(false)
          return
        }

        const [{ data: eventsData, error: eventsError }, { data: logsData, error: logsError }] = await Promise.all([
          supabase.from('analytics_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100),
          supabase.from('mp_webhook_logs').select('*').order('created_at', { ascending: false }).limit(50),
        ])

        if (eventsError) {
          console.warn('analytics fetch error', eventsError)
        }
        if (logsError) {
          console.warn('webhook logs fetch error', logsError)
        }

        setEvents(eventsData ?? [])
        setLogs(logsData ?? [])
      } catch (e) {
        setError('Erro ao carregar relatórios.')
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) return <div className="px-6 py-8 text-white">Carregando relatórios...</div>
  if (error) return <div className="px-6 py-8 text-red-400">{error}</div>

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Relatórios</h1>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Seus eventos</h2>
          {events.length === 0 ? (
            <div className="text-zinc-400">Nenhum evento registrado ainda.</div>
          ) : (
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.id} className="rounded-lg border border-zinc-800 p-3 bg-[#0f0f0f]">
                  <div className="text-sm text-zinc-300">{new Date(e.created_at).toLocaleString()}</div>
                  <div className="font-medium">{e.event_type}</div>
                  <pre className="mt-2 text-xs text-zinc-400">{JSON.stringify(e.payload)}</pre>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Logs do webhook (últimos)</h2>
          {logs.length === 0 ? (
            <div className="text-zinc-400">Nenhum log de webhook encontrado.</div>
          ) : (
            <ul className="space-y-3">
              {logs.map((l) => (
                <li key={l.id} className="rounded-lg border border-zinc-800 p-3 bg-[#0f0f0f]">
                  <div className="text-sm text-zinc-300">{new Date(l.created_at).toLocaleString()}</div>
                  <div className="font-medium">mp_id: {l.mp_id || '—'} topic: {l.topic || '—'}</div>
                  <pre className="mt-2 text-xs text-zinc-400">{JSON.stringify(l.raw)}</pre>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

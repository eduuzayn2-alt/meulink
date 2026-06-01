"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'

export default function AdminWebhooksPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      setError(null)
      try {
        const q = supabase.from('mp_webhook_logs').select('*').order('created_at', { ascending: false }).limit(200)
        if (filter) {
          q.ilike('mp_id', `%${filter}%`)
        }
        const { data, error } = await q
        if (error) throw error
        setLogs(data ?? [])
      } catch (e: any) {
        setError(e.message || 'Erro ao carregar logs. Verifique permissões (apenas admins).')
      }
      setLoading(false)
    }

    fetchLogs()
  }, [filter])

  const exportCsv = () => {
    const header = ['id', 'mp_id', 'topic', 'created_at', 'raw']
    const rows = logs.map((l) => [l.id, l.mp_id || '', l.topic || '', l.created_at, JSON.stringify(l.raw)])
    const csv = [header.join(','), ...rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mp_webhook_logs_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Admin — Logs Mercado Pago</h1>

        <div className="flex gap-3 items-center mb-4">
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filtrar por mp_id" className="rounded px-3 py-2 bg-[#111] border border-zinc-800" />
          <button onClick={exportCsv} className="rounded bg-emerald-600 px-4 py-2 text-black font-semibold">Exportar CSV</button>
        </div>

        {loading ? (
          <div>Carregando...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : logs.length === 0 ? (
          <div className="text-zinc-400">Nenhum log encontrado.</div>
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
      </div>
    </main>
  )
}

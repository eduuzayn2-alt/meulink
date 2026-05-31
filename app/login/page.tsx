"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleLogin = async () => {
    setLoading(true)
    setMessage(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setMessage(error.message)
      return
    }
    setMessage('Login realizado com sucesso! Redirecionando...')
    router.push('/')
  }

  const handleSignUp = async () => {
    setLoading(true)
    setMessage(null)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      setMessage(error.message)
      return
    }
    setMessage('Conta criada! Verifique seu e-mail para confirmação, se necessário.')
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center py-24">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl">
        <h1 className="text-2xl font-bold mb-6">Entrar</h1>

        <label className="block text-sm text-zinc-400 mb-1">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-black/20 border border-zinc-800 text-white px-4 py-2 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-white/20"
          placeholder="seu@exemplo.com"
        />

        <label className="block text-sm text-zinc-400 mb-1">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-black/20 border border-zinc-800 text-white px-4 py-2 rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-white/20"
          placeholder="********"
        />

        {message && <div className="mb-4 text-sm text-zinc-300">{message}</div>}

        <div className="flex gap-3">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex-1 bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-zinc-200 transition disabled:opacity-60"
          >
            {loading ? 'Aguarde...' : 'Entrar'}
          </button>

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="flex-1 bg-transparent border border-zinc-700 text-zinc-200 px-4 py-2 rounded-full font-medium hover:bg-zinc-800 transition disabled:opacity-60"
          >
            {loading ? 'Aguarde...' : 'Criar conta'}
          </button>
        </div>

        <p className="text-zinc-500 text-sm mt-6">Ao criar conta, você concorda com os termos de serviço.</p>
      </div>
    </main>
  )
}

"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [screen, setScreen] = useState<'login' | 'signup' | 'confirmation'>('login')
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  
  // Signup state
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false)
  const [signupTerms, setSignupTerms] = useState(false)
  
  // Common state
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [confirmationEmail, setConfirmationEmail] = useState('')

  const handleLogin = async () => {
    setErrorMessage(null)
    
    if (!loginEmail || !loginPassword) {
      setErrorMessage('Preencha e-mail e senha')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ 
      email: loginEmail, 
      password: loginPassword 
    })
    setLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    router.push('/dashboard')
  }

  const handleSignup = async () => {
    setErrorMessage(null)

    // Validations
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      setErrorMessage('Preencha todos os campos')
      return
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('As senhas não conferem')
      return
    }

    if (signupPassword.length < 6) {
      setErrorMessage('Senha deve ter no mínimo 6 caracteres')
      return
    }

    if (!signupTerms) {
      setErrorMessage('Você deve concordar com os Termos de uso e Política de privacidade')
      return
    }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ 
      email: signupEmail, 
      password: signupPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    setLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    // Create user profile
    if (data.user?.id) {
      // Determine if this email should be granted admin for testing
      const adminList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
      const isAdmin = adminList.includes(signupEmail.toLowerCase())

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: data.user.id,
            nome: signupName,
            username: signupEmail.split('@')[0] + Date.now(),
            is_admin: isAdmin || false,
          }
        ])

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError)
      }
    }

    setConfirmationEmail(signupEmail)
    setScreen('confirmation')
  }

  const handleForgotPassword = async () => {
    setErrorMessage(null)
    
    if (!loginEmail) {
      setErrorMessage('Digite seu e-mail para recuperar a senha')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    setLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setErrorMessage(null)
    alert('Enviamos um link de recuperação para seu e-mail')
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-zinc-800 bg-[#111111] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold tracking-tight text-white">Linkify</div>
          <p className="mt-2 text-sm text-zinc-500">O link da bio que vende por você</p>
        </div>

        {screen === 'login' && (
          <>
            <h2 className="text-3xl font-semibold text-white text-center mb-6">Entrar na sua conta</h2>

            {errorMessage && (
              <div className="mb-5 rounded-[1.5rem] border border-red-700 bg-red-950/80 p-4 text-sm text-red-200">
                {errorMessage}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">E-mail</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="seu@exemplo.com"
                  className="w-full rounded-[1.5rem] border border-zinc-800 bg-[#0d0d0d] px-4 py-3 text-white outline-none transition focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Senha</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="••••••••"
                    className="w-full rounded-[1.5rem] border border-zinc-800 bg-[#0d0d0d] px-4 py-3 pr-12 text-white outline-none transition focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-white"
                    aria-label={showLoginPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showLoginPassword ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19.5c-5.14 0-9.4-3.28-11-7.5 1.08-2.73 2.93-4.9 5.18-6.23" />
                        <path d="M1 1l22 22" />
                        <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
                        <path d="M10.66 5.53A9.956 9.956 0 0 1 12 4.5c5.14 0 9.4 3.28 11 7.5a13.5 13.5 0 0 1-1.87 3.84" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full rounded-[1.5rem] bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full rounded-[1.5rem] border border-zinc-800 bg-[#0d0d0d] px-4 py-3 text-sm text-zinc-300 transition hover:border-emerald-500 hover:text-white disabled:opacity-60"
              >
                Esqueci minha senha
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-zinc-500">
              Não tem conta?{' '}
              <button
                onClick={() => {
                  setScreen('signup')
                  setErrorMessage(null)
                }}
                className="font-semibold text-white hover:text-emerald-400"
              >
                Criar conta grátis →
              </button>
            </div>
          </>
        )}

        {screen === 'signup' && (
          <>
            <h2 className="text-3xl font-semibold text-white text-center mb-6">Criar sua conta grátis</h2>

            {errorMessage && (
              <div className="mb-5 rounded-[1.5rem] border border-red-700 bg-red-950/80 p-4 text-sm text-red-200">
                {errorMessage}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Nome completo</label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full rounded-[1.5rem] border border-zinc-800 bg-[#0d0d0d] px-4 py-3 text-white outline-none transition focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">E-mail</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="seu@exemplo.com"
                  className="w-full rounded-[1.5rem] border border-zinc-800 bg-[#0d0d0d] px-4 py-3 text-white outline-none transition focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Senha</label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-[1.5rem] border border-zinc-800 bg-[#0d0d0d] px-4 py-3 pr-12 text-white outline-none transition focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-white"
                    aria-label={showSignupPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showSignupPassword ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19.5c-5.14 0-9.4-3.28-11-7.5 1.08-2.73 2.93-4.9 5.18-6.23" />
                        <path d="M1 1l22 22" />
                        <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
                        <path d="M10.66 5.53A9.956 9.956 0 0 1 12 4.5c5.14 0 9.4 3.28 11 7.5a13.5 13.5 0 0 1-1.87 3.84" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Confirmar senha</label>
                <div className="relative">
                  <input
                    type={showSignupConfirmPassword ? 'text' : 'password'}
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-[1.5rem] border border-zinc-800 bg-[#0d0d0d] px-4 py-3 pr-12 text-white outline-none transition focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupConfirmPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-white"
                    aria-label={showSignupConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showSignupConfirmPassword ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19.5c-5.14 0-9.4-3.28-11-7.5 1.08-2.73 2.93-4.9 5.18-6.23" />
                        <path d="M1 1l22 22" />
                        <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
                        <path d="M10.66 5.53A9.956 9.956 0 0 1 12 4.5c5.14 0 9.4 3.28 11 7.5a13.5 13.5 0 0 1-1.87 3.84" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6 flex items-start gap-3 text-sm text-zinc-400">
              <input
                type="checkbox"
                id="terms"
                checked={signupTerms}
                onChange={(e) => setSignupTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-zinc-700 bg-[#0d0d0d] text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="terms" className="text-sm leading-6 text-zinc-400">
                Concordo com os{' '}
                <button onClick={() => {}} className="underline hover:text-white">
                  Termos de uso
                </button>{' '}
                e{' '}
                <button onClick={() => {}} className="underline hover:text-white">
                  Política de privacidade
                </button>
              </label>
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full rounded-[1.5rem] bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>

            <div className="mt-6 text-center text-sm text-zinc-500">
              Já tem conta?{' '}
              <button
                onClick={() => {
                  setScreen('login')
                  setErrorMessage(null)
                }}
                className="font-semibold text-white hover:text-emerald-400"
              >
                Entrar →
              </button>
            </div>
          </>
        )}

        {screen === 'confirmation' && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-500 bg-[#0b0f08] text-emerald-400">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-white">Confira seu e-mail</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Enviamos um email de confirmação para <strong className="text-white">{confirmationEmail}</strong>. Verifique sua caixa de entrada e clique no link para ativar sua conta.
              </p>
            </div>

            <button
              onClick={() => {
                setScreen('login')
                setSignupEmail('')
                setSignupPassword('')
                setSignupConfirmPassword('')
                setSignupName('')
                setSignupTerms(false)
              }}
              className="w-full rounded-[1.5rem] bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              Voltar para login
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

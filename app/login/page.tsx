"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [screen, setScreen] = useState<'login' | 'signup' | 'confirmation'>('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false)
  const [signupTerms, setSignupTerms] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [confirmationEmail, setConfirmationEmail] = useState('')

  const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19.5c-5.14 0-9.4-3.28-11-7.5 1.08-2.73 2.93-4.9 5.18-6.23" />
      <path d="M1 1l22 22" /><path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
      <path d="M10.66 5.53A9.956 9.956 0 0 1 12 4.5c5.14 0 9.4 3.28 11 7.5a13.5 13.5 0 0 1-1.87 3.84" />
    </svg>
  ) : (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

  const handleLogin = async () => {
    setErrorMessage(null)
    const now = Date.now()
    if (lockoutUntil && now < lockoutUntil) { setErrorMessage('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'); return }
    if (!loginEmail || !loginPassword) { setErrorMessage('Preencha e-mail e senha'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    setLoading(false)
    if (error) {
      const nextAttempts = loginAttempts + 1
      setLoginAttempts(nextAttempts)
      if (nextAttempts >= 5) { setLockoutUntil(Date.now() + 3 * 60 * 1000); setErrorMessage('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.') }
      else setErrorMessage(error.message)
      return
    }
    setLoginAttempts(0); setLockoutUntil(null)
    router.push('/dashboard')
  }

  const handleSignup = async () => {
    setErrorMessage(null)
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) { setErrorMessage('Preencha todos os campos'); return }
    if (signupPassword !== signupConfirmPassword) { setErrorMessage('As senhas não conferem'); return }
    if (signupPassword.length < 6) { setErrorMessage('Senha deve ter no mínimo 6 caracteres'); return }
    if (!signupTerms) { setErrorMessage('Você precisa aceitar os termos para criar uma conta'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email: signupEmail, password: signupPassword, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } })
    setLoading(false)
    if (error) { setErrorMessage(error.message); return }
    if (data.user?.id) {
      const adminList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
      const isAdmin = adminList.includes(signupEmail.toLowerCase())
      const { error: profileError } = await supabase.from('profiles').insert([{ user_id: data.user.id, nome: signupName, username: signupEmail.split('@')[0] + Date.now(), is_admin: isAdmin || false }])
      if (profileError) console.error('Erro ao criar perfil:', profileError)
    }
    setConfirmationEmail(signupEmail)
    setScreen('confirmation')
  }

  const handleForgotPassword = async () => {
    setErrorMessage(null)
    if (!loginEmail) { setErrorMessage('Digite seu e-mail para recuperar a senha'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, { redirectTo: `${window.location.origin}/auth/callback` })
    setLoading(false)
    if (error) { setErrorMessage(error.message); return }
    alert('Enviamos um link de recuperação para seu e-mail')
  }

  const inp = "w-full rounded-xl border border-[#27272a] bg-[#18181b] px-4 py-3 text-sm text-[#fafafa] placeholder-[#3f3f46] outline-none transition focus:border-[#7c3aed]"

  return (
    <main className="min-h-screen bg-[#09090b] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mb-3">
            <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
              <rect x="3" y="2" width="9" height="14" rx="2" transform="skewX(-8)" fill="#7c3aed"/>
              <rect x="10" y="9" width="9" height="8" rx="2" transform="skewX(-8)" fill="#7c3aed"/>
            </svg>
            <span className="text-xl font-medium text-[#fafafa]">Linkify</span>
          </Link>
          <p className="text-sm text-[#52525b]">O link da bio que transforma seguidores em clientes</p>
        </div>

        {/* CARD */}
        <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-8">
          <div className="h-px w-full rounded-full mb-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)' }} />

          {/* LOGIN */}
          {screen === 'login' && (
            <>
              <h2 className="text-lg font-medium text-[#fafafa] text-center mb-6">Entrar na sua conta</h2>
              {errorMessage && <div className="mb-5 rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-sm text-red-400">{errorMessage}</div>}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#71717a] mb-1.5 uppercase tracking-wider">E-mail</label>
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} placeholder="seu@exemplo.com" className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-[#71717a] mb-1.5 uppercase tracking-wider">Senha</label>
                  <div className="relative">
                    <input type={showLoginPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} placeholder="••••••••" className={`${inp} pr-12`} />
                    <button type="button" onClick={() => setShowLoginPassword(c => !c)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3f3f46] hover:text-[#fafafa] transition">
                      <EyeIcon open={showLoginPassword} />
                    </button>
                  </div>
                </div>
                <button onClick={handleLogin} disabled={loading} className="w-full rounded-xl bg-[#7c3aed] px-4 py-3 text-sm font-medium text-white hover:bg-[#6d28d9] disabled:opacity-50 transition mt-2">
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
                <button type="button" onClick={handleForgotPassword} disabled={loading} className="w-full rounded-xl border border-[#27272a] bg-transparent px-4 py-3 text-sm text-[#71717a] hover:border-[#7c3aed]/50 hover:text-[#fafafa] disabled:opacity-50 transition">
                  Esqueci minha senha
                </button>
              </div>
              <p className="mt-6 text-center text-xs text-[#52525b]">
                Não tem conta?{' '}
                <button onClick={() => { setScreen('signup'); setErrorMessage(null) }} className="font-medium text-[#7c3aed] hover:text-[#a78bfa] transition">Criar conta grátis →</button>
              </p>
            </>
          )}

          {/* SIGNUP */}
          {screen === 'signup' && (
            <>
              <h2 className="text-lg font-medium text-[#fafafa] text-center mb-6">Criar sua conta grátis</h2>
              {errorMessage && <div className="mb-5 rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-sm text-red-400">{errorMessage}</div>}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#71717a] mb-1.5 uppercase tracking-wider">Nome completo</label>
                  <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Seu nome" className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-[#71717a] mb-1.5 uppercase tracking-wider">E-mail</label>
                  <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="seu@exemplo.com" className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-[#71717a] mb-1.5 uppercase tracking-wider">Senha</label>
                  <div className="relative">
                    <input type={showSignupPassword ? 'text' : 'password'} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="••••••••" className={`${inp} pr-12`} />
                    <button type="button" onClick={() => setShowSignupPassword(c => !c)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3f3f46] hover:text-[#fafafa] transition">
                      <EyeIcon open={showSignupPassword} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#71717a] mb-1.5 uppercase tracking-wider">Confirmar senha</label>
                  <div className="relative">
                    <input type={showSignupConfirmPassword ? 'text' : 'password'} value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} placeholder="••••••••" className={`${inp} pr-12`} />
                    <button type="button" onClick={() => setShowSignupConfirmPassword(c => !c)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3f3f46] hover:text-[#fafafa] transition">
                      <EyeIcon open={showSignupConfirmPassword} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-4 mb-5 flex items-start gap-3">
                <input type="checkbox" id="terms" checked={signupTerms} onChange={(e) => setSignupTerms(e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#27272a] bg-[#18181b] accent-[#7c3aed]" />
                <label htmlFor="terms" className="text-xs leading-5 text-[#52525b]">
                  Li e concordo com os{' '}
                  <Link href="/termos" target="_blank" rel="noreferrer" className="text-[#7c3aed] hover:text-[#a78bfa]">Termos de Uso</Link>
                  {' '}e{' '}
                  <Link href="/privacidade" target="_blank" rel="noreferrer" className="text-[#7c3aed] hover:text-[#a78bfa]">Política de Privacidade</Link>
                </label>
              </div>
              <button onClick={handleSignup} disabled={loading} className="w-full rounded-xl bg-[#7c3aed] px-4 py-3 text-sm font-medium text-white hover:bg-[#6d28d9] disabled:opacity-50 transition">
                {loading ? 'Criando conta...' : 'Criar conta grátis'}
              </button>
              <p className="mt-6 text-center text-xs text-[#52525b]">
                Já tem conta?{' '}
                <button onClick={() => { setScreen('login'); setErrorMessage(null) }} className="font-medium text-[#7c3aed] hover:text-[#a78bfa] transition">Entrar →</button>
              </p>
            </>
          )}

          {/* CONFIRMAÇÃO */}
          {screen === 'confirmation' && (
            <div className="space-y-6 text-center py-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#7c3aed]/40 bg-[#1a1030]">
                <svg className="h-8 w-8 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4" /><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-medium text-[#fafafa]">Confira seu e-mail</h2>
                <p className="mt-3 text-sm leading-6 text-[#71717a]">
                  Enviamos um e-mail para <strong className="text-[#fafafa]">{confirmationEmail}</strong>. Clique no link para ativar sua conta.
                </p>
              </div>
              <button onClick={() => { setScreen('login'); setSignupEmail(''); setSignupPassword(''); setSignupConfirmPassword(''); setSignupName(''); setSignupTerms(false) }}
                className="w-full rounded-xl bg-[#7c3aed] px-4 py-3 text-sm font-medium text-white hover:bg-[#6d28d9] transition">
                Voltar para login
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-[#27272a] mt-6">© 2026 Linkify — feito para criadores brasileiros</p>
      </div>
    </main>
  )
}
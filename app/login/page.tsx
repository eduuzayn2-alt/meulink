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

  const handleLogin = async () => {
    setErrorMessage(null)
    const now = Date.now()
    if (lockoutUntil && now < lockoutUntil) { setErrorMessage('Muitas tentativas. Aguarde alguns minutos.'); return }
    if (!loginEmail || !loginPassword) { setErrorMessage('Preencha e-mail e senha'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    setLoading(false)
    if (error) {
      const next = loginAttempts + 1
      setLoginAttempts(next)
      if (next >= 5) { setLockoutUntil(Date.now() + 3 * 60 * 1000); setErrorMessage('Muitas tentativas. Aguarde alguns minutos.') }
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
    if (!signupTerms) { setErrorMessage('Aceite os termos para criar uma conta'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email: signupEmail, password: signupPassword, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } })
    setLoading(false)
    if (error) { setErrorMessage(error.message); return }
    if (data.user?.id) {
      const adminList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
      await supabase.from('profiles').insert([{ user_id: data.user.id, nome: signupName, username: signupEmail.split('@')[0] + Date.now(), is_admin: adminList.includes(signupEmail.toLowerCase()) }])
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

  const EyeOpen = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19.5c-5.14 0-9.4-3.28-11-7.5 1.08-2.73 2.93-4.9 5.18-6.23"/>
      <path d="M1 1l22 22"/><path d="M9.88 9.88a3 3 0 0 0 4.24 4.24"/>
      <path d="M10.66 5.53A9.956 9.956 0 0 1 12 4.5c5.14 0 9.4 3.28 11 7.5a13.5 13.5 0 0 1-1.87 3.84"/>
    </svg>
  )
  const EyeClosed = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )

  const s = {
    page: { minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' } as React.CSSProperties,
    wrap: { width: '100%', maxWidth: 440 } as React.CSSProperties,
    logoRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6, textDecoration: 'none' } as React.CSSProperties,
    logoText: { fontSize: 20, fontWeight: 500, color: '#fafafa' } as React.CSSProperties,
    sub: { fontSize: 13, color: '#52525b', textAlign: 'center' as const, marginBottom: 28 },
    card: { background: '#161618', border: '1px solid #2a2a2e', borderRadius: 20, padding: '32px 28px' } as React.CSSProperties,
    gradLine: { height: 1, background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.6), transparent)', borderRadius: 999, marginBottom: 24 } as React.CSSProperties,
    title: { fontSize: 17, fontWeight: 500, color: '#fafafa', textAlign: 'center' as const, marginBottom: 20 },
    label: { display: 'block', fontSize: 11, color: '#71717a', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 },
    inp: { width: '100%', background: '#1c1c1f', border: '1px solid #2a2a2e', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#fafafa', outline: 'none', boxSizing: 'border-box' as const },
    inpPass: { width: '100%', background: '#1c1c1f', border: '1px solid #2a2a2e', borderRadius: 10, padding: '10px 44px 10px 14px', fontSize: 13, color: '#fafafa', outline: 'none', boxSizing: 'border-box' as const },
    passWrap: { position: 'relative' as const },
    eyeBtn: { position: 'absolute' as const, right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', display: 'flex', alignItems: 'center' },
    btnPrimary: { width: '100%', background: '#7c3aed', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 500, color: '#fff', cursor: 'pointer', marginTop: 4 } as React.CSSProperties,
    btnGhost: { width: '100%', background: 'transparent', border: '1px solid #2a2a2e', borderRadius: 10, padding: '10px', fontSize: 13, color: '#71717a', cursor: 'pointer', marginTop: 8 } as React.CSSProperties,
    fieldWrap: { marginBottom: 14 } as React.CSSProperties,
    error: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#f87171', marginBottom: 16 } as React.CSSProperties,
    footer: { fontSize: 12, color: '#52525b', textAlign: 'center' as const, marginTop: 18 },
    link: { color: '#7c3aed', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 },
    copy: { fontSize: 11, color: '#27272a', textAlign: 'center' as const, marginTop: 20 },
  }

  return (
    <main style={s.page}>
      <div style={s.wrap}>
        <Link href="/" style={s.logoRow}>
          <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
            <rect x="3" y="2" width="9" height="14" rx="2" transform="skewX(-8)" fill="#7c3aed"/>
            <rect x="10" y="9" width="9" height="8" rx="2" transform="skewX(-8)" fill="#7c3aed"/>
          </svg>
          <span style={s.logoText}>Linkify</span>
        </Link>
        <p style={s.sub}>O link da bio que transforma seguidores em clientes</p>

        <div style={s.card}>
          <div style={s.gradLine} />

          {screen === 'login' && (
            <>
              <p style={s.title}>Entrar na sua conta</p>
              {errorMessage && <div style={s.error}>{errorMessage}</div>}
              <div style={s.fieldWrap}>
                <label style={s.label}>E-mail</label>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleLogin()} placeholder="seu@exemplo.com" style={s.inp} />
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Senha</label>
                <div style={s.passWrap}>
                  <input type={showLoginPassword ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleLogin()} placeholder="••••••••" style={s.inpPass} />
                  <button type="button" onClick={() => setShowLoginPassword(c => !c)} style={s.eyeBtn}>{showLoginPassword ? <EyeOpen /> : <EyeClosed />}</button>
                </div>
              </div>
              <button onClick={handleLogin} disabled={loading} style={s.btnPrimary}>{loading ? 'Entrando...' : 'Entrar'}</button>
              <button type="button" onClick={handleForgotPassword} disabled={loading} style={s.btnGhost}>Esqueci minha senha</button>
              <p style={s.footer}>Não tem conta? <button onClick={() => { setScreen('signup'); setErrorMessage(null) }} style={s.link}>Criar conta grátis →</button></p>
            </>
          )}

          {screen === 'signup' && (
            <>
              <p style={s.title}>Criar sua conta grátis</p>
              {errorMessage && <div style={s.error}>{errorMessage}</div>}
              <div style={s.fieldWrap}>
                <label style={s.label}>Nome completo</label>
                <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} placeholder="Seu nome" style={s.inp} />
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>E-mail</label>
                <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="seu@exemplo.com" style={s.inp} />
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Senha</label>
                <div style={s.passWrap}>
                  <input type={showSignupPassword ? 'text' : 'password'} value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="••••••••" style={s.inpPass} />
                  <button type="button" onClick={() => setShowSignupPassword(c => !c)} style={s.eyeBtn}>{showSignupPassword ? <EyeOpen /> : <EyeClosed />}</button>
                </div>
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Confirmar senha</label>
                <div style={s.passWrap}>
                  <input type={showSignupConfirmPassword ? 'text' : 'password'} value={signupConfirmPassword} onChange={e => setSignupConfirmPassword(e.target.value)} placeholder="••••••••" style={s.inpPass} />
                  <button type="button" onClick={() => setShowSignupConfirmPassword(c => !c)} style={s.eyeBtn}>{showSignupConfirmPassword ? <EyeOpen /> : <EyeClosed />}</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, marginTop: 4 }}>
                <input type="checkbox" id="terms" checked={signupTerms} onChange={e => setSignupTerms(e.target.checked)} style={{ marginTop: 2, accentColor: '#7c3aed', flexShrink: 0 }} />
                <label htmlFor="terms" style={{ fontSize: 12, color: '#52525b', lineHeight: 1.5 }}>
                  Li e concordo com os{' '}
                  <Link href="/termos" target="_blank" rel="noreferrer" style={{ color: '#7c3aed' }}>Termos de Uso</Link>
                  {' '}e{' '}
                  <Link href="/privacidade" target="_blank" rel="noreferrer" style={{ color: '#7c3aed' }}>Política de Privacidade</Link>
                </label>
              </div>
              <button onClick={handleSignup} disabled={loading} style={s.btnPrimary}>{loading ? 'Criando conta...' : 'Criar conta grátis'}</button>
              <p style={s.footer}>Já tem conta? <button onClick={() => { setScreen('login'); setErrorMessage(null) }} style={s.link}>Entrar →</button></p>
            </>
          )}

          {screen === 'confirmation' && (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p style={{ fontSize: 17, fontWeight: 500, color: '#fafafa', marginBottom: 10 }}>Confira seu e-mail</p>
              <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.6, marginBottom: 24 }}>
                Enviamos um e-mail para <strong style={{ color: '#fafafa' }}>{confirmationEmail}</strong>. Clique no link para ativar sua conta.
              </p>
              <button onClick={() => { setScreen('login'); setSignupEmail(''); setSignupPassword(''); setSignupConfirmPassword(''); setSignupName(''); setSignupTerms(false) }} style={s.btnPrimary}>
                Voltar para login
              </button>
            </div>
          )}
        </div>
        <p style={s.copy}>© 2026 Linkify — feito para criadores brasileiros</p>
      </div>
    </main>
  )
}
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
  
  // Signup state
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
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
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: data.user.id,
            nome: signupName,
            username: signupEmail.split('@')[0] + Date.now(),
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
    <main style={{ backgroundColor: '#0a0a0a' }} className="min-h-screen text-white flex items-center justify-center py-12 px-4">
      {/* LOGIN SCREEN */}
      {screen === 'login' && (
        <div className="w-full max-w-md rounded-2xl p-8 border" style={{ backgroundColor: '#111111', borderColor: '#333333' }}>
          <div className="text-center mb-8">
            <div className="text-3xl font-bold mb-2">Linkify</div>
            <p style={{ color: '#888888' }} className="text-sm">O link da bio que vende por você</p>
          </div>

          <h2 className="text-2xl font-bold mb-8 text-center">Entrar na sua conta</h2>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              {errorMessage}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">E-mail</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="seu@exemplo.com"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#333333' }}
                className="w-full border rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Senha</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#333333' }}
                className="w-full border rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ backgroundColor: '#ffffff' }}
            className="w-full py-3 font-semibold rounded-lg text-black transition hover:opacity-90 disabled:opacity-60 mb-4"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <button
            onClick={handleForgotPassword}
            disabled={loading}
            className="w-full text-sm py-2 transition"
            style={{ color: '#888888' }}
          >
            Esqueci minha senha
          </button>

          <div className="mt-6 text-center text-sm">
            <span style={{ color: '#888888' }}>Não tem conta? </span>
            <button
              onClick={() => {
                setScreen('signup')
                setErrorMessage(null)
              }}
              className="font-semibold text-white hover:opacity-80 transition"
            >
              Criar conta grátis →
            </button>
          </div>
        </div>
      )}

      {/* SIGNUP SCREEN */}
      {screen === 'signup' && (
        <div className="w-full max-w-md rounded-2xl p-8 border" style={{ backgroundColor: '#111111', borderColor: '#333333' }}>
          <div className="text-center mb-8">
            <div className="text-3xl font-bold">Linkify</div>
          </div>

          <h2 className="text-2xl font-bold mb-8 text-center">Criar sua conta grátis</h2>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              {errorMessage}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nome completo</label>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Seu nome"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#333333' }}
                className="w-full border rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">E-mail</label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="seu@exemplo.com"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#333333' }}
                className="w-full border rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Senha</label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="••••••••"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#333333' }}
                className="w-full border rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirmar senha</label>
              <input
                type="password"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#333333' }}
                className="w-full border rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          <div className="mb-6 flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={signupTerms}
              onChange={(e) => setSignupTerms(e.target.checked)}
              style={{ accentColor: '#ffffff' }}
              className="mt-1 cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm cursor-pointer" style={{ color: '#888888' }}>
              Concordo com os <button onClick={() => {}} className="underline hover:opacity-80">Termos de uso</button> e <button onClick={() => {}} className="underline hover:opacity-80">Política de privacidade</button>
            </label>
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            style={{ backgroundColor: '#ffffff' }}
            className="w-full py-3 font-semibold rounded-lg text-black transition hover:opacity-90 disabled:opacity-60 mb-4"
          >
            {loading ? 'Criando conta...' : 'Criar conta grátis'}
          </button>

          <div className="text-center text-sm">
            <span style={{ color: '#888888' }}>Já tem conta? </span>
            <button
              onClick={() => {
                setScreen('login')
                setErrorMessage(null)
              }}
              className="font-semibold text-white hover:opacity-80 transition"
            >
              Entrar →
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION SCREEN */}
      {screen === 'confirmation' && (
        <div className="w-full max-w-md rounded-2xl p-8 border text-center" style={{ backgroundColor: '#111111', borderColor: '#333333' }}>
          <div className="text-center mb-8">
            <div className="text-3xl font-bold mb-2">Linkify</div>
          </div>

          <div className="space-y-6">
            <svg className="w-16 h-16 mx-auto" style={{ color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>

            <div>
              <h2 className="text-2xl font-bold mb-3">Confira seu e-mail</h2>
              <p style={{ color: '#888888' }} className="text-sm mb-4">
                Enviamos um email de confirmação para <strong>{confirmationEmail}</strong>. Verifique sua caixa de entrada e clique no link para ativar sua conta.
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
              style={{ backgroundColor: '#ffffff' }}
              className="w-full py-3 font-semibold rounded-lg text-black transition hover:opacity-90"
            >
              Voltar para login
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

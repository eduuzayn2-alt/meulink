"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

interface LinkItem {
  id: string
  user_id: string
  titulo: string
  url: string
  criado_em: string
  icon_name?: string
  icon_url?: string
}

interface ProfileData {
  id: string
  user_id: string
  nome: string
  bio: string
  foto_url: string
  plan?: string
  cover_url?: string
  username: string
}

const defaultIconOptions = [
  { value: '', label: 'Nenhum' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'Site', label: 'Site' },
  { value: 'Outro', label: 'Outro' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [nome, setNome] = useState('')
  const [bio, setBio] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [username, setUsername] = useState('')
  const [links, setLinks] = useState<LinkItem[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [linkIconName, setLinkIconName] = useState('')
  const [linkIconUrl, setLinkIconUrl] = useState('')
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState(false)

  const hasProfile = Boolean(username.trim())
  const previewLinks = useMemo(() => links.slice().reverse(), [links])

  const getFriendlyErrorMessage = (error: { message?: string } | null | undefined, fallback: string) => {
    const message = error?.message?.trim()
    if (!message) return fallback
    const lower = message.toLowerCase()
    if (lower.includes('network') || lower.includes('timeout') || lower.includes('fetch') || lower.includes('connection')) {
      return fallback
    }
    return message
  }

  const validateAndTransformUsername = (input: string) => {
    setUsernameError(null)
    if (!input) {
      setUsername('')
      return
    }
    const lowerInput = input.toLowerCase()
    const transformed = lowerInput.replace(/ +/g, '-')
    const validChars = /^[a-z0-9-]*$/.test(transformed)

    if (!validChars) {
      const invalid = transformed.replace(/[a-z0-9-]/g, '')
      setUsernameError(`Caracteres não permitidos: ${[...new Set(invalid)].join(', ')}`)
      return
    }

    setUsername(transformed)
  }

  const renderLinkIcon = (link: LinkItem) => {
    if (link.icon_url) {
      return (
        <img src={link.icon_url} alt={link.icon_name || 'Ícone'} className="h-10 w-10 rounded-full object-cover" />
      )
    }

    const label = link.icon_name || 'Link'
    const baseStyle = 'flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-xs font-semibold uppercase'

    switch (link.icon_name) {
      case 'Instagram':
        return <div className={`${baseStyle} text-pink-400`}>IG</div>
      case 'YouTube':
        return <div className={`${baseStyle} text-red-500`}>YT</div>
      case 'WhatsApp':
        return <div className={`${baseStyle} text-emerald-400`}>WA</div>
      case 'TikTok':
        return <div className={`${baseStyle} text-white`}>TT</div>
      case 'Site':
        return <div className={`${baseStyle} text-sky-400`}>WWW</div>
      case 'Outro':
        return <div className={`${baseStyle} text-zinc-300`}>OUT</div>
      default:
        return <div className={baseStyle}>{label.slice(0, 2)}</div>
    }
  }

  useEffect(() => {
    const initialize = async () => {
      setFetching(true)
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session?.user) {
        router.push('/login')
        return
      }

      const ownerId = data.session.user.id
      setUserId(ownerId)

      const [{ data: profileData, error: profileError }, { data: linkData, error: linkError }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', ownerId).maybeSingle(),
        supabase.from('links').select('*').eq('user_id', ownerId).order('criado_em', { ascending: false }),
      ])

      if (profileError || linkError) {
        setErrorMessage(
          getFriendlyErrorMessage(
            profileError ?? linkError,
            'Não foi possível carregar seus dados. Verifique sua conexão e tente novamente.'
          )
        )
      }

      if (profileData) {
        setProfile(profileData)
        setNome(profileData.nome ?? '')
        setBio(profileData.bio ?? '')
        setFotoUrl(profileData.foto_url ?? '')
        setCoverUrl(profileData.cover_url ?? '')
        setUsername(profileData.username ?? '')
      }

      if (linkError) {
        setErrorMessage(linkError.message)
      } else {
        setLinks(linkData ?? [])
      }

      // fetch subscriptions via server endpoint using session token
      try {
        const token = data.session.access_token
        if (token) {
          const subsRes = await fetch('/api/subscriptions', {
            headers: {
              'x-access-token': token,
              'x-user-id': ownerId,
            },
          })

          if (subsRes.ok) {
            const subs = await subsRes.json()
            setSubscriptions(subs ?? [])
          }
        }
      } catch (e) {
        // ignore subscription loading errors
      }

      setFetching(false)
    }

    initialize()
  }, [router])

  const handleFileChange = async (file: File | null) => {
    if (!file) return

    setProfileLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      const currentUserId = userData?.user?.id

      if (userError || !currentUserId) {
        setProfileLoading(false)
        setErrorMessage('Sessão expirada. Faça login novamente antes de enviar uma foto.')
        return
      }

      const filePath = `${currentUserId}-${Date.now()}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        setProfileLoading(false)
        setErrorMessage('Erro ao enviar a imagem. Verifique sua conexão e tente novamente.')
        return
      }

      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const publicUrl = (publicData as any)?.publicUrl ?? ''

      if (!publicUrl) {
        setProfileLoading(false)
        setErrorMessage('Erro ao obter URL pública da imagem.')
        return
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ foto_url: publicUrl })
        .eq('user_id', currentUserId)
        .select()
        .maybeSingle()

      setProfileLoading(false)

      if (updateError) {
        setErrorMessage('Erro ao salvar informação de perfil. Tente novamente.')
        return
      }

      setFotoUrl(publicUrl)
      if (updatedProfile) setProfile(updatedProfile)
      setSuccessMessage('Foto enviada com sucesso.')
    } catch (e) {
      setProfileLoading(false)
      setErrorMessage('Erro ao processar a imagem. Tente novamente.')
    }
  }

  const handleCoverChange = async (file: File | null) => {
    if (!file) return

    setProfileLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      const currentUserId = userData?.user?.id

      if (userError || !currentUserId) {
        setProfileLoading(false)
        setErrorMessage('Sessão expirada. Faça login novamente antes de enviar a imagem de capa.')
        return
      }

      const filePath = `cover-${currentUserId}-${Date.now()}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        setProfileLoading(false)
        setErrorMessage('Erro ao enviar a imagem. Verifique sua conexão e tente novamente.')
        return
      }

      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const publicUrl = (publicData as any)?.publicUrl ?? ''

      if (!publicUrl) {
        setProfileLoading(false)
        setErrorMessage('Erro ao obter URL pública da imagem.')
        return
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ cover_url: publicUrl })
        .eq('user_id', currentUserId)
        .select()
        .maybeSingle()

      setProfileLoading(false)

      if (updateError) {
        setErrorMessage('Erro ao salvar imagem de capa. Tente novamente.')
        return
      }

      setCoverUrl(publicUrl)
      if (updatedProfile) setProfile(updatedProfile)
      setSuccessMessage('Imagem de capa enviada com sucesso.')
    } catch (e) {
      setProfileLoading(false)
      setErrorMessage('Erro ao processar a imagem. Tente novamente.')
    }
  }

  const handleCreateProfile = async () => {
    if (!userId) {
      setErrorMessage('Sessão expirada. Faça login novamente.')
      return
    }

    if (!username.trim()) {
      setErrorMessage('Escolha um username para acessar sua página.')
      return
    }

    setProfileLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const safeFotoUrl = fotoUrl.startsWith('blob:') ? '' : fotoUrl.trim()
    const safeCoverUrl = coverUrl.startsWith('blob:') ? '' : coverUrl.trim()

    const profileData = {
      user_id: userId,
      nome: nome.trim(),
      bio: bio.trim(),
      foto_url: safeFotoUrl,
      cover_url: safeCoverUrl,
      username: username.trim(),
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'user_id' })
      .select()
      .maybeSingle()

    setProfileLoading(false)

    if (error) {
      setErrorMessage(
        getFriendlyErrorMessage(error, 'Erro ao salvar perfil. Verifique sua conexão e tente novamente.')
      )
      return
    }

    if (!data) {
      setErrorMessage('Erro ao salvar perfil. Nenhuma resposta do servidor. Tente novamente.')
      return
    }

    setProfile(data)
    setSuccessMessage('Perfil salvo com sucesso! Agora compartilhe seu link.')
  }

  const handleEditLink = (link: LinkItem) => {
    setTitle(link.titulo)
    setUrl(link.url)
    setLinkIconName(link.icon_name ?? '')
    setLinkIconUrl(link.icon_url ?? '')
    setEditingLinkId(link.id)
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const handleCancelEdit = () => {
    setEditingLinkId(null)
    setTitle('')
    setUrl('')
    setLinkIconName('')
    setLinkIconUrl('')
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const handleAddLink = async () => {
    if (!title.trim() || !url.trim() || !userId) return
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    // Enforce plan limits: free = 2, pro = 10
    const plan = profile?.plan ?? 'free'
    const maxLinks = plan === 'pro' ? 10 : 2
    if (!editingLinkId && links.length >= maxLinks) {
      setLoading(false)
      setShowUpgradeModal(true)
      return
    }
    if (editingLinkId) {
      const { data, error } = await supabase
        .from('links')
        .update({
          titulo: title.trim(),
          url: url.trim(),
          icon_name: linkIconName || null,
          icon_url: linkIconUrl.trim() || null,
        })
        .eq('id', editingLinkId)
        .eq('user_id', userId)
        .select()
        .single()

      setLoading(false)

      if (error || !data) {
        setErrorMessage(
          getFriendlyErrorMessage(error, 'Erro ao atualizar link. Verifique sua conexão e tente novamente.')
        )
        return
      }

      setLinks((current) => current.map((link) => (link.id === data.id ? data : link)))
      setEditingLinkId(null)
      setTitle('')
      setUrl('')
      setLinkIconName('')
      setLinkIconUrl('')
      setSuccessMessage('Link atualizado com sucesso.')
      return
    }

    const { data, error } = await supabase
      .from('links')
      .insert({
        user_id: userId,
        titulo: title.trim(),
        url: url.trim(),
        icon_name: linkIconName || null,
        icon_url: linkIconUrl.trim() || null,
      })
      .select()
      .single()

    setLoading(false)

    if (error || !data) {
      setErrorMessage(
        getFriendlyErrorMessage(error, 'Erro ao adicionar link. Verifique sua conexão e tente novamente.')
      )
      return
    }

    setLinks((current) => [data, ...current])
    setTitle('')
    setUrl('')
    setLinkIconName('')
    setLinkIconUrl('')
    setSuccessMessage('Link adicionado com sucesso.')
  }

  const handleDelete = async (id: string) => {
    if (!userId) return
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const { error } = await supabase.from('links').delete().eq('id', id).eq('user_id', userId)
    setLoading(false)

    if (error) {
      setErrorMessage(
        getFriendlyErrorMessage(error, 'Erro ao remover link. Verifique sua conexão e tente novamente.')
      )
      return
    }

    setLinks((current) => current.filter((link) => link.id !== id))
    setSuccessMessage('Link removido.')
  }

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDrop = (index: number) => {
    if (dragIndex === null) return
    const updated = [...links]
    const [moved] = updated.splice(dragIndex, 1)
    updated.splice(index, 0, moved)
    setLinks(updated)
    setDragIndex(null)
  }

  const shareUrl = `https://linkify.app.br/${username}`

  const copyShareLink = async () => {
    if (!username) {
      setErrorMessage('Defina um username para copiar o link.')
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (e) {
      setErrorMessage('Não foi possível copiar o link. Tente novamente.')
    }
  }

  const startCheckout = async (source = 'banner') => {
    setUpgradeLoading(true)
    setErrorMessage(null)

    let checkoutWindow: Window | null = null
    try {
      // Open a new window immediately to avoid popup blockers.
      checkoutWindow = window.open('about:blank', '_blank')

      // lightweight analytics: push to dataLayer and attempt beacon
      try {
        ;(window as any).dataLayer?.push?.({ event: 'subscribe_click', source })
      } catch (e) {}

      try {
        const { data: userData } = await supabase.auth.getUser()
        const email = userData?.user?.email

        // send a lightweight server-side event via sendBeacon (best-effort)
        try {
          const eventPayload = JSON.stringify({ event: 'subscribe_click', source, user_id: userId, timestamp: new Date().toISOString() })
          const blob = new Blob([eventPayload], { type: 'application/json' })
          const beaconOk = typeof navigator !== 'undefined' && (navigator as any).sendBeacon && (navigator as any).sendBeacon('/api/track-event', blob)
          if (!beaconOk) {
            // fallback to fetch (do not await to keep UX snappy)
            fetch('/api/track-event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: eventPayload }).catch(() => {})
          }
        } catch (e) {}

        // create Mercado Pago preference
        const res = await fetch('/api/criar-assinatura', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payer_email: email, user_id: userId }),
        })

        const json = await res.json()
        if (res.ok && (json.init_point || json.sandbox_init_point)) {
          const url = json.init_point ?? json.sandbox_init_point
          // open checkout in the new tab opened earlier
          if (checkoutWindow) {
            checkoutWindow.location.href = url
          } else {
            window.open(url, '_blank')
          }
          setUpgradeLoading(false)
          return
        }
      } catch (e) {
        // ignore inner errors
      }

      if (checkoutWindow) {
        checkoutWindow.close()
      }
      setErrorMessage('Não foi possível iniciar o checkout. Tente novamente.')
    } catch (e) {
      if (checkoutWindow) {
        checkoutWindow.close()
      }
      setErrorMessage('Erro ao iniciar checkout. Tente novamente.')
    }
    setUpgradeLoading(false)
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      router.push('/login')
    }
  }

  if (fetching) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4 py-10">
        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 px-10 py-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Carregando painel</p>
          <p className="mt-4 text-2xl font-semibold">Preparando seu espaço...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-72 bg-[#0b0b0b] border-r border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="text-lg font-bold">Menu</div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-zinc-400">✕</button>
            </div>
            <nav className="space-y-3">
              {['Visão geral', 'Links', 'Perfil', 'Ajustes'].map((item) => (
                <button key={item} className="w-full rounded-3xl px-4 py-3 text-left text-white transition hover:bg-white/5">
                  {item}
                </button>
              ))}
              <a href="/dashboard/relatorios" className="block rounded-3xl px-4 py-3 text-left text-white hover:bg-white/5">Relatórios</a>
            </nav>
            <div className="mt-8">
              {profile?.plan === 'pro' ? (
                <div>
                  <p className="font-semibold text-white">✓ Plano Pro</p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-white">Plano Gratuito</p>
                  <div className="mt-3">
                    <button onClick={() => { setMobileMenuOpen(false); startCheckout('sidebar') }} className="rounded-full bg-amber-400 px-4 py-2 font-semibold text-black">Upgrade Pro →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-8 xl:grid-cols-[260px_minmax(560px,1fr)_420px] xl:px-8">
        <aside className="hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 xl:block" id="left-sidebar">
          <div className="text-sm uppercase tracking-[0.3em] text-zinc-500">Navegação</div>
          <nav className="mt-8 space-y-3">
            {['Visão geral', 'Links', 'Perfil', 'Ajustes'].map((item) => (
              <button key={item} className="w-full rounded-3xl px-4 py-3 text-left text-white transition hover:bg-white/5">
                {item}
              </button>
            ))}
            <Link href="/dashboard/relatorios" className="w-full block rounded-3xl px-4 py-3 text-left text-white transition hover:bg-white/5">
              Relatórios
            </Link>
          </nav>
          <div className="mt-10 rounded-3xl border border-zinc-800 bg-[#101010] p-5 text-sm text-zinc-400">
            {profile?.plan === 'pro' ? (
              <div>
                <p className="font-semibold text-white">✓ Plano Pro</p>
                <p className="mt-3 text-sm leading-6 text-emerald-400">Aproveite recursos premium</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-white">Plano Gratuito</p>
                <p className="mt-3 text-sm leading-6 text-zinc-500">Atualize para desbloquear mais recursos.</p>
                <div className="mt-4">
                  <button onClick={() => startCheckout('sidebar')} className="rounded-full bg-amber-400 px-4 py-2 font-semibold text-black">Upgrade Pro →</button>
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Painel</p>
                <div className="flex items-center gap-3">
                  <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Crie sua página Linkify</h1>
                  {profile?.plan === 'pro' && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold text-black">✓ Plano Pro ativo</span>
                  )}
                </div>
                <p className="mt-3 max-w-2xl text-zinc-400">
                  Um painel leve para construir sua página pública com perfil, links e visualização ao vivo.
                </p>
              </div>
              <div className="rounded-3xl border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-zinc-300 flex items-center gap-3">
                <div className="hidden xl:block">{hasProfile ? null : 'Comece pelo onboarding'}</div>
                <button
                  onClick={handleSignOut}
                  className="ml-2 inline-flex items-center rounded-full border border-zinc-700 bg-transparent px-3 py-1 text-sm text-zinc-300 hover:bg-white/3"
                >
                  Sair
                </button>
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="ml-2 xl:hidden inline-flex items-center rounded-full border border-zinc-700 bg-transparent px-3 py-1 text-sm text-zinc-300 hover:bg-white/3"
                  aria-label="Abrir menu"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {/* Status bar for free users */}
          {profile?.plan !== 'pro' && (
            <div className="w-full rounded-xl bg-amber-400/95 border border-amber-500 p-3 text-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">⚡</span>
                <div className="text-sm font-semibold">Plano Gratuito — {links.length}/2 links usados</div>
              </div>
              <div>
                <button
                  onClick={() => startCheckout('banner')}
                  className="rounded-full bg-white px-4 py-2 font-semibold text-black"
                >
                  Upgrade para Pro R$9,90/mês →
                </button>
              </div>
            </div>
          )}

          {errorMessage ? (
            <div className="rounded-[2rem] border border-red-700 bg-red-950/80 p-5 text-sm text-red-200">{errorMessage}</div>
          ) : null}
          {successMessage ? (
            <div className="rounded-[2rem] border border-emerald-600 bg-emerald-950/80 p-5 text-sm text-emerald-200">{successMessage}</div>
          ) : null}

          {!hasProfile ? (
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
              <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Onboarding</p>
                    <h2 className="mt-3 text-2xl font-semibold">Escolha a base da sua página</h2>
                    <p className="mt-2 text-zinc-400">
                      Defina seu username, nome, bio e foto. Em seguida, crie sua página e adicione links.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <label className="block text-sm text-zinc-300">
                      Username
                      <input
                        value={username}
                        onChange={(event) => validateAndTransformUsername(event.target.value)}
                        placeholder="seunome"
                        className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
                      />
                      {usernameError ? (
                        <span className="mt-2 block text-xs text-red-400">{usernameError}</span>
                      ) : (
                        <span className="mt-2 block text-xs text-zinc-500">linkify.app.br/{username || 'seunome'}</span>
                      )}
                    </label>
                    <label className="block text-sm text-zinc-300">
                      Nome completo
                      <input
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                        placeholder="Julia Souza"
                        className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
                      />
                    </label>
                    <label className="block text-sm text-zinc-300">
                      Bio
                      <textarea
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        placeholder="Designer e criadora de conteúdo digital"
                        rows={4}
                        className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
                      />
                    </label>
                    <label className="block text-sm text-zinc-300">
                      Imagem de capa
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleCoverChange(event.target.files?.[0] ?? null)}
                        className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
                      />
                    </label>
                    <label className="block text-sm text-zinc-300">
                      Foto de perfil
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                        className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
                      />
                    </label>
                  </div>

                  <button
                    onClick={handleCreateProfile}
                    disabled={profileLoading}
                    className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
                  >
                    {profileLoading ? 'Criando...' : 'Criar minha página'}
                  </button>
                </div>

                <div className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-6 text-center">
                  <div className="mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
                    {fotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={fotoUrl} alt="Preview da foto" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl text-zinc-500">+</div>
                    )}
                  </div>
                  <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Preview</p>
                  <p className="mt-4 text-lg font-semibold">Sua página começa aqui</p>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Escolha um username e personalize seu perfil para deixar a página com a sua cara.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Editor de perfil</p>
                    <h2 className="mt-3 text-2xl font-semibold">Ajuste sua presença</h2>
                  </div>
                  <a
                    href={`https://linkify.app.br/${username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                  >
                    Ver minha página
                  </a>
                </div>

                <div className="mt-8 grid gap-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <label className="block text-sm text-zinc-300">
                      Nome
                      <input
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                        className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
                      />
                    </label>
                    <label className="block text-sm text-zinc-300">
                      Username
                      <input
                        value={username}
                        onChange={(event) => validateAndTransformUsername(event.target.value)}
                        className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
                      />
                      {usernameError ? (
                        <span className="mt-2 block text-xs text-red-400">{usernameError}</span>
                      ) : null}
                    </label>
                  </div>
                  <label className="block text-sm text-zinc-300">
                    Bio
                    <textarea
                      value={bio}
                      onChange={(event) => setBio(event.target.value)}
                      rows={3}
                      className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
                    />
                  </label>
                  <label className="block text-sm text-zinc-300">
                    Imagem de capa
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleCoverChange(event.target.files?.[0] ?? null)}
                      className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
                    />
                  </label>
                  <label className="block text-sm text-zinc-300">
                    Foto de perfil
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                      className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
                    />
                  </label>
                  <button
                    onClick={handleCreateProfile}
                    disabled={profileLoading}
                    className="mt-3 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
                  >
                    {profileLoading ? 'Atualizando...' : 'Salvar perfil'}
                  </button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Editor de links</p>
                    <h2 className="mt-3 text-2xl font-semibold">Organize seus links</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {editingLinkId ? (
                      <button
                        onClick={handleCancelEdit}
                        className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30"
                      >
                        Cancelar edição
                      </button>
                    ) : null}
                    <button
                      onClick={handleAddLink}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
                    >
                      {editingLinkId ? 'Salvar alterações' : '+ Adicionar'}
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
                  <label className="block text-sm text-zinc-300">
                    Título do link
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
                    />
                  </label>
                  <label className="block text-sm text-zinc-300">
                    URL
                    <input
                      value={url}
                      onChange={(event) => setUrl(event.target.value)}
                      className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
                    />
                  </label>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
                  <label className="block text-sm text-zinc-300">
                    Ícone padrão
                    <select
                      value={linkIconName}
                      onChange={(event) => setLinkIconName(event.target.value)}
                      className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
                    >
                      {defaultIconOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-[#0a0a0a] text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm text-zinc-300">
                    URL do ícone/foto
                    <input
                      value={linkIconUrl}
                      onChange={(event) => setLinkIconUrl(event.target.value)}
                      placeholder="https://..."
                      className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
                    />
                  </label>
                </div>

                {links.length === 0 ? (
                  <div className="mt-8 rounded-[2rem] border border-dashed border-zinc-700 bg-[#111111] p-8 text-center text-zinc-500">
                    Nenhum link ainda. Crie o primeiro para aparecer no preview.
                  </div>
                ) : (
                  <div className="mt-8 space-y-3">
                    {links.map((link, index) => (
                      <div
                        key={link.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleDrop(index)}
                        className="group flex items-center justify-between gap-4 rounded-[1.75rem] border border-zinc-800 bg-[#111111] px-5 py-4 transition hover:border-white/20"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900 text-xl text-zinc-400">
                            {renderLinkIcon(link)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">{link.titulo}</p>
                            <p className="truncate text-sm text-zinc-500">{link.url}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditLink(link)}
                            className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(link.id)}
                            className="rounded-full border border-red-600 bg-red-600/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-600/20"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upgrade card below links for free users */}
                {profile?.plan !== 'pro' && (
                  <div className="mt-6 rounded-2xl border-2 border-amber-400 bg-[#0b0b0b] p-6">
                    <div className="flex items-start gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">Desbloqueie todo o potencial do Linkify</h3>
                        <ul className="mt-3 text-sm space-y-2 text-zinc-300">
                          <li>• Até 10 links — mais espaço para vender</li>
                          <li>• Loja com Pix integrada</li>
                          <li>• Sem marca d'água</li>
                          <li>• Analytics avançado</li>
                        </ul>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <div className="text-2xl font-bold text-amber-300">R$9,90/mês</div>
                        <button
                          onClick={() => startCheckout('card')}
                          className="mt-4 rounded-full bg-amber-400 px-6 py-3 font-semibold text-black"
                        >
                          Assinar Pro agora →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <aside className="hidden md:block rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Preview</p>
              <h2 className="mt-3 text-2xl font-semibold">Página pública</h2>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full border border-zinc-800 bg-[#111111] px-4 py-2 text-sm text-white transition hover:border-white/20"
            >
              {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
            </button>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex-1 overflow-hidden rounded-full border border-zinc-800 bg-[#0b0b0b] px-4 py-3">
              <p className="text-xs text-zinc-400">Seu link público</p>
              <div className="mt-1 flex items-center gap-3">
                <span className="truncate font-medium text-white">{username ? `linkify.app.br/${username}` : 'linkify.app.br/seunome'}</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={copyShareLink}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  isCopied
                    ? 'bg-emerald-600 text-white'
                    : username
                    ? 'bg-white text-black hover:bg-zinc-200'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
                disabled={!username}
              >
                {isCopied ? '✓ Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className={`mt-8 rounded-[2rem] border border-zinc-800 p-6 ${
            theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-white text-slate-950'
          }`}>
            {coverUrl ? (
              <div className="mb-6 h-32 overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverUrl} alt="Imagem de capa" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="mb-6 h-32 rounded-[1.5rem] border border-dashed border-zinc-700 bg-[#0b0b0b]" />
            )}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full border border-zinc-800 bg-zinc-900 overflow-hidden">
                {fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fotoUrl} alt="Foto" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl text-zinc-500">?</div>
                )}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{username ? `linkify.app/${username}` : 'linkify.app/seunome'}</p>
                <h3 className="mt-2 text-2xl font-semibold">{nome || 'Seu nome aqui'}</h3>
                <p className={`mt-2 max-w-xs text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}`}>{bio || 'Uma bio leve para falar do seu trabalho, talentos e links.'}</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
                <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-400">
                  <div className="font-semibold text-white">Assinaturas</div>
                  {subscriptions.length === 0 ? (
                    <div className="mt-2 text-zinc-500">Nenhuma assinatura encontrada.</div>
                  ) : (
                    <ul className="mt-2 space-y-2 text-zinc-300">
                      {subscriptions.map((s) => (
                        <li key={s.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{s.status}</div>
                            <div className="text-xs text-zinc-500">{s.currency} {s.amount}</div>
                          </div>
                          <div className="text-xs text-zinc-500">{new Date(s.created_at).toLocaleString()}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              {previewLinks.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-zinc-700 bg-zinc-900/70 p-6 text-center text-zinc-500">
                  Seus links aparecerão aqui depois de adicionados.
                </div>
              ) : (
                  previewLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`block rounded-[1.5rem] border px-5 py-4 transition ${
                      theme === 'dark'
                        ? 'border-zinc-800 bg-zinc-950 text-white hover:border-white/20 hover:bg-zinc-900'
                        : 'border-slate-200 bg-slate-50 text-slate-950 hover:border-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <p className="font-semibold">{link.titulo}</p>
                    {link.icon_name !== 'WhatsApp' && (
                      <p className="mt-1 text-sm text-zinc-400 truncate">{link.url}</p>
                    )}
                  </a>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
          {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-lg rounded-2xl bg-[#0b0b0b] border border-zinc-800 p-6">
            <h3 className="text-lg font-bold">Amplie seu alcance com Linkify Pro</h3>
            <p className="mt-2 text-sm text-zinc-400">Você já aproveita o essencial — agora imagine o próximo nível: até 10 links, loja com Pix integrada para vender imediatamente, remoção da marca d'água e analytics avançado para aumentar suas conversões. Atualize para o Pro e comece a transformar cliques em vendas.</p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="rounded-full px-4 py-2 bg-transparent border border-zinc-700 text-sm text-zinc-200"
              >
                Fechar
              </button>
              <button
                onClick={() => startCheckout('modal')}
                className="rounded-full px-4 py-2 bg-emerald-600 text-black font-semibold"
              >
                {upgradeLoading ? 'Abrindo...' : 'Assinar Pro por R$9,90/mês'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}

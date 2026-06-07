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

interface ProductItem {
  id: string
  user_id: string
  username: string
  nome: string
  descricao: string | null
  preco: string
  imagem_url: string | null
  tipo_entrega: 'arquivo' | 'link'
  arquivo_url: string | null
  link_externo: string | null
  slug: string
  ativo: boolean
  total_vendas: number
  criado_em: string
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
  const [products, setProducts] = useState<ProductItem[]>([])

  // ── ANALYTICS STATE ──
  const [analytics, setAnalytics] = useState<{
    visitors: number | null
    clicks: number | null
    topLink: string | null
  }>({ visitors: null, clicks: null, topLink: null })

  const hasProfile = Boolean(username.trim())
  const previewLinks = useMemo(() => links.slice().reverse(), [links])

  const getFriendlyErrorMessage = (error: { message?: string } | null | undefined, fallback: string) => {
    const message = error?.message?.trim()
    if (!message) return fallback
    const lower = message.toLowerCase()
    if (lower.includes('network') || lower.includes('timeout') || lower.includes('fetch') || lower.includes('connection')) return fallback
    return message
  }

  const validateAndTransformUsername = (input: string) => {
    setUsernameError(null)
    if (!input) { setUsername(''); return }
    const transformed = input.toLowerCase().replace(/ +/g, '-')
    if (!/^[a-z0-9-]*$/.test(transformed)) {
      const invalid = transformed.replace(/[a-z0-9-]/g, '')
      setUsernameError(`Caracteres não permitidos: ${[...new Set(invalid)].join(', ')}`)
      return
    }
    setUsername(transformed)
  }

  const renderLinkIcon = (link: LinkItem) => {
    if (link.icon_url) return <img src={link.icon_url} alt={link.icon_name || 'Ícone'} className="h-8 w-8 rounded-lg object-cover" />
    const label = link.icon_name || 'Link'
    const base = 'flex h-8 w-8 items-center justify-center rounded-lg bg-[#18181b] text-[10px] font-semibold uppercase'
    switch (link.icon_name) {
      case 'Instagram': return <div className={`${base} text-pink-500`}>IG</div>
      case 'YouTube': return <div className={`${base} text-red-500`}>YT</div>
      case 'WhatsApp': return <div className={`${base} text-green-500`}>WA</div>
      case 'TikTok': return <div className={`${base} text-white`}>TT</div>
      case 'Site': return <div className={`${base} text-sky-400`}>WWW</div>
      case 'Outro': return <div className={`${base} text-[#71717a]`}>OUT</div>
      default: return <div className={`${base} text-[#7c3aed]`}>{label.slice(0, 2)}</div>
    }
  }

  useEffect(() => {
    const initialize = async () => {
      setFetching(true)
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session?.user) { router.push('/login'); return }
      const ownerId = data.session.user.id
      setUserId(ownerId)

      const [{ data: profileData, error: profileError }, { data: linkData, error: linkError }, { data: productData, error: productError }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', ownerId).maybeSingle(),
        supabase.from('links').select('*').eq('user_id', ownerId).order('criado_em', { ascending: false }),
        supabase.from('produtos').select('*').eq('user_id', ownerId).order('criado_em', { ascending: false }),
      ])

      if (profileError || linkError || productError) setErrorMessage(getFriendlyErrorMessage(profileError ?? linkError ?? productError, 'Não foi possível carregar seus dados.'))
      if (profileData) { setProfile(profileData); setNome(profileData.nome ?? ''); setBio(profileData.bio ?? ''); setFotoUrl(profileData.foto_url ?? ''); setCoverUrl(profileData.cover_url ?? ''); setUsername(profileData.username ?? '') }
      if (linkError) setErrorMessage(linkError.message); else setLinks(linkData ?? [])
      if (productError) setErrorMessage(getFriendlyErrorMessage(productError, 'Não foi possível carregar seus produtos.')); else setProducts(productData ?? [])

      try {
        const token = data.session.access_token
        if (token) {
          const subsRes = await fetch('/api/subscriptions', { headers: { 'x-access-token': token, 'x-user-id': ownerId } })
          if (subsRes.ok) { const subs = await subsRes.json(); setSubscriptions(subs ?? []) }
        }
      } catch (e) {}

      // ── BUSCA ANALYTICS ──
      try {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const since = thirtyDaysAgo.toISOString()

        const [{ count: visitorCount }, { count: clickCount }, { data: clickData }] = await Promise.all([
          supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('user_id', ownerId).eq('event_type', 'page_view').gte('criado_em', since),
          supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('user_id', ownerId).eq('event_type', 'link_click').gte('criado_em', since),
          supabase.from('analytics_events').select('link_title').eq('user_id', ownerId).eq('event_type', 'link_click').gte('criado_em', since),
        ])

        const linkCounts: Record<string, number> = {}
        clickData?.forEach((e: any) => {
          if (e.link_title) linkCounts[e.link_title] = (linkCounts[e.link_title] || 0) + 1
        })
        const topLink = Object.entries(linkCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

        setAnalytics({ visitors: visitorCount ?? 0, clicks: clickCount ?? 0, topLink })
      } catch (e) {
        // ignora erros de analytics
      }

      setFetching(false)
    }
    initialize()
  }, [router])

  const handleFileChange = async (file: File | null) => {
    if (!file) return
    setProfileLoading(true); setErrorMessage(null); setSuccessMessage(null)
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      const currentUserId = userData?.user?.id
      if (userError || !currentUserId) { setProfileLoading(false); setErrorMessage('Sessão expirada.'); return }
      const filePath = `${currentUserId}-${Date.now()}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
      if (uploadError) { setProfileLoading(false); setErrorMessage('Erro ao enviar imagem.'); return }
      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const publicUrl = (publicData as any)?.publicUrl ?? ''
      if (!publicUrl) { setProfileLoading(false); setErrorMessage('Erro ao obter URL da imagem.'); return }
      const { data: updatedProfile, error: updateError } = await supabase.from('profiles').update({ foto_url: publicUrl }).eq('user_id', currentUserId).select().maybeSingle()
      setProfileLoading(false)
      if (updateError) { setErrorMessage('Erro ao salvar foto.'); return }
      setFotoUrl(publicUrl); if (updatedProfile) setProfile(updatedProfile); setSuccessMessage('Foto enviada com sucesso.')
    } catch (e) { setProfileLoading(false); setErrorMessage('Erro ao processar imagem.') }
  }

  const handleCoverChange = async (file: File | null) => {
    if (!file) return
    setProfileLoading(true); setErrorMessage(null); setSuccessMessage(null)
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      const currentUserId = userData?.user?.id
      if (userError || !currentUserId) { setProfileLoading(false); setErrorMessage('Sessão expirada.'); return }
      const filePath = `cover-${currentUserId}-${Date.now()}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
      if (uploadError) { setProfileLoading(false); setErrorMessage('Erro ao enviar imagem.'); return }
      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const publicUrl = (publicData as any)?.publicUrl ?? ''
      if (!publicUrl) { setProfileLoading(false); setErrorMessage('Erro ao obter URL.'); return }
      const { data: updatedProfile, error: updateError } = await supabase.from('profiles').update({ cover_url: publicUrl }).eq('user_id', currentUserId).select().maybeSingle()
      setProfileLoading(false)
      if (updateError) { setErrorMessage('Erro ao salvar capa.'); return }
      setCoverUrl(publicUrl); if (updatedProfile) setProfile(updatedProfile); setSuccessMessage('Capa enviada com sucesso.')
    } catch (e) { setProfileLoading(false); setErrorMessage('Erro ao processar imagem.') }
  }

  const handleCreateProfile = async () => {
    if (!userId) { setErrorMessage('Sessão expirada.'); return }
    if (!username.trim()) { setErrorMessage('Escolha um username.'); return }
    setProfileLoading(true); setErrorMessage(null); setSuccessMessage(null)
    const safeFotoUrl = fotoUrl.startsWith('blob:') ? '' : fotoUrl.trim()
    const safeCoverUrl = coverUrl.startsWith('blob:') ? '' : coverUrl.trim()
    const { data, error } = await supabase.from('profiles').upsert({ user_id: userId, nome: nome.trim(), bio: bio.trim(), foto_url: safeFotoUrl, cover_url: safeCoverUrl, username: username.trim() }, { onConflict: 'user_id' }).select().maybeSingle()
    setProfileLoading(false)
    if (error) { setErrorMessage(getFriendlyErrorMessage(error, 'Erro ao salvar perfil.')); return }
    if (!data) { setErrorMessage('Erro ao salvar perfil.'); return }
    setProfile(data); setSuccessMessage('Perfil salvo com sucesso!')
  }

  const handleEditLink = (link: LinkItem) => { setTitle(link.titulo); setUrl(link.url); setLinkIconName(link.icon_name ?? ''); setLinkIconUrl(link.icon_url ?? ''); setEditingLinkId(link.id); setErrorMessage(null); setSuccessMessage(null) }
  const handleCancelEdit = () => { setEditingLinkId(null); setTitle(''); setUrl(''); setLinkIconName(''); setLinkIconUrl(''); setErrorMessage(null); setSuccessMessage(null) }

  const handleAddLink = async () => {
    if (!title.trim() || !url.trim() || !userId) return
    setLoading(true); setErrorMessage(null); setSuccessMessage(null)
    const plan = profile?.plan ?? 'free'
    const maxLinks = plan === 'pro' ? 10 : 2
    if (!editingLinkId && links.length >= maxLinks) { setLoading(false); setShowUpgradeModal(true); return }
    if (editingLinkId) {
      const { data, error } = await supabase.from('links').update({ titulo: title.trim(), url: url.trim(), icon_name: linkIconName || null, icon_url: linkIconUrl.trim() || null }).eq('id', editingLinkId).eq('user_id', userId).select().single()
      setLoading(false)
      if (error || !data) { setErrorMessage(getFriendlyErrorMessage(error, 'Erro ao atualizar link.')); return }
      setLinks((c) => c.map((l) => (l.id === data.id ? data : l))); setEditingLinkId(null); setTitle(''); setUrl(''); setLinkIconName(''); setLinkIconUrl(''); setSuccessMessage('Link atualizado.')
      return
    }
    const { data, error } = await supabase.from('links').insert({ user_id: userId, titulo: title.trim(), url: url.trim(), icon_name: linkIconName || null, icon_url: linkIconUrl.trim() || null }).select().single()
    setLoading(false)
    if (error || !data) { setErrorMessage(getFriendlyErrorMessage(error, 'Erro ao adicionar link.')); return }
    setLinks((c) => [data, ...c]); setTitle(''); setUrl(''); setLinkIconName(''); setLinkIconUrl(''); setSuccessMessage('Link adicionado.')
  }

  const handleDelete = async (id: string) => {
    if (!userId) return
    setLoading(true); setErrorMessage(null); setSuccessMessage(null)
    const { error } = await supabase.from('links').delete().eq('id', id).eq('user_id', userId)
    setLoading(false)
    if (error) { setErrorMessage(getFriendlyErrorMessage(error, 'Erro ao remover link.')); return }
    setLinks((c) => c.filter((l) => l.id !== id)); setSuccessMessage('Link removido.')
  }

  const handleDragStart = (index: number) => setDragIndex(index)
  const handleDrop = (index: number) => {
    if (dragIndex === null) return
    const updated = [...links]; const [moved] = updated.splice(dragIndex, 1); updated.splice(index, 0, moved)
    setLinks(updated); setDragIndex(null)
  }

  const shareUrl = `https://linkify.app.br/${username}`
  const copyShareLink = async () => {
    if (!username) { setErrorMessage('Defina um username para copiar o link.'); return }
    try { await navigator.clipboard.writeText(shareUrl); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000) }
    catch (e) { setErrorMessage('Não foi possível copiar o link.') }
  }

  const startCheckout = async (source = 'banner') => {
    setUpgradeLoading(true); setErrorMessage(null)
    if (!userId) { setErrorMessage('Sessão expirada.'); setUpgradeLoading(false); return }
    let checkoutWindow: Window | null = null
    try {
      checkoutWindow = window.open('about:blank', '_blank')
      try { ;(window as any).dataLayer?.push?.({ event: 'subscribe_click', source }) } catch (e) {}
      try {
        const { data: userData } = await supabase.auth.getUser()
        const email = userData?.user?.email
        try {
          const eventPayload = JSON.stringify({ event: 'subscribe_click', source, user_id: userId, timestamp: new Date().toISOString() })
          const blob = new Blob([eventPayload], { type: 'application/json' })
          const beaconOk = typeof navigator !== 'undefined' && (navigator as any).sendBeacon && (navigator as any).sendBeacon('/api/track-event', blob)
          if (!beaconOk) fetch('/api/track-event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: eventPayload }).catch(() => {})
        } catch (e) {}
        const res = await fetch('/api/criar-assinatura', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payer_email: email, user_id: userId }) })
        const json = await res.json()
        if (res.ok && (json.init_point || json.sandbox_init_point)) {
          const url = json.init_point ?? json.sandbox_init_point
          if (checkoutWindow) checkoutWindow.location.href = url; else window.open(url, '_blank')
          setUpgradeLoading(false); return
        }
      } catch (e) {}
      if (checkoutWindow) checkoutWindow.close()
      setErrorMessage('Não foi possível iniciar o checkout.')
    } catch (e) { if (checkoutWindow) checkoutWindow.close(); setErrorMessage('Erro ao iniciar checkout.') }
    setUpgradeLoading(false)
  }

  const handleSignOut = async () => { try { await supabase.auth.signOut() } finally { router.push('/login') } }

  const formatNum = (n: number | null) => n === null ? '—' : n.toLocaleString('pt-BR')

  if (fetching) {
    return (
      <main className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
        <div className="rounded-2xl border border-[#1c1c1e] bg-[#111113] px-10 py-8 text-center">
          <p className="text-xs uppercase tracking-widest text-[#7c3aed]">Carregando painel</p>
          <p className="mt-3 text-lg font-medium text-[#fafafa]">Preparando seu espaço...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-[#fafafa]">

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-40 border-b border-[#1c1c1e] bg-[#09090b]/95 backdrop-blur-sm px-4 sm:px-6">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><rect x="3" y="2" width="9" height="14" rx="2" transform="skewX(-8)" fill="#7c3aed"/><rect x="10" y="9" width="9" height="8" rx="2" transform="skewX(-8)" fill="#7c3aed"/></svg>
              <span className="text-sm font-medium text-[#fafafa]">Linkify</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              <button onClick={() => document.getElementById('links')?.scrollIntoView({behavior:'smooth'})} className="rounded-full bg-[#18181b] px-3 py-1.5 text-xs font-medium text-[#fafafa]">Links</button>
              <Link href="/dashboard/relatorios" className="rounded-full px-3 py-1.5 text-xs text-[#71717a] hover:text-[#fafafa] transition">Analytics</Link>
              <button onClick={() => document.getElementById('loja')?.scrollIntoView({behavior:'smooth'})} className="rounded-full px-3 py-1.5 text-xs text-[#71717a] hover:text-[#fafafa] transition">Loja</button>
              <button onClick={() => document.getElementById('perfil')?.scrollIntoView({behavior:'smooth'})} className="rounded-full px-3 py-1.5 text-xs text-[#71717a] hover:text-[#fafafa] transition">Perfil</button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {profile?.plan === 'pro' && (
              <span className="hidden sm:inline-flex items-center rounded-full border border-[#27272a] bg-[#18181b] px-2.5 py-1 text-xs font-medium text-[#7c3aed]">✓ Pro</span>
            )}
            <button onClick={handleSignOut} className="rounded-full border border-[#27272a] px-3 py-1.5 text-xs text-[#71717a] hover:text-[#fafafa] transition">Sair</button>
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden rounded-full border border-[#27272a] px-3 py-1.5 text-xs text-[#71717a]" aria-label="Menu">☰</button>
          </div>
        </div>
      </header>

      {/* ── STATS BAR ── */}
      <div className="border-b border-[#1c1c1e]">
        <div className="mx-auto max-w-7xl grid grid-cols-3 divide-x divide-[#1c1c1e]">
          <div className="px-4 sm:px-6 py-4">
            <p className="text-[10px] uppercase tracking-wider text-[#52525b] mb-1">Visitantes</p>
            <p className="text-xl font-medium text-[#fafafa]">{formatNum(analytics.visitors)}</p>
            <p className="text-[11px] text-[#52525b] mt-0.5">últimos 30 dias</p>
          </div>
          <div className="px-4 sm:px-6 py-4">
            <p className="text-[10px] uppercase tracking-wider text-[#52525b] mb-1">Cliques</p>
            <p className="text-xl font-medium text-[#fafafa]">{formatNum(analytics.clicks)}</p>
            <p className="text-[11px] text-[#52525b] mt-0.5">últimos 30 dias</p>
          </div>
          <div className="px-4 sm:px-6 py-4">
            <p className="text-[10px] uppercase tracking-wider text-[#52525b] mb-1">Link mais clicado</p>
            <p className="text-base font-medium text-[#fafafa] mt-1 truncate">{analytics.topLink ?? '—'}</p>
            <p className="text-[11px] text-[#52525b] mt-0.5">{analytics.topLink ? 'últimos 30 dias' : 'sem dados ainda'}</p>
          </div>
        </div>
      </div>

      {/* ── FREE PLAN BANNER ── */}
      {profile?.plan !== 'pro' && (
        <div className="border-b border-[#1c1c1e] bg-[#0d0d0d] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm flex-shrink-0">⚡</span>
            <span className="text-xs text-[#a1a1aa] truncate">Plano Gratuito — {links.length}/2 links usados</span>
          </div>
          <button onClick={() => startCheckout('banner')} className="flex-shrink-0 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-medium text-black hover:bg-amber-400 transition">
            Upgrade Pro R$9,90/mês →
          </button>
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div className="mx-auto max-w-7xl xl:grid xl:grid-cols-[1fr_360px]">
        <div className="border-r border-[#1c1c1e] divide-y divide-[#1c1c1e]">

          {/* LINKS SECTION */}
          <div className="p-5 sm:p-6" id="links">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#7c3aed] mb-1">Seus links</p>
                <h2 className="text-base font-medium text-[#fafafa]">Organize seus links</h2>
              </div>
              {editingLinkId && (
                <button onClick={handleCancelEdit} className="rounded-full border border-[#27272a] px-3 py-1.5 text-xs text-[#71717a] hover:text-[#fafafa] transition">Cancelar</button>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 mb-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do link" className="rounded-xl border border-[#27272a] bg-[#111113] px-4 py-2.5 text-sm text-[#fafafa] placeholder-[#3f3f46] outline-none focus:border-[#7c3aed] transition" />
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="rounded-xl border border-[#27272a] bg-[#111113] px-4 py-2.5 text-sm text-[#fafafa] placeholder-[#3f3f46] outline-none focus:border-[#7c3aed] transition" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 mb-4">
              <select value={linkIconName} onChange={(e) => setLinkIconName(e.target.value)} className="rounded-xl border border-[#27272a] bg-[#111113] px-4 py-2.5 text-sm text-[#71717a] outline-none focus:border-[#7c3aed] transition">
                {defaultIconOptions.map((o) => <option key={o.value} value={o.value} className="bg-[#111113] text-[#fafafa]">{o.label}</option>)}
              </select>
              <input value={linkIconUrl} onChange={(e) => setLinkIconUrl(e.target.value)} placeholder="URL do ícone (opcional)" className="rounded-xl border border-[#27272a] bg-[#111113] px-4 py-2.5 text-sm text-[#fafafa] placeholder-[#3f3f46] outline-none focus:border-[#7c3aed] transition" />
            </div>
            <button onClick={handleAddLink} disabled={loading} className="rounded-full bg-[#7c3aed] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#6d28d9] disabled:opacity-50 transition">
              {loading ? (editingLinkId ? 'Salvando...' : 'Adicionando...') : (editingLinkId ? 'Salvar alterações' : '+ Adicionar link')}
            </button>
            {links.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-[#27272a] p-8 text-center text-sm text-[#3f3f46]">Nenhum link ainda. Adicione o primeiro acima.</div>
            ) : (
              <div className="mt-4 space-y-2">
                {links.map((link, index) => (
                  <div key={link.id} draggable onDragStart={() => handleDragStart(index)} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(index)}
                    className="flex items-center gap-3 rounded-xl border border-[#1c1c1e] bg-[#111113] px-4 py-3 hover:border-[#27272a] transition cursor-grab active:cursor-grabbing">
                    <div className="flex-shrink-0">{renderLinkIcon(link)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#fafafa]">{link.titulo}</p>
                      <p className="truncate text-xs text-[#52525b]">{link.url}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleEditLink(link)} className="rounded-full border border-[#27272a] px-3 py-1 text-xs text-[#a1a1aa] hover:text-[#fafafa] transition">Editar</button>
                      <button onClick={() => handleDelete(link.id)} className="rounded-full border border-[#3f1515] px-3 py-1 text-xs text-[#ef4444] hover:bg-[#3f1515]/20 transition">Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {profile?.plan !== 'pro' && (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/20 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-amber-400 mb-2">Desbloqueie o Linkify Pro</h3>
                    <ul className="space-y-1 text-xs text-[#71717a]">
                      <li>• Até 10 links</li><li>• Loja com Pix integrada</li><li>• Sem marca d'água</li><li>• Analytics avançado</li>
                    </ul>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-base font-medium text-amber-400">R$9,90/mês</div>
                    <button onClick={() => startCheckout('card')} className="mt-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-medium text-black hover:bg-amber-400 transition">Assinar →</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PROFILE SECTION */}
          <div className="p-5 sm:p-6" id="perfil">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#7c3aed] mb-1">Meu perfil público</p>
                <h2 className="text-base font-medium text-[#fafafa]">Nome, bio e foto da sua página</h2>
              </div>
              {hasProfile && (
                <a href={`https://linkify.app.br/${username}`} target="_blank" rel="noreferrer" className="rounded-full border border-[#27272a] px-3 py-1.5 text-xs text-[#71717a] hover:text-[#fafafa] hover:border-[#7c3aed]/50 transition">Ver página ↗</a>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 mb-3">
              <div>
                <label className="block text-xs text-[#52525b] mb-1.5">Nome</label>
                <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome completo" className="w-full rounded-xl border border-[#27272a] bg-[#111113] px-4 py-2.5 text-sm text-[#fafafa] placeholder-[#3f3f46] outline-none focus:border-[#7c3aed] transition" />
              </div>
              <div>
                <label className="block text-xs text-[#52525b] mb-1.5">Username</label>
                <input value={username} onChange={(e) => validateAndTransformUsername(e.target.value)} placeholder="seunome" className="w-full rounded-xl border border-[#27272a] bg-[#111113] px-4 py-2.5 text-sm text-[#fafafa] placeholder-[#3f3f46] outline-none focus:border-[#7c3aed] transition" />
                {usernameError ? <span className="mt-1 block text-xs text-red-400">{usernameError}</span> : <span className="mt-1 block text-xs text-[#3f3f46]">linkify.app.br/{username || 'seunome'}</span>}
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs text-[#52525b] mb-1.5">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} placeholder="Fale sobre você em uma linha" className="w-full rounded-xl border border-[#27272a] bg-[#111113] px-4 py-2.5 text-sm text-[#fafafa] placeholder-[#3f3f46] outline-none focus:border-[#7c3aed] transition resize-none" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 mb-4">
              <div>
                <label className="block text-xs text-[#52525b] mb-1.5">Foto de perfil</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} className="w-full rounded-xl border border-[#27272a] bg-[#111113] px-4 py-2.5 text-xs text-[#71717a] outline-none focus:border-[#7c3aed]" />
              </div>
              <div>
                <label className="block text-xs text-[#52525b] mb-1.5">Imagem de capa</label>
                <input type="file" accept="image/*" onChange={(e) => handleCoverChange(e.target.files?.[0] ?? null)} className="w-full rounded-xl border border-[#27272a] bg-[#111113] px-4 py-2.5 text-xs text-[#71717a] outline-none focus:border-[#7c3aed]" />
              </div>
            </div>
            <button onClick={handleCreateProfile} disabled={profileLoading} className="rounded-full bg-[#7c3aed] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#6d28d9] disabled:opacity-50 transition">
              {profileLoading ? 'Salvando...' : (hasProfile ? 'Salvar perfil' : 'Criar minha página')}
            </button>
          </div>

          {/* STORE SECTION */}
          <div className="p-5 sm:p-6" id="loja">
            {profile?.plan !== 'pro' ? (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#7c3aed] mb-1">Loja</p>
                <h2 className="text-base font-medium text-[#fafafa] mb-2">Venda seus produtos com Pix</h2>
                <p className="text-sm text-[#52525b] mb-4">Crie e-books, mentorias e cursos. Disponível no plano Pro.</p>
                <button onClick={() => startCheckout('store')} className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-medium text-black hover:bg-amber-400 transition">Desbloquear loja — Pro R$9,90/mês</button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#7c3aed] mb-1">Loja</p>
                    <h2 className="text-base font-medium text-[#fafafa]">Minha loja</h2>
                  </div>
                  <button onClick={() => router.push('/dashboard/novo-produto')} className="rounded-full bg-[#7c3aed] px-4 py-2 text-xs font-medium text-white hover:bg-[#6d28d9] transition">+ Produto</button>
                </div>
                {products.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#27272a] p-6 text-center">
                    <p className="text-sm text-[#52525b] mb-3">Nenhum produto ainda</p>
                    <button onClick={() => router.push('/dashboard/novo-produto')} className="rounded-full bg-[#7c3aed] px-4 py-2 text-xs font-medium text-white hover:bg-[#6d28d9] transition">Criar primeiro produto</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center gap-3 rounded-xl border border-[#1c1c1e] bg-[#111113] px-4 py-3 hover:border-[#27272a] transition">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[#18181b]">
                          {product.imagem_url ? <img src={product.imagem_url} alt={product.nome} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-[#3f3f46]">img</div>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#fafafa]">{product.nome}</p>
                          <p className="text-xs text-[#52525b]">R$ {Number(product.preco).toFixed(2).replace('.', ',')} · {product.total_vendas} vendas</p>
                        </div>
                        <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${product.ativo ? 'bg-[#7c3aed]/10 text-[#7c3aed]' : 'bg-[#27272a] text-[#71717a]'}`}>{product.ativo ? 'Ativo' : 'Inativo'}</span>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => window.open(`https://linkify.app.br/${product.username}/${product.slug}`, '_blank')} className="rounded-full border border-[#27272a] px-3 py-1 text-xs text-[#a1a1aa] hover:text-[#fafafa] transition">Ver</button>
                          <button onClick={() => router.push(`/dashboard/novo-produto?id=${product.id}`)} className="rounded-full border border-[#27272a] px-3 py-1 text-xs text-[#a1a1aa] hover:text-[#fafafa] transition">Editar</button>
                          <button onClick={async () => { if (!window.confirm('Excluir este produto?')) return; setLoading(true); const { error } = await supabase.from('produtos').delete().eq('id', product.id); setLoading(false); if (error) { setErrorMessage('Erro ao excluir.'); return; } setProducts(products.filter((p) => p.id !== product.id)); setSuccessMessage('Produto excluído.') }} disabled={loading} className="rounded-full border border-[#3f1515] px-3 py-1 text-xs text-[#ef4444] hover:bg-[#3f1515]/20 transition disabled:opacity-50">Excluir</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {(errorMessage || successMessage) && (
            <div className="px-5 sm:px-6 py-3 space-y-2">
              {errorMessage && <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-sm text-red-400">{errorMessage}</div>}
              {successMessage && <div className="rounded-xl border border-green-900/40 bg-green-950/20 p-4 text-sm text-green-400">{successMessage}</div>}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden xl:block p-6 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#7c3aed] mb-1">Preview</p>
              <h2 className="text-base font-medium text-[#fafafa]">Página pública</h2>
            </div>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full border border-[#27272a] px-3 py-1.5 text-xs text-[#71717a] hover:text-[#fafafa] transition">
              {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
            </button>
          </div>
          <div className="flex items-center gap-2 mb-4 rounded-xl border border-[#27272a] bg-[#111113] px-3 py-2.5">
            <span className="flex-1 truncate text-xs text-[#52525b]">{username ? `linkify.app.br/${username}` : 'linkify.app.br/seunome'}</span>
            <button onClick={copyShareLink} disabled={!username} className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${isCopied ? 'bg-[#7c3aed] text-white' : username ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]' : 'bg-[#27272a] text-[#3f3f46] cursor-not-allowed'}`}>
              {isCopied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
          <div className={`rounded-2xl border p-5 ${theme === 'dark' ? 'border-[#1c1c1e] bg-[#050505]' : 'border-gray-200 bg-white'}`}>
            {coverUrl ? (
              <div className="mb-5 h-24 overflow-hidden rounded-xl"><img src={coverUrl} alt="Capa" className="h-full w-full object-cover" /></div>
            ) : (
              <div className={`mb-5 h-24 rounded-xl border border-dashed ${theme === 'dark' ? 'border-[#27272a] bg-[#111113]' : 'border-gray-200 bg-gray-50'}`} />
            )}
            <div className="flex items-center gap-3 mb-5">
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-[#27272a] bg-[#18181b]">
                {fotoUrl ? <img src={fotoUrl} alt="Foto" className="h-full w-full object-cover" /> : <div className={`flex h-full items-center justify-center text-lg ${theme === 'dark' ? 'text-[#52525b]' : 'text-gray-400'}`}>?</div>}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#7c3aed] mb-0.5">{username || 'seunome'}</p>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-[#fafafa]' : 'text-gray-900'}`}>{nome || 'Seu nome'}</p>
                <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-[#52525b]' : 'text-gray-400'}`}>{bio || 'Sua bio aqui'}</p>
              </div>
            </div>
            <div className="space-y-2">
              {previewLinks.length === 0 ? (
                <div className={`rounded-xl border border-dashed p-4 text-center text-xs ${theme === 'dark' ? 'border-[#27272a] text-[#3f3f46]' : 'border-gray-200 text-gray-400'}`}>Seus links aparecerão aqui</div>
              ) : (
                previewLinks.map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className={`block rounded-xl border px-4 py-3 text-sm font-medium transition ${theme === 'dark' ? 'border-[#1c1c1e] bg-[#111113] text-[#fafafa] hover:border-[#7c3aed]/30' : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-[#7c3aed]/40'}`}>
                    {link.titulo}
                  </a>
                ))
              )}
            </div>
            <p className={`mt-4 text-center text-[10px] ${theme === 'dark' ? 'text-[#27272a]' : 'text-gray-300'}`}>feito com Linkify</p>
          </div>
        </aside>
      </div>

      <footer className="border-t border-[#1c1c1e] px-4 sm:px-6 py-6 text-xs text-[#3f3f46]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>© 2026 Linkify — feito para criadores brasileiros</div>
          <div className="flex gap-4">
            <Link href="/termos" className="hover:text-[#71717a] transition">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-[#71717a] transition">Política de Privacidade</Link>
          </div>
        </div>
      </footer>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-72 bg-[#111113] border-r border-[#1c1c1e] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><rect x="3" y="2" width="9" height="14" rx="2" transform="skewX(-8)" fill="#7c3aed"/><rect x="10" y="9" width="9" height="8" rx="2" transform="skewX(-8)" fill="#7c3aed"/></svg>
                <span className="text-sm font-medium text-[#fafafa]">Linkify</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-[#52525b] hover:text-[#fafafa] text-lg">✕</button>
            </div>
            <nav className="space-y-1 flex-1">
              {['Links', 'Analytics', 'Loja', 'Perfil', 'Ajustes'].map((item) => (
                <button key={item} onClick={() => setMobileMenuOpen(false)} className="w-full rounded-xl px-4 py-3 text-left text-sm text-[#71717a] hover:bg-[#18181b] hover:text-[#fafafa] transition">{item}</button>
              ))}
              <Link href="/dashboard/relatorios" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-[#71717a] hover:bg-[#18181b] hover:text-[#fafafa] transition">Relatórios</Link>
            </nav>
            <div className="mt-6 rounded-xl border border-[#27272a] bg-[#18181b] p-4">
              {profile?.plan === 'pro' ? (
                <p className="text-sm font-medium text-[#7c3aed]">✓ Plano Pro ativo</p>
              ) : (
                <div>
                  <p className="text-sm text-[#71717a] mb-3">Plano Gratuito</p>
                  <button onClick={() => { setMobileMenuOpen(false); startCheckout('sidebar') }} className="rounded-full bg-amber-500 px-4 py-2 text-xs font-medium text-black hover:bg-amber-400 transition">Upgrade Pro →</button>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111113] border border-[#27272a] p-6">
            <h3 className="text-base font-medium text-[#fafafa] mb-2">Amplie seu alcance com o Pro</h3>
            <p className="text-sm text-[#71717a] mb-5">Você já aproveita o essencial — desbloqueie até 10 links, loja com Pix integrada, sem marca d'água e analytics avançado.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowUpgradeModal(false)} className="rounded-full border border-[#27272a] px-4 py-2 text-sm text-[#71717a] hover:text-[#fafafa] transition">Fechar</button>
              <button onClick={() => startCheckout('modal')} className="rounded-full bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white hover:bg-[#6d28d9] transition">
                {upgradeLoading ? 'Abrindo...' : 'Assinar Pro — R$9,90/mês'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
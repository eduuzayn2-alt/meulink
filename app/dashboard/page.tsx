"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

interface LinkItem { id: string; user_id: string; titulo: string; url: string; criado_em: string; icon_name?: string; icon_url?: string }
interface ProfileData { id: string; user_id: string; nome: string; bio: string; foto_url: string; plan?: string; cover_url?: string; username: string }
interface ProductItem { id: string; user_id: string; username: string; nome: string; descricao: string | null; preco: string; imagem_url: string | null; tipo_entrega: 'arquivo' | 'link'; arquivo_url: string | null; link_externo: string | null; slug: string; ativo: boolean; total_vendas: number; criado_em: string }

const defaultIconOptions = [
  { value: '', label: 'Nenhum' }, { value: 'Instagram', label: 'Instagram' }, { value: 'YouTube', label: 'YouTube' },
  { value: 'WhatsApp', label: 'WhatsApp' }, { value: 'TikTok', label: 'TikTok' }, { value: 'Site', label: 'Site' }, { value: 'Outro', label: 'Outro' },
]

const c = {
  bg: '#09090b', card: '#111113', border: '#1c1c1e', border2: '#27272a',
  text: '#fafafa', muted: '#71717a', subtle: '#52525b', faint: '#3f3f46',
  purple: '#7c3aed', purpleDark: '#6d28d9', input: '#18181b',
}

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
  const [analytics, setAnalytics] = useState<{ visitors: number | null; clicks: number | null; topLink: string | null }>({ visitors: null, clicks: null, topLink: null })

  const hasProfile = Boolean(username.trim())
  const previewLinks = useMemo(() => links.slice().reverse(), [links])

  const getFriendlyError = (error: any, fallback: string) => { const m = error?.message?.trim(); if (!m) return fallback; const l = m.toLowerCase(); if (l.includes('network') || l.includes('timeout') || l.includes('fetch')) return fallback; return m }
  const validateUsername = (input: string) => { setUsernameError(null); if (!input) { setUsername(''); return }; const t = input.toLowerCase().replace(/ +/g, '-'); if (!/^[a-z0-9-]*$/.test(t)) { const inv = t.replace(/[a-z0-9-]/g, ''); setUsernameError(`Caracteres não permitidos: ${[...new Set(inv)].join(', ')}`); return }; setUsername(t) }

  const renderLinkIcon = (link: LinkItem) => {
    if (link.icon_url) return <img src={link.icon_url} alt={link.icon_name || 'Ícone'} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
    const label = link.icon_name || 'Link'
    const base: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, background: c.input, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }
    const colors: Record<string, string> = { Instagram: '#ec4899', YouTube: '#ef4444', WhatsApp: '#22c55e', TikTok: '#fff', Site: '#38bdf8', Outro: c.muted }
    return <div style={{ ...base, color: colors[link.icon_name || ''] || c.purple }}>{label.slice(0, 2)}</div>
  }

  useEffect(() => {
    const init = async () => {
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
      if (profileData) { setProfile(profileData); setNome(profileData.nome ?? ''); setBio(profileData.bio ?? ''); setFotoUrl(profileData.foto_url ?? ''); setCoverUrl(profileData.cover_url ?? ''); setUsername(profileData.username ?? '') }
      if (linkError) setErrorMessage(linkError.message); else setLinks(linkData ?? [])
      if (productError) setErrorMessage(getFriendlyError(productError, 'Erro ao carregar produtos.')); else setProducts(productData ?? [])
      try {
        const token = data.session.access_token
        if (token) { const r = await fetch('/api/subscriptions', { headers: { 'x-access-token': token, 'x-user-id': ownerId } }); }
      } catch (e) {}
      try {
        const since = new Date(); since.setDate(since.getDate() - 30)
        const [{ count: v }, { count: cl }, { data: cd }] = await Promise.all([
          supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('user_id', ownerId).eq('event_type', 'page_view').gte('criado_em', since.toISOString()),
          supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('user_id', ownerId).eq('event_type', 'link_click').gte('criado_em', since.toISOString()),
          supabase.from('analytics_events').select('link_title').eq('user_id', ownerId).eq('event_type', 'link_click').gte('criado_em', since.toISOString()),
        ])
        const lc: Record<string, number> = {}
        cd?.forEach((e: any) => { if (e.link_title) lc[e.link_title] = (lc[e.link_title] || 0) + 1 })
        setAnalytics({ visitors: v ?? 0, clicks: cl ?? 0, topLink: Object.entries(lc).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null })
      } catch (e) {}
      setFetching(false)
    }
    init()
  }, [router])

  const handleFileChange = async (file: File | null) => {
    if (!file) return; setProfileLoading(true)
    try {
      const { data: ud } = await supabase.auth.getUser(); const uid = ud?.user?.id
      if (!uid) { setProfileLoading(false); setErrorMessage('Sessão expirada.'); return }
      const fp = `${uid}-${Date.now()}`
      const { error: ue } = await supabase.storage.from('avatars').upload(fp, file, { upsert: true })
      if (ue) { setProfileLoading(false); setErrorMessage('Erro ao enviar imagem.'); return }
      const { data: pd } = supabase.storage.from('avatars').getPublicUrl(fp)
      const pu = (pd as any)?.publicUrl ?? ''
      const { data: up } = await supabase.from('profiles').update({ foto_url: pu }).eq('user_id', uid).select().maybeSingle()
      setFotoUrl(pu); if (up) setProfile(up); setSuccessMessage('Foto enviada.')
    } catch (e) { setErrorMessage('Erro ao processar imagem.') }
    setProfileLoading(false)
  }

  const handleCoverChange = async (file: File | null) => {
    if (!file) return; setProfileLoading(true)
    try {
      const { data: ud } = await supabase.auth.getUser(); const uid = ud?.user?.id
      if (!uid) { setProfileLoading(false); setErrorMessage('Sessão expirada.'); return }
      const fp = `cover-${uid}-${Date.now()}`
      const { error: ue } = await supabase.storage.from('avatars').upload(fp, file, { upsert: true })
      if (ue) { setProfileLoading(false); setErrorMessage('Erro ao enviar imagem.'); return }
      const { data: pd } = supabase.storage.from('avatars').getPublicUrl(fp)
      const pu = (pd as any)?.publicUrl ?? ''
      const { data: up } = await supabase.from('profiles').update({ cover_url: pu }).eq('user_id', uid).select().maybeSingle()
      setCoverUrl(pu); if (up) setProfile(up); setSuccessMessage('Capa enviada.')
    } catch (e) { setErrorMessage('Erro ao processar imagem.') }
    setProfileLoading(false)
  }

  const handleSaveProfile = async () => {
    if (!userId) { setErrorMessage('Sessão expirada.'); return }
    if (!username.trim()) { setErrorMessage('Escolha um username.'); return }
    setProfileLoading(true)
    const { data, error } = await supabase.from('profiles').upsert({ user_id: userId, nome: nome.trim(), bio: bio.trim(), foto_url: fotoUrl.startsWith('blob:') ? '' : fotoUrl.trim(), cover_url: coverUrl.startsWith('blob:') ? '' : coverUrl.trim(), username: username.trim() }, { onConflict: 'user_id' }).select().maybeSingle()
    setProfileLoading(false)
    if (error) { setErrorMessage(getFriendlyError(error, 'Erro ao salvar perfil.')); return }
    if (!data) { setErrorMessage('Erro ao salvar perfil.'); return }
    setProfile(data); setSuccessMessage('Perfil salvo!')
  }

  const handleEditLink = (link: LinkItem) => { setTitle(link.titulo); setUrl(link.url); setLinkIconName(link.icon_name ?? ''); setLinkIconUrl(link.icon_url ?? ''); setEditingLinkId(link.id) }
  const handleCancelEdit = () => { setEditingLinkId(null); setTitle(''); setUrl(''); setLinkIconName(''); setLinkIconUrl('') }

  const handleAddLink = async () => {
    if (!title.trim() || !url.trim() || !userId) return
    setLoading(true)
    const maxLinks = profile?.plan === 'pro' ? 10 : 2
    if (!editingLinkId && links.length >= maxLinks) { setLoading(false); setShowUpgradeModal(true); return }
    if (editingLinkId) {
      const { data, error } = await supabase.from('links').update({ titulo: title.trim(), url: url.trim(), icon_name: linkIconName || null, icon_url: linkIconUrl.trim() || null }).eq('id', editingLinkId).eq('user_id', userId).select().single()
      setLoading(false)
      if (error || !data) { setErrorMessage(getFriendlyError(error, 'Erro ao atualizar link.')); return }
      setLinks(c => c.map(l => l.id === data.id ? data : l)); handleCancelEdit(); setSuccessMessage('Link atualizado.')
      return
    }
    const { data, error } = await supabase.from('links').insert({ user_id: userId, titulo: title.trim(), url: url.trim(), icon_name: linkIconName || null, icon_url: linkIconUrl.trim() || null }).select().single()
    setLoading(false)
    if (error || !data) { setErrorMessage(getFriendlyError(error, 'Erro ao adicionar link.')); return }
    setLinks(c => [data, ...c]); setTitle(''); setUrl(''); setLinkIconName(''); setLinkIconUrl(''); setSuccessMessage('Link adicionado.')
  }

  const handleDelete = async (id: string) => {
    if (!userId) return; setLoading(true)
    const { error } = await supabase.from('links').delete().eq('id', id).eq('user_id', userId)
    setLoading(false)
    if (error) { setErrorMessage(getFriendlyError(error, 'Erro ao remover link.')); return }
    setLinks(c => c.filter(l => l.id !== id)); setSuccessMessage('Link removido.')
  }

  const handleDrop = (index: number) => {
    if (dragIndex === null) return
    const updated = [...links]; const [moved] = updated.splice(dragIndex, 1); updated.splice(index, 0, moved)
    setLinks(updated); setDragIndex(null)
  }

  const shareUrl = `https://linkify.app.br/${username}`
  const copyShareLink = async () => {
    if (!username) { setErrorMessage('Defina um username primeiro.'); return }
    try { await navigator.clipboard.writeText(shareUrl); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000) }
    catch (e) { setErrorMessage('Não foi possível copiar.') }
  }

  const startCheckout = async (source = 'banner') => {
    setUpgradeLoading(true)
    if (!userId) { setErrorMessage('Sessão expirada.'); setUpgradeLoading(false); return }
    try {
      const cw = window.open('about:blank', '_blank')
      const { data: ud } = await supabase.auth.getUser()
      const res = await fetch('/api/criar-assinatura', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payer_email: ud?.user?.email, user_id: userId }) })
      const json = await res.json()
      if (res.ok && (json.init_point || json.sandbox_init_point)) { if (cw) cw.location.href = json.init_point ?? json.sandbox_init_point; setUpgradeLoading(false); return }
      if (cw) cw.close(); setErrorMessage('Não foi possível iniciar o checkout.')
    } catch (e) { setErrorMessage('Erro ao iniciar checkout.') }
    setUpgradeLoading(false)
  }

  const handleSignOut = async () => { try { await supabase.auth.signOut() } finally { router.push('/login') } }
  const fmt = (n: number | null) => n === null ? '—' : n.toLocaleString('pt-BR')

  const inp: React.CSSProperties = { width: '100%', background: c.card, border: `1px solid ${c.border2}`, borderRadius: 12, padding: '10px 14px', fontSize: 13, color: c.text, outline: 'none', boxSizing: 'border-box' }
  const btnPrimary: React.CSSProperties = { background: c.purple, border: 'none', borderRadius: 999, padding: '10px 20px', fontSize: 13, fontWeight: 500, color: '#fff', cursor: 'pointer' }
  const btnGhost: React.CSSProperties = { background: 'transparent', border: `1px solid ${c.border2}`, borderRadius: 999, padding: '6px 12px', fontSize: 12, color: c.muted, cursor: 'pointer' }
  const btnDanger: React.CSSProperties = { background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 999, padding: '6px 12px', fontSize: 12, color: '#ef4444', cursor: 'pointer' }
  const sectionLabel: React.CSSProperties = { fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: c.purple, marginBottom: 4, fontWeight: 500 }
  const sectionTitle: React.CSSProperties = { fontSize: 15, fontWeight: 500, color: c.text }

  if (fetching) return (
    <main style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: '32px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.purple }}>Carregando painel</p>
        <p style={{ marginTop: 12, fontSize: 17, fontWeight: 500, color: c.text }}>Preparando seu espaço...</p>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: c.bg, color: c.text }}>

      {/* TOP NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, borderBottom: `1px solid ${c.border}`, background: c.bg + 'f2', backdropFilter: 'blur(8px)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', height: 56, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><rect x="3" y="2" width="9" height="14" rx="2" transform="skewX(-8)" fill={c.purple}/><rect x="10" y="9" width="9" height="8" rx="2" transform="skewX(-8)" fill={c.purple}/></svg>
              <span style={{ fontSize: 14, fontWeight: 500, color: c.text }}>Linkify</span>
            </div>
            <nav style={{ display: 'flex', gap: 4 }}>
              {[['Links','links'],['Loja','loja'],['Perfil','perfil']].map(([label, id]) => (
                <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({behavior:'smooth'})} style={{ background: 'transparent', border: 'none', borderRadius: 999, padding: '6px 12px', fontSize: 12, color: c.muted, cursor: 'pointer' }}>{label}</button>
              ))}
              <Link href="/dashboard/relatorios" style={{ borderRadius: 999, padding: '6px 12px', fontSize: 12, color: c.muted, textDecoration: 'none' }}>Analytics</Link>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {profile?.plan === 'pro' && <span style={{ fontSize: 11, color: c.purple, background: c.card, border: `1px solid ${c.border2}`, borderRadius: 999, padding: '4px 10px' }}>✓ Pro</span>}
            <button onClick={handleSignOut} style={btnGhost}>Sair</button>
            <button onClick={() => setMobileMenuOpen(true)} style={{ ...btnGhost, display: 'none' }}>☰</button>
          </div>
        </div>
      </header>

      {/* STATS BAR */}
      <div style={{ borderBottom: `1px solid ${c.border}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          {[
            { label: 'Visitantes', value: fmt(analytics.visitors), sub: 'últimos 30 dias' },
            { label: 'Cliques', value: fmt(analytics.clicks), sub: 'últimos 30 dias' },
            { label: 'Link mais clicado', value: analytics.topLink ?? '—', sub: analytics.topLink ? 'últimos 30 dias' : 'sem dados ainda' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '16px 24px', borderRight: i < 2 ? `1px solid ${c.border}` : 'none' }}>
              <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: c.subtle, marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontSize: i === 2 ? 14 : 20, fontWeight: 500, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</p>
              <p style={{ fontSize: 11, color: c.subtle, marginTop: 2 }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FREE PLAN BANNER */}
      {profile?.plan !== 'pro' && (
        <div style={{ borderBottom: `1px solid ${c.border}`, background: '#0d0d0d', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ fontSize: 12, color: '#a1a1aa' }}>⚡ Plano Gratuito — {links.length}/2 links usados</span>
          <button onClick={() => startCheckout('banner')} style={{ background: '#f59e0b', border: 'none', borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 500, color: '#000', cursor: 'pointer', flexShrink: 0 }}>Upgrade Pro R$9,90/mês →</button>
        </div>
      )}

      {/* MAIN GRID */}
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 360px' }}>
        <div style={{ borderRight: `1px solid ${c.border}` }}>

          {/* LINKS */}
          <div style={{ padding: '24px', borderBottom: `1px solid ${c.border}` }} id="links">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div><p style={sectionLabel}>Seus links</p><h2 style={sectionTitle}>Organize seus links</h2></div>
              {editingLinkId && <button onClick={handleCancelEdit} style={btnGhost}>Cancelar</button>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do link" style={inp} />
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." style={inp} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <select value={linkIconName} onChange={e => setLinkIconName(e.target.value)} style={{ ...inp, color: c.muted }}>
                {defaultIconOptions.map(o => <option key={o.value} value={o.value} style={{ background: c.card }}>{o.label}</option>)}
              </select>
              <input value={linkIconUrl} onChange={e => setLinkIconUrl(e.target.value)} placeholder="URL do ícone (opcional)" style={inp} />
            </div>
            <button onClick={handleAddLink} disabled={loading} style={btnPrimary}>
              {loading ? (editingLinkId ? 'Salvando...' : 'Adicionando...') : (editingLinkId ? 'Salvar alterações' : '+ Adicionar link')}
            </button>

            {links.length === 0 ? (
              <div style={{ marginTop: 20, border: `1px dashed ${c.border2}`, borderRadius: 12, padding: 32, textAlign: 'center', fontSize: 13, color: c.faint }}>Nenhum link ainda. Adicione o primeiro acima.</div>
            ) : (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {links.map((link, index) => (
                  <div key={link.id} draggable onDragStart={() => setDragIndex(index)} onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(index)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: '12px 16px', cursor: 'grab' }}>
                    <div style={{ flexShrink: 0 }}>{renderLinkIcon(link)}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.titulo}</p>
                      <p style={{ fontSize: 11, color: c.subtle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button onClick={() => handleEditLink(link)} style={btnGhost}>Editar</button>
                      <button onClick={() => handleDelete(link.id)} style={btnDanger}>Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {profile?.plan !== 'pro' && (
              <div style={{ marginTop: 16, border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 500, color: '#f59e0b', marginBottom: 8 }}>Desbloqueie o Linkify Pro</h3>
                    <ul style={{ fontSize: 12, color: c.muted, lineHeight: 1.8 }}>
                      <li>• Até 10 links</li><li>• Loja com Pix integrada</li><li>• Sem marca d'água</li><li>• Analytics avançado</li>
                    </ul>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#f59e0b' }}>R$9,90/mês</p>
                    <button onClick={() => startCheckout('card')} style={{ marginTop: 8, background: '#f59e0b', border: 'none', borderRadius: 999, padding: '8px 16px', fontSize: 12, fontWeight: 500, color: '#000', cursor: 'pointer' }}>Assinar →</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PROFILE */}
          <div style={{ padding: '24px', borderBottom: `1px solid ${c.border}` }} id="perfil">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div><p style={sectionLabel}>Meu perfil público</p><h2 style={sectionTitle}>Nome, bio e foto da sua página</h2></div>
              {hasProfile && <a href={`https://linkify.app.br/${username}`} target="_blank" rel="noreferrer" style={{ ...btnGhost, textDecoration: 'none' }}>Ver página ↗</a>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: c.subtle, marginBottom: 6 }}>Nome</label>
                <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome completo" style={inp} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: c.subtle, marginBottom: 6 }}>Username</label>
                <input value={username} onChange={e => validateUsername(e.target.value)} placeholder="seunome" style={inp} />
                {usernameError ? <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block' }}>{usernameError}</span> : <span style={{ fontSize: 11, color: c.faint, marginTop: 4, display: 'block' }}>linkify.app.br/{username || 'seunome'}</span>}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, color: c.subtle, marginBottom: 6 }}>Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} placeholder="Fale sobre você em uma linha" style={{ ...inp, resize: 'none' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: c.subtle, marginBottom: 6 }}>Foto de perfil</label>
                <input type="file" accept="image/*" onChange={e => handleFileChange(e.target.files?.[0] ?? null)} style={{ ...inp, fontSize: 11, color: c.muted }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: c.subtle, marginBottom: 6 }}>Imagem de capa</label>
                <input type="file" accept="image/*" onChange={e => handleCoverChange(e.target.files?.[0] ?? null)} style={{ ...inp, fontSize: 11, color: c.muted }} />
              </div>
            </div>
            <button onClick={handleSaveProfile} disabled={profileLoading} style={btnPrimary}>
              {profileLoading ? 'Salvando...' : (hasProfile ? 'Salvar perfil' : 'Criar minha página')}
            </button>
          </div>

          {/* STORE */}
          <div style={{ padding: '24px' }} id="loja">
            {profile?.plan !== 'pro' ? (
              <div>
                <p style={sectionLabel}>Loja</p>
                <h2 style={{ ...sectionTitle, marginBottom: 8 }}>Venda seus produtos com Pix</h2>
                <p style={{ fontSize: 13, color: c.subtle, marginBottom: 16 }}>Crie e-books, mentorias e cursos. Disponível no plano Pro.</p>
                <button onClick={() => startCheckout('store')} style={{ background: '#f59e0b', border: 'none', borderRadius: 999, padding: '10px 20px', fontSize: 13, fontWeight: 500, color: '#000', cursor: 'pointer' }}>Desbloquear loja — Pro R$9,90/mês</button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div><p style={sectionLabel}>Loja</p><h2 style={sectionTitle}>Minha loja</h2></div>
                  <button onClick={() => router.push('/dashboard/novo-produto')} style={btnPrimary}>+ Produto</button>
                </div>
                {products.length === 0 ? (
                  <div style={{ border: `1px dashed ${c.border2}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: c.subtle, marginBottom: 12 }}>Nenhum produto ainda</p>
                    <button onClick={() => router.push('/dashboard/novo-produto')} style={btnPrimary}>Criar primeiro produto</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {products.map(product => (
                      <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: '12px 16px' }}>
                        <div style={{ width: 40, height: 40, flexShrink: 0, overflow: 'hidden', borderRadius: 8, background: c.input }}>
                          {product.imagem_url ? <img src={product.imagem_url} alt={product.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: c.faint }}>img</div>}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.nome}</p>
                          <p style={{ fontSize: 11, color: c.subtle }}>R$ {Number(product.preco).toFixed(2).replace('.', ',')} · {product.total_vendas} vendas</p>
                        </div>
                        <span style={{ flexShrink: 0, borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 500, background: product.ativo ? 'rgba(124,58,237,0.1)' : c.border2, color: product.ativo ? c.purple : c.muted }}>{product.ativo ? 'Ativo' : 'Inativo'}</span>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <button onClick={() => window.open(`https://linkify.app.br/${product.username}/${product.slug}`, '_blank')} style={btnGhost}>Ver</button>
                          <button onClick={() => router.push(`/dashboard/novo-produto?id=${product.id}`)} style={btnGhost}>Editar</button>
                          <button onClick={async () => { if (!window.confirm('Excluir este produto?')) return; setLoading(true); const { error } = await supabase.from('produtos').delete().eq('id', product.id); setLoading(false); if (error) { setErrorMessage('Erro ao excluir.'); return }; setProducts(products.filter(p => p.id !== product.id)); setSuccessMessage('Produto excluído.') }} disabled={loading} style={btnDanger}>Excluir</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MESSAGES */}
          {(errorMessage || successMessage) && (
            <div style={{ padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {errorMessage && <div style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#f87171' }}>{errorMessage}</div>}
              {successMessage && <div style={{ border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#4ade80' }}>{successMessage}</div>}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside style={{ padding: 24, position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div><p style={sectionLabel}>Preview</p><h2 style={sectionTitle}>Página pública</h2></div>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={btnGhost}>{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, background: c.card, border: `1px solid ${c.border2}`, borderRadius: 12, padding: '10px 12px' }}>
            <span style={{ flex: 1, fontSize: 12, color: c.subtle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username ? `linkify.app.br/${username}` : 'linkify.app.br/seunome'}</span>
            <button onClick={copyShareLink} disabled={!username} style={{ ...btnPrimary, padding: '6px 12px', fontSize: 11, background: isCopied ? c.purple : username ? c.purple : c.border2, color: username ? '#fff' : c.faint }}>
              {isCopied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
          <div style={{ background: theme === 'dark' ? '#050505' : '#fff', border: `1px solid ${theme === 'dark' ? c.border : '#e5e7eb'}`, borderRadius: 16, padding: 20 }}>
            {coverUrl ? <div style={{ height: 80, overflow: 'hidden', borderRadius: 10, marginBottom: 20 }}><img src={coverUrl} alt="Capa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div> : <div style={{ height: 80, borderRadius: 10, border: `1px dashed ${theme === 'dark' ? c.border2 : '#e5e7eb'}`, marginBottom: 20, background: theme === 'dark' ? c.card : '#f9f9f9' }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, flexShrink: 0, overflow: 'hidden', borderRadius: '50%', border: `1px solid ${c.border2}`, background: c.input }}>
                {fotoUrl ? <img src={fotoUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: c.subtle }}>?</div>}
              </div>
              <div>
                <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.purple, marginBottom: 2 }}>{username || 'seunome'}</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: theme === 'dark' ? c.text : '#111' }}>{nome || 'Seu nome'}</p>
                <p style={{ fontSize: 11, color: theme === 'dark' ? c.subtle : '#9ca3af', marginTop: 2 }}>{bio || 'Sua bio aqui'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {previewLinks.length === 0 ? (
                <div style={{ border: `1px dashed ${theme === 'dark' ? c.border2 : '#e5e7eb'}`, borderRadius: 10, padding: 16, textAlign: 'center', fontSize: 12, color: theme === 'dark' ? c.faint : '#9ca3af' }}>Seus links aparecerão aqui</div>
              ) : (
                previewLinks.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noreferrer" style={{ display: 'block', background: theme === 'dark' ? c.card : '#f9f9f9', border: `1px solid ${theme === 'dark' ? c.border : '#e5e7eb'}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 500, color: theme === 'dark' ? c.text : '#111', textDecoration: 'none', textAlign: 'center' }}>
                    {link.titulo}
                  </a>
                ))
              )}
            </div>
            <p style={{ marginTop: 16, textAlign: 'center', fontSize: 10, color: theme === 'dark' ? '#27272a' : '#d1d5db' }}>feito com Linkify</p>
          </div>
        </aside>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${c.border}`, padding: '24px', fontSize: 12, color: c.faint }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>© 2026 Linkify — feito para criadores brasileiros</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/termos" style={{ color: c.faint, textDecoration: 'none' }}>Termos de Uso</Link>
            <Link href="/privacidade" style={{ color: c.faint, textDecoration: 'none' }}>Política de Privacidade</Link>
          </div>
        </div>
      </footer>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ width: 280, background: c.card, borderRight: `1px solid ${c.border}`, padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><rect x="3" y="2" width="9" height="14" rx="2" transform="skewX(-8)" fill={c.purple}/><rect x="10" y="9" width="9" height="8" rx="2" transform="skewX(-8)" fill={c.purple}/></svg>
                <span style={{ fontSize: 14, fontWeight: 500, color: c.text }}>Linkify</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: c.subtle, fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <nav style={{ flex: 1 }}>
              {['Links', 'Loja', 'Perfil'].map(item => (
                <button key={item} onClick={() => setMobileMenuOpen(false)} style={{ width: '100%', background: 'transparent', border: 'none', borderRadius: 10, padding: '12px 16px', textAlign: 'left', fontSize: 13, color: c.muted, cursor: 'pointer', display: 'block', marginBottom: 2 }}>{item}</button>
              ))}
              <Link href="/dashboard/relatorios" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: c.muted, textDecoration: 'none' }}>Analytics</Link>
            </nav>
            <div style={{ marginTop: 24, background: c.input, border: `1px solid ${c.border2}`, borderRadius: 12, padding: 16 }}>
              {profile?.plan === 'pro' ? <p style={{ fontSize: 13, fontWeight: 500, color: c.purple }}>✓ Plano Pro ativo</p> : (
                <div>
                  <p style={{ fontSize: 13, color: c.muted, marginBottom: 12 }}>Plano Gratuito</p>
                  <button onClick={() => { setMobileMenuOpen(false); startCheckout('sidebar') }} style={{ background: '#f59e0b', border: 'none', borderRadius: 999, padding: '8px 16px', fontSize: 12, fontWeight: 500, color: '#000', cursor: 'pointer' }}>Upgrade Pro →</button>
                </div>
              )}
            </div>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.6)' }} onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* UPGRADE MODAL */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 440, background: c.card, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, color: c.text, marginBottom: 8 }}>Amplie seu alcance com o Pro</h3>
            <p style={{ fontSize: 13, color: c.muted, marginBottom: 20 }}>Desbloqueie até 10 links, loja com Pix integrada, sem marca d'água e analytics avançado.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowUpgradeModal(false)} style={btnGhost}>Fechar</button>
              <button onClick={() => startCheckout('modal')} style={btnPrimary}>{upgradeLoading ? 'Abrindo...' : 'Assinar Pro — R$9,90/mês'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
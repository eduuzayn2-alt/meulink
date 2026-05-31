"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

interface LinkItem {
  id: string
  user_id: string
  titulo: string
  url: string
  criado_em: string
}

interface ProfileData {
  id: string
  user_id: string
  nome: string
  bio: string
  foto_url: string
  username: string
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
  const [username, setUsername] = useState('')
  const [links, setLinks] = useState<LinkItem[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

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
        setUsername(profileData.username ?? '')
      }

      if (linkError) {
        setErrorMessage(linkError.message)
      } else {
        setLinks(linkData ?? [])
      }

      setFetching(false)
    }

    initialize()
  }, [router])

  const handleFileChange = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result) setFotoUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
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

    const profileData = {
      user_id: userId,
      nome: nome.trim(),
      bio: bio.trim(),
      foto_url: fotoUrl.trim(),
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

  const handleAddLink = async () => {
    if (!title.trim() || !url.trim() || !userId) return
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const { data, error } = await supabase
      .from('links')
      .insert({ user_id: userId, titulo: title.trim(), url: url.trim() })
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

  const shareUrl = `https://meulink-ruby.vercel.app/${username}`

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
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-8 xl:grid-cols-[260px_minmax(560px,1fr)_420px] xl:px-8">
        <aside className="hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 xl:block">
          <div className="text-sm uppercase tracking-[0.3em] text-zinc-500">Navegação</div>
          <nav className="mt-8 space-y-3">
            {['Visão geral', 'Links', 'Perfil', 'Ajustes'].map((item) => (
              <button key={item} className="w-full rounded-3xl px-4 py-3 text-left text-white transition hover:bg-white/5">
                {item}
              </button>
            ))}
          </nav>
          <div className="mt-10 rounded-3xl border border-zinc-800 bg-[#101010] p-5 text-sm text-zinc-400">
            <p className="font-semibold text-white">Linkify Premium</p>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Controle a identidade da sua página com um painel enxuto e moderno.
            </p>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Painel</p>
                <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Crie sua página Linkify</h1>
                <p className="mt-3 max-w-2xl text-zinc-400">
                  Um painel leve para construir sua página pública com perfil, links e visualização ao vivo.
                </p>
              </div>
              <div className="rounded-3xl border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-zinc-300">
                {hasProfile ? 'Editor ativo' : 'Comece pelo onboarding'}
              </div>
            </div>
          </div>

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
                        <span className="mt-2 block text-xs text-zinc-500">meulink-ruby.vercel.app/{username || 'seunome'}</span>
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
                    href={`https://meulink-ruby.vercel.app/${username}`}
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
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Editor de links</p>
                    <h2 className="mt-3 text-2xl font-semibold">Organize seus links</h2>
                  </div>
                  <button
                    onClick={handleAddLink}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
                  >
                    + Adicionar
                  </button>
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
                            ≡
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">{link.titulo}</p>
                            <p className="truncate text-sm text-zinc-500">{link.url}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(link.id)}
                          className="rounded-full border border-red-600 bg-red-600/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-600/20"
                        >
                          Excluir
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <aside className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
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
                <span className="truncate font-medium text-white">{username ? `meulink-ruby.vercel.app/${username}` : 'meulink-ruby.vercel.app/seunome'}</span>
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
                    <p className="mt-1 text-sm text-zinc-400 truncate">{link.url}</p>
                  </a>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

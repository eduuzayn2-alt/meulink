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
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [links, setLinks] = useState<LinkItem[]>([])
  const [nome, setNome] = useState('')
  const [bio, setBio] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [fetching, setFetching] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const previewLinks = useMemo(
    () => links.slice().reverse(),
    [links]
  )

  if (fetching) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-8">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-8 py-6 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Verificando sessão</p>
          <p className="mt-4 text-lg font-semibold">Aguarde um momento...</p>
        </div>
      </main>
    )
  }

  const loadLinks = async (ownerId: string) => {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', ownerId)
      .order('criado_em', { ascending: false })

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setLinks(data ?? [])
  }

  const loadProfile = async (ownerId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', ownerId)
      .maybeSingle()

    if (error) {
      setErrorMessage(error.message)
      return
    }

    if (data) {
      setNome(data.nome ?? '')
      setBio(data.bio ?? '')
      setFotoUrl(data.foto_url ?? '')
      setUsername(data.username ?? '')
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

      setUserId(data.session.user.id)
      await Promise.all([loadLinks(data.session.user.id), loadProfile(data.session.user.id)])
      setFetching(false)
    }

    initialize()
  }, [router])

  const handleSaveProfile = async () => {
    if (!userId) return
    if (!username.trim()) {
      setErrorMessage('Escolha um username para a sua página.')
      return
    }

    setProfileLoading(true)
    setProfileMessage(null)
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          nome: nome.trim(),
          bio: bio.trim(),
          foto_url: fotoUrl.trim(),
          username: username.trim(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .maybeSingle()
    setProfileLoading(false)

    if (error || !data) {
      setErrorMessage(error?.message ?? 'Erro ao salvar perfil.')
      return
    }

    setProfileMessage('Perfil salvo com sucesso.')
  }

  useEffect(() => {
    if (profileMessage) {
      const timeout = window.setTimeout(() => setProfileMessage(null), 4000)
      return () => window.clearTimeout(timeout)
    }
  }, [profileMessage])

  const handleAddLink = async () => {
    if (!title.trim() || !url.trim() || !userId) return

    setLoading(true)
    const { data, error } = await supabase
      .from('links')
      .insert({ user_id: userId, titulo: title.trim(), url: url.trim() })
      .select()
      .single()
    setLoading(false)

    if (error || !data) {
      setErrorMessage(error?.message ?? 'Erro ao adicionar link.')
      return
    }

    setLinks((current) => [data, ...current])
    setTitle('')
    setUrl('')
  }

  const handleDelete = async (id: string) => {
    if (!userId) return

    setLoading(true)
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    setLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setLinks((current) => current.filter((link) => link.id !== id))
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {errorMessage ? (
          <div className="mb-6 rounded-3xl border border-red-700 bg-red-950/80 p-4 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Painel do criador</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Gerencie seus links</h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Adicione links, organize sua loja e visualize sua página pública em tempo real.
            </p>
          </div>
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-sm text-zinc-300">
            Bem-vindo ao seu espaço — tudo em um layout escuro e simples.
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[260px_minmax(420px,1fr)_360px]">
          <aside className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-400">Menu</h2>
            <nav className="mt-6 space-y-2">
              {['Links', 'Loja', 'Analytics', 'Configurações'].map((item) => (
                <button
                  key={item}
                  className="w-full rounded-2xl px-4 py-3 text-left text-white transition hover:bg-white/5"
                >
                  {item}
                </button>
              ))}
            </nav>
          </aside>

          <section className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Perfil do criador</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Edite seu nome, bio, foto e username de perfil.
                  </p>
                </div>
                <a
                  href={username ? `/${username}` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                    username ? 'bg-white text-black hover:bg-zinc-200' : 'cursor-not-allowed bg-zinc-800 text-zinc-500'
                  }`}
                  aria-disabled={!username}
                >
                  Ver minha página
                </a>
              </div>

              <div className="mt-6 grid gap-4">
                <label className="block">
                  <span className="text-sm text-zinc-400">Nome</span>
                  <input
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white/50"
                    placeholder="Nome do Criador"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-zinc-400">Bio</span>
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    className="mt-2 w-full rounded-3xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white/50"
                    rows={4}
                    placeholder="Sou criador de conteúdo focado em ..."
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-zinc-400">Foto da foto</span>
                  <input
                    value={fotoUrl}
                    onChange={(event) => setFotoUrl(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white/50"
                    placeholder="https://..."
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-zinc-400">Username</span>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-white/50"
                    placeholder="seunome"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={handleSaveProfile}
                  disabled={profileLoading}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
                >
                  {profileLoading ? 'Salvando...' : 'Salvar perfil'}
                </button>
                {profileMessage ? (
                  <p className="text-sm text-emerald-300">{profileMessage}</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Seus links</h2>
                  <p className="mt-1 text-sm text-zinc-400">Clique em excluir para remover itens do seu perfil público.</p>
                </div>
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs uppercase tracking-[0.22em] text-zinc-400">
                  {links.length} itens
                </span>
              </div>

              {links.length === 0 ? (
                <div className="mt-8 rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/60 p-8 text-center text-zinc-500">
                  Nenhum link adicionado ainda.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {links.map((link) => (
                    <div key={link.id} className="flex flex-col gap-3 rounded-3xl border border-zinc-800 bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">{link.titulo}</p>
                        <a href={link.url} target="_blank" rel="noreferrer" className="text-sm text-zinc-400 hover:text-white break-all">
                          {link.url}
                        </a>
                      </div>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="self-start rounded-full border border-red-600 bg-red-600/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-600/20 sm:self-center"
                      >
                        Excluir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Prévia pública</p>
                <h2 className="text-xl font-semibold">Sua página como visitante</h2>
              </div>
              <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs uppercase tracking-[0.22em] text-zinc-400">Preview</span>
            </div>

            <div className="space-y-6 rounded-3xl border border-zinc-800 bg-black/50 p-5">
              <div className="rounded-3xl bg-zinc-900 p-5 text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-white/10" />
                <h3 className="text-xl font-semibold">Linkify do Criador</h3>
                <p className="mt-2 text-sm text-zinc-500">Seu perfil público com seus melhores links.</p>
              </div>

              <div className="space-y-4">
                {previewLinks.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/60 p-6 text-center text-zinc-500">
                    Seus links aparecerão aqui assim que forem adicionados.
                  </div>
                ) : (
                  previewLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-3xl border border-zinc-800 bg-zinc-950 px-5 py-4 transition hover:border-white/20 hover:bg-zinc-800"
                    >
                      <p className="font-semibold text-white">{link.titulo}</p>
                      <p className="mt-1 text-sm text-zinc-400 truncate">{link.url}</p>
                    </a>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

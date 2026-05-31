import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

interface UserPageProps {
  params: {
    username: string
  }
}

export const metadata: Metadata = {
  title: 'Linkify - Perfil do Criador',
  description: 'Página pública do criador com seus links e bio.',
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '')

export default async function UserPage({ params }: UserPageProps) {
  const username = params.username

  // Busca perfil pelo username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, user_id, nome, bio, foto_url, username')
    .ilike('username', username)
    .maybeSingle()

  if (profileError || !profile) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <h2 className="text-xl font-semibold">Perfil não encontrado</h2>
          <p className="mt-2 text-zinc-400">Este usuário não existe ou ainda não criou a página.</p>
        </div>
      </main>
    )
  }

  // Busca links do usuário
  const { data: links, error: linksError } = await supabase
    .from('links')
    .select('id, titulo, url')
    .eq('user_id', profile.user_id)
    .order('criado_em', { ascending: false })

  const linkItems = links ?? []

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-start">
        <section className="flex-1 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8 shadow-[0_0_80px_rgba(255,255,255,0.02)] sm:p-10">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900 shadow-xl shadow-white/5">
              {profile.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.foto_url} alt={profile.nome} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-3xl text-zinc-500">?</div>
              )}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">@{profile.username}</p>
              <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{profile.nome}</h1>
              <p className="mt-4 max-w-2xl text-zinc-400 leading-7">{profile.bio}</p>
            </div>
          </div>

          <div className="mt-12 grid gap-4">
            {linkItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/60 p-6 text-center text-zinc-500">Este criador ainda não adicionou links.</div>
            ) : (
              linkItems.map((link: any) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between rounded-3xl border border-zinc-800 bg-black/70 px-6 py-5 transition hover:border-white/20 hover:bg-zinc-900"
                >
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-white/5 text-2xl transition group-hover:bg-white/10">🔗</span>
                    <div>
                      <p className="font-semibold text-white">{link.titulo}</p>
                      <p className="text-sm text-zinc-500">{link.url.replace('https://', '')}</p>
                    </div>
                  </div>
                  <span className="text-zinc-500 transition group-hover:text-white">→</span>
                </a>
              ))
            )}
          </div>
        </section>

        <aside className="w-full max-w-md rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8 shadow-[0_0_80px_rgba(255,255,255,0.02)] sm:p-10">
          <div className="space-y-4">
            <div className="rounded-3xl bg-gradient-to-br from-white/5 to-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Visão geral</p>
              <h2 className="mt-3 text-2xl font-semibold">{profile.nome}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">Compartilhe seu link e alcance seu público.</p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/60 p-6 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Destaque</p>
              <p className="mt-4 text-lg font-medium text-white">{profile.username ? `meulink-ruby.vercel.app/${profile.username}` : ''}</p>
            </div>
          </div>

          <footer className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900/80 px-6 py-5 text-center text-sm text-zinc-500">feito com Linkify</footer>
        </aside>
      </div>
    </main>
  )
}

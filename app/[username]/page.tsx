import type { Metadata } from 'next'

interface UserPageProps {
  params: {
    username: string
  }
}

export const metadata: Metadata = {
  title: 'Linkify - Perfil do Criador',
  description: 'Página pública do criador com seus links e bio.',
}

export default function UserPage({ params }: UserPageProps) {
  const profile = {
    name: 'Julia Link',
    bio: 'Criadora de conteúdo, designer e estratégica digital. Compartilhando links úteis e ferramentas para seu crescimento online.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    links: [
      { id: '1', title: 'Meu portfólio', url: 'https://meulink.com/portfolio', icon: '🔗' },
      { id: '2', title: 'Loja de presets', url: 'https://meulink.com/loja', icon: '🛍️' },
      { id: '3', title: 'Agenda de mentorias', url: 'https://meulink.com/mentorias', icon: '📅' },
      { id: '4', title: 'Canal no YouTube', url: 'https://meulink.com/youtube', icon: '🎥' },
    ],
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-start">
        <section className="flex-1 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8 shadow-[0_0_80px_rgba(255,255,255,0.02)] sm:p-10">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900 shadow-xl shadow-white/5">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">@{params.username}</p>
              <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{profile.name}</h1>
              <p className="mt-4 max-w-2xl text-zinc-400 leading-7">{profile.bio}</p>
            </div>
          </div>

          <div className="mt-12 grid gap-4">
            {profile.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-3xl border border-zinc-800 bg-black/70 px-6 py-5 transition hover:border-white/20 hover:bg-zinc-900"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-white/5 text-2xl transition group-hover:bg-white/10">
                    {link.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{link.title}</p>
                    <p className="text-sm text-zinc-500">{link.url.replace('https://', '')}</p>
                  </div>
                </div>
                <span className="text-zinc-500 transition group-hover:text-white">→</span>
              </a>
            ))}
          </div>
        </section>

        <aside className="w-full max-w-md rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8 shadow-[0_0_80px_rgba(255,255,255,0.02)] sm:p-10">
          <div className="space-y-4">
            <div className="rounded-3xl bg-gradient-to-br from-white/5 to-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Visão geral</p>
              <h2 className="mt-3 text-2xl font-semibold">Bem-vindo à minha página pública</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Aqui você encontra os meus principais links, produtos e conteúdo mais recentes. Design suave, leitura fácil e tudo pensado para conversão.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/60 p-6 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Destaque</p>
              <p className="mt-4 text-lg font-medium text-white">Veja os seus visitantes clicarem no botão certo.</p>
            </div>
          </div>

          <footer className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900/80 px-6 py-5 text-center text-sm text-zinc-500">
            feito com Linkify
          </footer>
        </aside>
      </div>
    </main>
  )
}

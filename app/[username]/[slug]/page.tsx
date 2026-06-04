import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

interface ProductPageProps {
  params: {
    username: string
    slug: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { username, slug } = await Promise.resolve(params)
  const { data: product, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('username', username)
    .eq('slug', slug)
    .maybeSingle()

  const { data: profile } = await supabase
    .from('profiles')
    .select('nome, foto_url')
    .eq('username', username)
    .maybeSingle()

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white px-4 py-24">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-zinc-800 bg-[#111111] p-10 text-center">
          <h1 className="text-3xl font-semibold">Produto não encontrado</h1>
          <p className="mt-4 text-zinc-400">Este produto não existe ou foi removido.</p>
          <Link href={`/${username}`} className="mt-8 inline-flex rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-black">
            Voltar ao perfil
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-4 py-10">
      <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[1.2fr_420px]">
        <div className="space-y-8">
          <div className="overflow-hidden rounded-[1.5rem] border border-[#222222] bg-[#111111] shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
            {product.imagem_url ? (
              <div className="aspect-[16/9] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.imagem_url} alt={product.nome} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="aspect-[16/9] flex items-center justify-center bg-gradient-to-br from-[#090909] via-[#111111] to-[#0d0d0d] text-4xl text-zinc-500">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-900 text-3xl">🛒</div>
                  <span className="text-lg font-semibold">Sem imagem</span>
                </div>
              </div>
            )}

            <div className="p-8">
              <div className="flex flex-col gap-4">
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Loja Linkify</p>
                <h1 className="text-5xl font-black tracking-tight text-white">{product.nome}</h1>
                <p className="max-w-3xl whitespace-pre-line text-base text-zinc-300">{product.descricao}</p>
                <div className="mt-8 rounded-[1.5rem] border border-[#222222] bg-[#0b0b0b] p-8">
                  <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Preço</p>
                  <p className="mt-4 text-5xl font-bold text-emerald-400">R$ {Number(product.preco).toFixed(2).replace('.', ',')}</p>
                </div>
                <a
                  href={product.link_externo ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex w-full max-w-[340px] items-center justify-center rounded-full px-6 py-4 text-base font-semibold text-black transition ${product.link_externo ? 'bg-emerald-500 hover:bg-emerald-400' : 'cursor-not-allowed bg-zinc-700 text-zinc-300'}`}
                >
                  Comprar agora →
                </a>
                <p className="text-sm text-zinc-400">Você será redirecionado para a página de pagamento</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#222222] bg-[#111111] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)]">
            <h2 className="text-xl font-semibold text-white">Sobre o criador</h2>
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile?.foto_url ?? '/favicon.svg'} alt={profile?.nome ?? username} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-white">{profile?.nome ?? username}</p>
                <Link href={`/${username}`} className="text-sm text-emerald-400 hover:text-emerald-300">
                  Ver perfil completo
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#222222] bg-[#111111] p-6 text-sm text-zinc-500">
            <p>Vendido via Linkify</p>
          </div>
        </div>
      </div>
    </main>
  )
}

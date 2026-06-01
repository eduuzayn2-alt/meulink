import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import PurchaseBox from './purchase-box'

interface ProductPageProps {
  params: {
    username: string
    slug: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { username, slug } = params
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
      <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <div className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-[#111111] shadow-[0_40px_120px_rgba(0,0,0,0.25)]">
            {product.imagem_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imagem_url} alt={product.nome} className="h-[420px] w-full object-cover" />
            ) : (
              <div className="flex h-[420px] items-center justify-center bg-zinc-900 text-xl text-zinc-500">Sem imagem</div>
            )}
            <div className="p-8">
              <div className="flex flex-col gap-2">
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Loja Linkify</p>
                <h1 className="mt-3 text-4xl font-semibold leading-tight text-white">{product.nome}</h1>
                <p className="mt-4 max-w-3xl text-zinc-400">{product.descricao}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)]">
            <h2 className="text-xl font-semibold text-white">Sobre o criador</h2>
            <div className="mt-5 flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile?.foto_url ?? '/favicon.svg'} alt={profile?.nome ?? username} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-lg font-semibold">{profile?.nome ?? username}</p>
                <Link href={`/${username}`} className="text-sm text-emerald-400 hover:text-emerald-300">
                  Ver perfil do criador
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-6 text-xs text-zinc-500">
            <p>Vendido via Linkify</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
            <PurchaseBox product={product} />
          </div>
        </div>
      </div>
    </main>
  )
}

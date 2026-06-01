import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'

interface SuccessPageProps {
  params: {
    username: string
    slug: string
  }
  searchParams: { payment_id?: string }
}

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
  const paymentId = searchParams.payment_id

  if (!paymentId) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white px-4 py-24">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-zinc-800 bg-[#111111] p-10 text-center">
          <h1 className="text-3xl font-semibold">Não foi possível confirmar o pagamento</h1>
          <p className="mt-4 text-zinc-400">O código de pagamento está faltando.</p>
        </div>
      </main>
    )
  }

  const { data: sale, error } = await supabase
    .from('vendas')
    .select('*, produto:produtos(*)')
    .eq('payment_id', paymentId)
    .maybeSingle()

  if (error || !sale || sale.status !== 'aprovado' || !sale.produto) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white px-4 py-24">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-zinc-800 bg-[#111111] p-10 text-center">
          <h1 className="text-3xl font-semibold">Pagamento não confirmado</h1>
          <p className="mt-4 text-zinc-400">Ainda não encontramos uma compra aprovada com esse código.</p>
          <Link href={`/${params.username}`} className="mt-8 inline-flex rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-black">
            Voltar ao perfil
          </Link>
        </div>
      </main>
    )
  }

  const product = sale.produto
  const isArquivo = product.tipo_entrega === 'arquivo'
  const actionUrl = isArquivo ? product.arquivo_url : product.link_externo

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-4 py-16">
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-10 text-center shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-4xl font-bold text-black">✓</div>
          <h1 className="mt-6 text-4xl font-semibold">Pagamento confirmado!</h1>
          <p className="mt-4 text-zinc-400">Sua compra foi processada com sucesso.</p>
          <p className="mt-2 text-sm text-zinc-500">Produto: {product.nome}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
            <h2 className="text-2xl font-semibold text-white">Seu acesso está pronto</h2>
            <p className="mt-4 text-zinc-400">Salve este link — você pode acessar seu produto sempre que quiser.</p>
            <div className="mt-6 rounded-[1.5rem] border border-zinc-800 bg-[#0c0c0c] p-6 text-sm text-zinc-300">
              <p className="font-semibold text-white">Link de acesso</p>
              <p className="mt-2 break-words">{actionUrl || 'Link não disponível'}</p>
            </div>
            <div className="mt-8 space-y-4">
              {actionUrl ? (
                <a
                  href={actionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-3xl bg-emerald-500 px-6 py-4 text-sm font-semibold text-black transition hover:bg-emerald-400"
                >
                  {isArquivo ? 'Baixar agora' : 'Acessar produto'}
                </a>
              ) : (
                <div className="rounded-3xl bg-zinc-900 px-6 py-4 text-sm text-zinc-500">O link de entrega ainda não está disponível.</div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Criador</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{product.username}</h3>
            <p className="mt-4 text-zinc-400">Obrigado por apoiar criadores brasileiros com Linkify.</p>
            <Link href={`/${params.username}`} className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200">
              Voltar ao perfil do criador
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

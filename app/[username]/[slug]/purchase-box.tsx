'use client'

import { useState } from 'react'

interface ProductPurchaseBoxProps {
  product: {
    id: string
    nome: string
    descricao: string | null
    preco: string
    imagem_url: string | null
    username: string
    slug: string
  }
}

export default function ProductPurchaseBox({ product }: ProductPurchaseBoxProps) {
  const [email, setEmail] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleBuy = async () => {
    if (!email || !email.includes('@')) {
      setErrorMessage('Digite um email válido para receber a confirmação de compra.')
      return
    }

    setLoading(true)
    setErrorMessage(null)

    const checkoutWindow = window.open('about:blank', '_blank')

    try {
      const res = await fetch('/api/criar-pagamento-produto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produto_id: product.id, comprador_email: email }),
      })

      const json = await res.json()
      if (!res.ok || !json.init_point) {
        setErrorMessage('Não foi possível iniciar o pagamento. Tente novamente.')
        if (checkoutWindow) checkoutWindow.close()
        return
      }

      const url = json.init_point
      if (checkoutWindow) {
        checkoutWindow.location.href = url
      } else {
        window.open(url, '_blank')
      }
    } catch (error) {
      setErrorMessage('Erro ao processar o pagamento. Tente novamente.')
      if (checkoutWindow) checkoutWindow.close()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Pagamento seguro</p>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">R$ {Number(product.preco).toFixed(2).replace('.', ',')}</span>
        </div>
        <p className="mt-3 text-sm text-zinc-400">Pagamento seguro • Entrega imediata</p>
        <button
          onClick={() => setShowModal(true)}
          className="mt-6 w-full rounded-3xl bg-emerald-500 px-5 py-4 text-sm font-semibold text-black transition hover:bg-emerald-400"
        >
          Comprar agora com Pix
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="w-full max-w-xl rounded-[2rem] border border-zinc-800 bg-[#0f0f0f] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Finalizar compra</h2>
                <p className="mt-2 text-sm text-zinc-400">Digite seu email para receber o comprovante e seguir para o checkout.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-400">✕</button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block text-sm text-zinc-300">
                Seu email
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  placeholder="seu@email.com"
                  className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#050505] px-4 py-3 text-white outline-none transition focus:border-white/30"
                />
              </label>
              {errorMessage && <div className="rounded-2xl bg-red-950/80 p-3 text-sm text-red-200">{errorMessage}</div>}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full border border-zinc-700 bg-transparent px-5 py-3 text-sm text-zinc-300 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={handleBuy}
                disabled={loading}
                className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Aguarde...' : 'Ir para o checkout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

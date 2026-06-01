'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

interface ProductFormData {
  id?: string
  nome: string
  descricao: string
  preco: string
  imagem_url: string
  tipo_entrega: 'arquivo' | 'link'
  arquivo_url: string
  link_externo: string
  slug: string
  ativo: boolean
}

const MAX_DESCRIPTION_LENGTH = 500
const MIN_PRICE = 5.0
const BASE_URL = 'https://linkify.app.br'

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function NovoProdutoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('product_id')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  const [form, setForm] = useState<ProductFormData>({
    nome: '',
    descricao: '',
    preco: '',
    imagem_url: '',
    tipo_entrega: 'arquivo',
    arquivo_url: '',
    link_externo: '',
    slug: '',
    ativo: true,
  })
  const [imagePreview, setImagePreview] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')

  useEffect(() => {
    const initialize = async () => {
      setLoading(true)
      setErrorMessage(null)

      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session?.user) {
        router.push('/login')
        return
      }

      const ownerId = data.session.user.id
      setUserId(ownerId)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', ownerId)
        .maybeSingle()

      if (profileError) {
        setErrorMessage('Não foi possível carregar seu perfil.')
        setLoading(false)
        return
      }

      setUsername(profileData?.username ?? '')

      if (productId) {
        const { data: product, error: productError } = await supabase
          .from('produtos')
          .select('*')
          .eq('id', productId)
          .maybeSingle()

        if (productError || !product) {
          setErrorMessage('Produto não encontrado.')
          setLoading(false)
          return
        }

        if (product.user_id !== ownerId) {
          setErrorMessage('Acesso negado.')
          setLoading(false)
          return
        }

        setForm({
          id: product.id,
          nome: product.nome,
          descricao: product.descricao ?? '',
          preco: String(Number(product.preco).toFixed(2)),
          imagem_url: product.imagem_url ?? '',
          tipo_entrega: product.tipo_entrega || 'arquivo',
          arquivo_url: product.arquivo_url ?? '',
          link_externo: product.link_externo ?? '',
          slug: product.slug,
          ativo: product.ativo,
        })
        setImagePreview(product.imagem_url ?? '')
        setFileName(product.arquivo_url ? product.arquivo_url.split('/').pop() ?? '' : '')
        setSlugTouched(true)
      }

      setLoading(false)
    }

    initialize()
  }, [productId, router])

  useEffect(() => {
    if (!slugTouched) {
      setForm((current) => ({ ...current, slug: slugify(current.nome) }))
    }
  }, [form.nome, slugTouched])

  const productUrl = username && form.slug ? `${BASE_URL}/${username}/${form.slug}` : `${BASE_URL}/${username || 'seunome'}/${form.slug || 'seu-produto'}`

  const handleImageFile = async (file: File | null) => {
    if (!file || !userId) return
    setErrorMessage(null)
    setSaving(true)

    try {
      const filePath = `produtos-imagem/${userId}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('produtos-imagens').upload(filePath, file, { upsert: true })
      if (uploadError) {
        setErrorMessage('Erro ao enviar a imagem. Tente novamente.')
        setSaving(false)
        return
      }

      const { data: publicData } = supabase.storage.from('produtos-imagens').getPublicUrl(filePath)
      const publicUrl = (publicData as any)?.publicUrl ?? ''
      if (!publicUrl) {
        setErrorMessage('Não foi possível gerar a URL da imagem.')
        setSaving(false)
        return
      }

      setForm((current) => ({ ...current, imagem_url: publicUrl }))
      setImagePreview(publicUrl)
    } catch (e) {
      setErrorMessage('Erro ao enviar a imagem. Tente novamente.')
    }

    setSaving(false)
  }

  const handleDigitalFile = async (file: File | null) => {
    if (!file || !userId) return
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('O arquivo precisa ter até 50MB.')
      return
    }

    setErrorMessage(null)
    setSaving(true)

    try {
      const filePath = `produtos-arquivos/${userId}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('produtos-arquivos').upload(filePath, file, { upsert: true })
      if (uploadError) {
        setErrorMessage('Erro ao enviar o arquivo. Tente novamente.')
        setSaving(false)
        return
      }

      const { data: publicData } = supabase.storage.from('produtos-arquivos').getPublicUrl(filePath)
      const publicUrl = (publicData as any)?.publicUrl ?? ''
      if (!publicUrl) {
        setErrorMessage('Não foi possível gerar a URL do arquivo.')
        setSaving(false)
        return
      }

      setForm((current) => ({ ...current, arquivo_url: publicUrl }))
      setFileName(file.name)
    } catch (e) {
      setErrorMessage('Erro ao enviar o arquivo. Tente novamente.')
    }

    setSaving(false)
  }

  const handleSubmit = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!form.nome.trim()) {
      setErrorMessage('Digite o nome do produto.')
      return
    }
    if (!form.slug.trim()) {
      setErrorMessage('Digite o slug do produto.')
      return
    }
    const parsedPrice = Number(form.preco.replace(',', '.'))
    if (Number.isNaN(parsedPrice) || parsedPrice < MIN_PRICE) {
      setErrorMessage('O preço deve ser no mínimo R$5,00.')
      return
    }
    if (!form.imagem_url) {
      setErrorMessage('Envie uma imagem de capa para o produto.')
      return
    }
    if (form.tipo_entrega === 'arquivo' && !form.arquivo_url) {
      setErrorMessage('Envie o arquivo digital para o produto.')
      return
    }
    if (form.tipo_entrega === 'link' && !form.link_externo) {
      setErrorMessage('Digite o link de entrega externa.')
      return
    }
    if (!userId) {
      setErrorMessage('Sessão inválida. Faça login novamente.')
      return
    }

    setSaving(true)

    try {
      const payload = {
        user_id: userId,
        username,
        nome: form.nome,
        descricao: form.descricao,
        preco: parsedPrice.toFixed(2),
        imagem_url: form.imagem_url,
        tipo_entrega: form.tipo_entrega,
        arquivo_url: form.tipo_entrega === 'arquivo' ? form.arquivo_url : null,
        link_externo: form.tipo_entrega === 'link' ? form.link_externo : null,
        slug: form.slug,
        ativo: form.ativo,
      }

      if (productId) {
        const { error } = await supabase.from('produtos').update(payload).eq('id', productId)
        if (error) {
          setErrorMessage('Erro ao salvar o produto. Tente novamente.')
          setSaving(false)
          return
        }
        setSuccessMessage('Produto atualizado com sucesso.')
      } else {
        const { error } = await supabase.from('produtos').insert({ ...payload, total_vendas: 0 })
        if (error) {
          setErrorMessage('Erro ao salvar o produto. Tente novamente.')
          setSaving(false)
          return
        }
        setSuccessMessage('Produto criado com sucesso.')
      }
    } catch (e) {
      setErrorMessage('Erro ao salvar o produto. Tente novamente.')
    }

    setSaving(false)
  }

  const isValidCompra = form.slug && username

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-4 py-10">
      <div className="mx-auto max-w-[1100px] space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Loja</p>
            <h1 className="mt-2 text-4xl font-semibold">{productId ? 'Editar produto' : 'Criar produto'}</h1>
            <p className="mt-2 text-zinc-400">Monte sua oferta digital e venda diretamente no perfil público do Linkify.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-full border border-zinc-700 bg-transparent px-5 py-3 text-sm text-white hover:bg-white/5"
            >
              Voltar ao painel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar produto'}
            </button>
          </div>
        </div>

        {errorMessage && <div className="rounded-[2rem] border border-red-700 bg-red-950/80 p-5 text-sm text-red-200">{errorMessage}</div>}
        {successMessage && <div className="rounded-[2rem] border border-emerald-600 bg-emerald-950/80 p-5 text-sm text-emerald-200">{successMessage}</div>}

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-6">
              <label className="block text-sm text-zinc-300">
                Nome do produto
                <input
                  value={form.nome}
                  onChange={(event) => {
                    const value = event.target.value
                    setForm((current) => ({ ...current, nome: value }))
                  }}
                  placeholder="E-book Como Crescer no Instagram"
                  className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#050505] px-4 py-3 text-white outline-none transition focus:border-white/30"
                />
              </label>

              <label className="block text-sm text-zinc-300">
                Descrição
                <textarea
                  value={form.descricao}
                  onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))}
                  placeholder="Conte o que o comprador recebe e por que é imperdível"
                  rows={6}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#050505] px-4 py-3 text-white outline-none transition focus:border-white/30"
                />
                <div className="mt-2 text-right text-xs text-zinc-500">{form.descricao.length}/{MAX_DESCRIPTION_LENGTH}</div>
              </label>

              <label className="block text-sm text-zinc-300">
                Preço
                <div className="mt-3 flex items-center gap-3 rounded-3xl border border-zinc-800 bg-[#050505] px-4 py-3">
                  <span className="text-zinc-400">R$</span>
                  <input
                    value={form.preco}
                    onChange={(event) => setForm((current) => ({ ...current, preco: event.target.value }))}
                    type="number"
                    min={MIN_PRICE}
                    step="0.01"
                    placeholder="47,00"
                    className="w-full bg-transparent text-white outline-none"
                  />
                </div>
              </label>

              <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                <label className="block text-sm text-zinc-300">
                  Imagem de capa
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageFile(event.target.files?.[0] ?? null)}
                    className="mt-3 w-full text-sm text-zinc-200"
                  />
                </label>
                <label className="block text-sm text-zinc-300">
                  Slug da URL
                  <input
                    value={form.slug}
                    onChange={(event) => {
                      setSlugTouched(true)
                      setForm((current) => ({ ...current, slug: slugify(event.target.value) }))
                    }}
                    placeholder="ebook-instagram"
                    className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#050505] px-4 py-3 text-white outline-none transition focus:border-white/30"
                  />
                </label>
              </div>

              <div className="mt-4 rounded-[2rem] border border-zinc-800 bg-[#0b0b0b] p-4 text-sm text-zinc-300">
                URL final:
                <div className="mt-2 break-words text-white">{productUrl}</div>
              </div>

              <div className="mt-6 rounded-[2rem] border border-zinc-800 bg-[#0b0b0b] p-4">
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Tipo de entrega</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {['arquivo', 'link'].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, tipo_entrega: value as 'arquivo' | 'link' }))}
                      className={`rounded-3xl border px-5 py-4 text-left transition ${form.tipo_entrega === value ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-zinc-800 bg-[#090909] text-zinc-300 hover:border-white/20'}`}
                    >
                      <p className="font-semibold text-white">{value === 'arquivo' ? 'Arquivo digital' : 'Link externo'}</p>
                      <p className="mt-2 text-sm text-zinc-400">
                        {value === 'arquivo'
                          ? 'Envie um PDF ou ZIP e o comprador recebe o arquivo automaticamente.'
                          : 'Use um link de Google Drive, Notion, Dropbox ou similar em modo público.'}
                      </p>
                    </button>
                  ))}
                </div>

                {form.tipo_entrega === 'arquivo' ? (
                  <label className="mt-5 block text-sm text-zinc-300">
                    Upload do arquivo digital
                    <input
                      type="file"
                      accept=".pdf,.zip"
                      onChange={(event) => handleDigitalFile(event.target.files?.[0] ?? null)}
                      className="mt-3 w-full text-sm text-zinc-200"
                    />
                    {fileName ? <p className="mt-3 text-sm text-zinc-400">Arquivo carregado: {fileName}</p> : null}
                  </label>
                ) : (
                  <label className="mt-5 block text-sm text-zinc-300">
                    Link externo de entrega
                    <input
                      value={form.link_externo}
                      onChange={(event) => setForm((current) => ({ ...current, link_externo: event.target.value }))}
                      placeholder="https://drive.google.com/arquivo-publico"
                      className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#050505] px-4 py-3 text-white outline-none transition focus:border-white/30"
                    />
                  </label>
                )}

                <p className="mt-3 text-xs text-zinc-500">
                  Se escolher link externo, verifique se ele está acessível em modo público para quem receber o produto.
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Prévia</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Página de venda</h2>
              <p className="mt-4 text-zinc-400">Mostre seu produto com um visual limpo e profissional.</p>
              <div className="mt-6 space-y-4">
                <div className="text-sm text-zinc-400">URL pública</div>
                <div className="rounded-3xl border border-zinc-800 bg-[#050505] px-4 py-3 text-sm text-white break-words">{productUrl}</div>
                <button
                  onClick={() => window.open(productUrl, '_blank')}
                  className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                  disabled={!isValidCompra}
                >
                  Visualizar página de venda
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-6 text-sm text-zinc-400">
              <p className="font-semibold text-white">Dica</p>
              <p className="mt-3">Mantenha o título claro, a descrição objetiva e a imagem principal alinhada ao valor do seu produto.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <NovoProdutoContent />
    </Suspense>
  )
}

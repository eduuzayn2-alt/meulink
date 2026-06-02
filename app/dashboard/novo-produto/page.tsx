'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
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
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
    if (!file) return

    // Validate user session
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user?.id) {
      setErrorMessage('Sessão expirada. Faça login novamente antes de enviar uma imagem.')
      return
    }

    setErrorMessage(null)
    setSaving(true)

    try {
      // Extract file extension
      const fileExt = file.name.split('.').pop() || 'jpg'
      const filePath = `${userId}-${Date.now()}.${fileExt}`
      
      console.log('Iniciando upload de imagem:', { filePath, fileName: file.name, fileSize: file.size })

      const { error: uploadError } = await supabase.storage
        .from('produtos-imagens')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        console.error('Erro ao fazer upload da imagem:', uploadError)
        setErrorMessage(`Erro ao enviar a imagem: ${uploadError.message || 'Tente novamente.'}`)
        setSaving(false)
        return
      }

      console.log('Upload bem sucedido. Gerando URL pública...')

      const { data: publicData } = supabase.storage
        .from('produtos-imagens')
        .getPublicUrl(filePath)

      const publicUrl = (publicData as any)?.publicUrl ?? ''
      
      if (!publicUrl) {
        console.error('Falha ao gerar URL pública')
        setErrorMessage('Não foi possível gerar a URL da imagem. Tente novamente.')
        setSaving(false)
        return
      }

      console.log('URL pública gerada:', publicUrl)
      setForm((current) => ({ ...current, imagem_url: publicUrl }))
      setImagePreview(publicUrl)
      setSuccessMessage('Imagem carregada com sucesso.')
    } catch (e) {
      console.error('Exceção ao fazer upload de imagem:', e)
      setErrorMessage('Erro ao processar a imagem. Tente novamente.')
    }

    setSaving(false)
  }

  const handleDigitalFile = async (file: File | null) => {
    if (!file) return

    // Check file size before anything else
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('O arquivo precisa ter até 50MB.')
      return
    }

    // Validate user session
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user?.id) {
      setErrorMessage('Sessão expirada. Faça login novamente antes de enviar um arquivo.')
      return
    }

    setErrorMessage(null)
    setSaving(true)

    try {
      // Extract file extension
      const fileExt = file.name.split('.').pop() || 'bin'
      const filePath = `${userId}-${Date.now()}.${fileExt}`

      console.log('Iniciando upload de arquivo:', { filePath, fileName: file.name, fileSize: file.size })

      const { error: uploadError } = await supabase.storage
        .from('produtos-arquivos')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        console.error('Erro ao fazer upload do arquivo:', uploadError)
        setErrorMessage(`Erro ao enviar o arquivo: ${uploadError.message || 'Tente novamente.'}`)
        setSaving(false)
        return
      }

      console.log('Upload bem sucedido. Gerando URL pública...')

      const { data: publicData } = supabase.storage
        .from('produtos-arquivos')
        .getPublicUrl(filePath)

      const publicUrl = (publicData as any)?.publicUrl ?? ''

      if (!publicUrl) {
        console.error('Falha ao gerar URL pública do arquivo')
        setErrorMessage('Não foi possível gerar a URL do arquivo. Tente novamente.')
        setSaving(false)
        return
      }

      console.log('URL pública gerada:', publicUrl)
      setForm((current) => ({ ...current, arquivo_url: publicUrl }))
      setFileName(file.name)
      setSuccessMessage('Arquivo carregado com sucesso.')
    } catch (e) {
      console.error('Exceção ao fazer upload de arquivo:', e)
      setErrorMessage('Erro ao processar o arquivo. Tente novamente.')
    }

    setSaving(false)
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    const priceValue = Number(form.preco.replace(',', '.'))

    if (!form.nome.trim()) {
      errors.nome = 'Digite o nome do produto'
    }
    if (!form.slug.trim()) {
      errors.slug = 'Digite o endereço da sua página de venda'
    }
    if (Number.isNaN(priceValue) || priceValue < MIN_PRICE) {
      errors.preco = 'O preço mínimo é R$5,00'
    }
    if (!form.imagem_url) {
      errors.imagem_url = 'Escolha uma imagem de capa'
    }
    if (!form.tipo_entrega || !['arquivo', 'link'].includes(form.tipo_entrega)) {
      errors.tipo_entrega = 'Selecione como vai entregar o produto'
    }
    if (form.tipo_entrega === 'arquivo' && !form.arquivo_url) {
      errors.arquivo_url = 'Envie o arquivo digital'
    }
    if (form.tipo_entrega === 'link') {
      if (!form.link_externo.trim()) {
        errors.link_externo = 'Digite o link de entrega'
      } else if (!/^https?:\/\//i.test(form.link_externo.trim())) {
        errors.link_externo = 'O link deve começar com http ou https'
      }
    }

    return errors
  }

  const handleSubmit = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)
    setHasSubmitted(true)

    const newErrors = validateForm()
    setValidationErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      setErrorMessage(Object.values(newErrors)[0])
      return
    }
    const parsedPrice = Number(form.preco.replace(',', '.'))
    if (!userId) {
      setErrorMessage('Sessão inválida. Faça login novamente.')
      return
    }

    setSaving(true)

    try {
      // Ensure username and slug are valid
      if (!username || !username.trim()) {
        setErrorMessage('Username não carregado. Recarregue a página e tente novamente.')
        setSaving(false)
        return
      }

      if (!form.slug || !form.slug.trim()) {
        setErrorMessage('Slug inválido. Tente novamente.')
        setSaving(false)
        return
      }

      const payload = {
        user_id: userId,
        username: username.trim(),
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        preco: parsedPrice.toFixed(2),
        imagem_url: form.imagem_url,
        tipo_entrega: form.tipo_entrega,
        arquivo_url: form.tipo_entrega === 'arquivo' ? form.arquivo_url : null,
        link_externo: form.tipo_entrega === 'link' ? form.link_externo : null,
        slug: form.slug.trim(),
        ativo: form.ativo,
      }

      console.log('Salvando produto:', { user_id: userId, username, slug: form.slug })

      if (productId) {
        const { error } = await supabase.from('produtos').update(payload).eq('id', productId)
        if (error) {
          console.error('Erro ao atualizar produto:', error)
          setErrorMessage('Erro ao salvar o produto. Tente novamente.')
          setSaving(false)
          return
        }
        console.log('Produto atualizado com sucesso')
        setSuccessMessage('Produto atualizado com sucesso.')
        setTimeout(() => router.push('/dashboard'), 1500)
      } else {
        const { error } = await supabase.from('produtos').insert({ ...payload, total_vendas: 0 })
        if (error) {
          console.error('Erro ao criar produto:', error)
          setErrorMessage('Erro ao salvar o produto. Tente novamente.')
          setSaving(false)
          return
        }
        console.log('Produto criado com sucesso')
        setSuccessMessage('Produto criado com sucesso.')
        setTimeout(() => router.push('/dashboard'), 1500)
      }
    } catch (e) {
      console.error('Exceção ao salvar produto:', e)
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
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-white">Imagem de capa</p>
                  {imagePreview ? (
                    <div className="relative overflow-hidden rounded-3xl border border-emerald-500 bg-[#080908]">
                      <img src={imagePreview} alt="Preview da capa" className="h-56 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('')
                          setForm((current) => ({ ...current, imagem_url: '' }))
                        }}
                        className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
                        aria-label="Remover imagem de capa"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="group flex min-h-[220px] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-zinc-600 bg-[#050505] px-4 py-6 text-center text-white transition hover:border-emerald-500 hover:bg-[#0f0f0f]"
                    >
                      <svg className="h-10 w-10 text-zinc-400 transition group-hover:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 7h4l2-2h4l2 2h4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7z" />
                        <path d="M8 13l2.5 3 3-4" />
                      </svg>
                      <div className="text-sm font-semibold">Clique para adicionar imagem de capa</div>
                      <div className="text-xs text-zinc-500">JPG, PNG ou WEBP — recomendado 1200x630</div>
                    </button>
                  )}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => handleImageFile(event.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                  {hasSubmitted && validationErrors.imagem_url ? (
                    <p className="text-sm text-red-400">{validationErrors.imagem_url}</p>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-white">Endereço da sua página de venda</label>
                  <input
                    value={form.slug}
                    onChange={(event) => {
                      setSlugTouched(true)
                      setForm((current) => ({ ...current, slug: slugify(event.target.value) }))
                    }}
                    placeholder="meu-ebook-instagram"
                    className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#050505] px-4 py-3 text-white outline-none transition focus:border-white/30"
                  />
                  <p className="text-sm text-zinc-500">Use apenas letras minúsculas, números e hífens. Ex: meu-ebook-instagram</p>
                  {hasSubmitted && validationErrors.slug ? (
                    <p className="text-sm text-red-400">{validationErrors.slug}</p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 rounded-[2rem] border border-emerald-500 bg-[#081008] p-4 text-sm text-emerald-300">
                URL final:
                <div className="mt-2 break-words text-emerald-400">{productUrl}</div>
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
                  <div className="mt-5 space-y-3">
                    <p className="text-sm font-semibold text-white">Upload do arquivo digital</p>
                    {fileName ? (
                      <div className="flex items-center justify-between rounded-3xl border border-emerald-500 bg-[#081008] px-4 py-3 text-sm text-emerald-300">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">✓</span>
                          <div>
                            <div className="font-semibold text-white truncate">{fileName}</div>
                            <div className="text-xs text-zinc-500">PDF ou ZIP — até 50MB</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setForm((current) => ({ ...current, arquivo_url: '' }))
                            setFileName('')
                          }}
                          className="rounded-full bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/15"
                          aria-label="Remover arquivo"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="group flex min-h-[120px] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-zinc-600 bg-[#050505] px-4 py-6 text-center text-white transition hover:border-emerald-500 hover:bg-[#0f0f0f]"
                      >
                        <svg className="h-8 w-8 text-zinc-400 transition group-hover:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16v16H4z" />
                          <path d="M4 8h16" />
                          <path d="M8 12h8" />
                        </svg>
                        <div className="text-sm font-semibold">Clique para enviar seu arquivo</div>
                        <div className="text-xs text-zinc-500">PDF ou ZIP — até 50MB</div>
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.zip"
                      onChange={(event) => handleDigitalFile(event.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                    {hasSubmitted && validationErrors.arquivo_url ? (
                      <p className="text-sm text-red-400">{validationErrors.arquivo_url}</p>
                    ) : null}
                  </div>
                ) : (
                  <label className="mt-5 block text-sm text-zinc-300">
                    Link externo de entrega
                    <input
                      value={form.link_externo}
                      onChange={(event) => setForm((current) => ({ ...current, link_externo: event.target.value }))}
                      placeholder="https://drive.google.com/arquivo-publico"
                      className="mt-3 w-full rounded-3xl border border-zinc-800 bg-[#050505] px-4 py-3 text-white outline-none transition focus:border-white/30"
                    />
                    {hasSubmitted && validationErrors.link_externo ? (
                      <p className="mt-2 text-sm text-red-400">{validationErrors.link_externo}</p>
                    ) : null}
                  </label>
                )}

                <p className="mt-3 text-xs text-zinc-500">
                  Se escolher link externo, verifique se ele está acessível em modo público para quem receber o produto.
                </p>
              </div>
            </div>
          </div>

          <aside className="hidden lg:block space-y-6">
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

      <div className="fixed bottom-0 left-0 right-0 z-40 block bg-[#0a0a0a] border-t border-zinc-800 p-4 shadow-[0_-20px_40px_rgba(0,0,0,0.45)] md:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="flex-1 rounded-full border border-zinc-800 bg-transparent px-4 py-3 text-sm text-white transition hover:bg-white/5"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
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

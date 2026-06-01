import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const produtoId = body?.produto_id
    const compradorEmail = body?.comprador_email

    if (!produtoId || !compradorEmail) {
      return NextResponse.json({ error: 'produto_id e comprador_email são obrigatórios' }, { status: 400 })
    }

    const { data: product, error: productError } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', produtoId)
      .maybeSingle()

    if (productError || !product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    const mercadopagoToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!mercadopagoToken) {
      return NextResponse.json({ error: 'MERCADOPAGO_ACCESS_TOKEN não configurado' }, { status: 500 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://linkify.app.br'
    const successUrl = `${appUrl}/${product.username}/${product.slug}/sucesso?payment_id={payment_id}`

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mercadopagoToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            title: product.nome,
            unit_price: Number(product.preco),
            quantity: 1,
          },
        ],
        payer: {
          email: compradorEmail,
        },
        back_urls: {
          success: successUrl,
          failure: `${appUrl}/${product.username}/${product.slug}`,
          pending: `${appUrl}/${product.username}/${product.slug}`,
        },
        auto_return: 'approved',
        metadata: {
          produto_id: produtoId,
          comprador_email: compradorEmail,
        },
      }),
    })

    const preference = await response.json()
    if (!response.ok) {
      return NextResponse.json({ error: preference }, { status: 500 })
    }

    return NextResponse.json({ init_point: preference.init_point, sandbox_init_point: preference.sandbox_init_point, id: preference.id })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar preferência de pagamento' }, { status: 500 })
  }
}

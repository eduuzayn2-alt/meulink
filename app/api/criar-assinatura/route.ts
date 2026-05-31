import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const mercadopagoToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!mercadopagoToken) {
      return NextResponse.json({ error: 'MERCADOPAGO_ACCESS_TOKEN não configurado' }, { status: 500 })
    }

    // You can accept body params if needed in the future
    const body = await request.json().catch(() => ({}))

    const backUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/pagamento/sucesso`

    const payload: any = {
      items: [
        {
          title: 'Linkify Pro',
          unit_price: 29.0,
          quantity: 1,
          currency_id: 'BRL',
        },
      ],
      back_urls: {
        success: backUrl,
      },
      auto_return: 'approved',
      external_reference: body.external_reference ?? undefined,
    }

    if (body.payer_email) {
      payload.payer = { email: body.payer_email }
    }

    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mercadopagoToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: res.status })
    }

    // Mercado Pago returns an object with an id and init_point for preapproval
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno ao criar assinatura' }, { status: 500 })
  }
}

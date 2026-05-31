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

    const payload = {
      reason: 'Assinatura Linkify Pro',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 29.0,
        currency_id: 'BRL',
      },
      payer_email: body.payer_email ?? undefined,
      back_url: backUrl,
      external_reference: body.external_reference ?? undefined,
    }

    const res = await fetch('https://api.mercadopago.com/preapproval', {
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

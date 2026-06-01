import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const mercadopagoToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!mercadopagoToken) {
      return NextResponse.json({ error: 'MERCADOPAGO_ACCESS_TOKEN não configurado' }, { status: 500 })
    }

    const body = await request.json().catch(() => ({}))

    // Mercado Pago can send different payloads. Try to extract an ID.
    const id = body?.data?.id || body?.id || body?.resource?.id || (body?.topic && body.id) || null

    if (!id) {
      // nothing to do, accept the webhook
      return NextResponse.json({ ok: true })
    }

    // Try to fetch payment details
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${mercadopagoToken}` },
    })

    if (!paymentRes.ok) {
      return NextResponse.json({ ok: false }, { status: 200 })
    }

    const payment = await paymentRes.json()

    // Log raw payment webhook for auditing
    try {
      const mpId = payment?.id ?? id
      const topic = body?.topic ?? null
      await supabaseAdmin.from('mp_webhook_logs').insert([
        { mp_id: mpId, topic, raw: { body, payment } },
      ])
    } catch (e) {
      console.warn('Failed to insert webhook log', e)
    }

    // Check approval
    const status = payment?.status || payment?.status_detail || null

    if (status === 'approved' || payment?.status === 'approved') {
      const productId = payment?.metadata?.produto_id || payment?.order?.metadata?.produto_id || null
      const payerUserId =
        payment?.metadata?.user_id ||
        payment?.order?.metadata?.user_id ||
        payment?.external_reference ||
        payment?.order?.external_reference ||
        null

      if (productId) {
        try {
          const paymentId = payment?.id ?? null
          const existingSale = await supabaseAdmin.from('vendas').select('id').eq('payment_id', paymentId).maybeSingle()

          if (!existingSale?.data) {
            const buyerEmail =
              payment?.payer?.email ||
              payment?.metadata?.comprador_email ||
              payment?.order?.metadata?.comprador_email ||
              null

            await supabaseAdmin.from('vendas').insert({
              produto_id: productId,
              comprador_email: buyerEmail ?? 'não informado',
              valor: payment?.transaction_amount ?? 0,
              status: 'aprovado',
              payment_id: paymentId,
            })

            const { data: currentProduct } = await supabaseAdmin.from('produtos').select('total_vendas').eq('id', productId).maybeSingle()
            const nextCount = Number(currentProduct?.total_vendas ?? 0) + 1
            await supabaseAdmin.from('produtos').update({ total_vendas: nextCount }).eq('id', productId)
          }
        } catch (e) {
          console.warn('Erro ao processar venda de produto na webhook:', e)
        }
      }

      if (payerUserId) {
        try {
          // Attempt to update profiles.plan = 'pro' and subscription_status = 'active'
          const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({ plan: 'pro', subscription_status: 'active' })
            .eq('user_id', payerUserId)
            .select()

          if (error) {
            console.warn('Erro ao atualizar perfil na webhook:', error.message)
          }

          // Insert subscription record
          try {
            const subPayload = {
              user_id: payerUserId,
              mp_payment_id: payment?.id ?? null,
              status: 'active',
              amount: payment?.transaction_amount ?? null,
              currency: payment?.currency_id ?? null,
              raw: payment,
            }

            const { data: subData, error: subError } = await supabaseAdmin.from('subscriptions').insert(subPayload).select().maybeSingle()
            if (subError) {
              console.warn('Erro ao inserir subscription na webhook:', subError.message)
            }
          } catch (e) {
            console.warn('Exceção ao inserir subscription:', e)
          }
        } catch (e) {
          console.warn('Exceção ao atualizar perfil:', e)
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erro no webhook' }, { status: 500 })
  }
}

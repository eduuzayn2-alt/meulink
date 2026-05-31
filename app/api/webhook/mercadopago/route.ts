import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

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

    // Check approval
    const status = payment?.status || payment?.status_detail || null

    if (status === 'approved' || payment?.status === 'approved') {
      const externalRef = payment?.external_reference || payment?.order?.external_reference || payment?.metadata?.external_reference

      if (externalRef) {
        try {
          // Attempt to update profiles.plan = 'pro' and subscription_status = 'active'
          const { data, error } = await supabase
            .from('profiles')
            .update({ plan: 'pro', subscription_status: 'active' })
            .eq('user_id', externalRef)
            .select()

          if (error) {
            console.warn('Erro ao atualizar perfil na webhook:', error.message)
          }

          // Insert subscription record
          try {
            const subPayload = {
              user_id: externalRef,
              mp_payment_id: payment?.id ?? null,
              status: 'active',
              amount: payment?.transaction_amount ?? null,
              currency: payment?.currency_id ?? null,
              raw: payment,
            }

            const { data: subData, error: subError } = await supabase.from('subscriptions').insert(subPayload).select().maybeSingle()
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

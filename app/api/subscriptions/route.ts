import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(request: Request) {
  try {
    const token = request.headers.get('x-access-token') || request.headers.get('authorization')?.replace('Bearer ', '')
    const userId = request.headers.get('x-user-id')

    if (!token || !userId) {
      return NextResponse.json({ error: 'Token ou user id ausente' }, { status: 400 })
    }

    if (!SUPABASE_URL || !SUPABASE_ANON) {
      return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
    }

    const url = `${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc`

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON,
        Accept: 'application/json',
      },
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao buscar assinaturas' }, { status: 500 })
  }
}

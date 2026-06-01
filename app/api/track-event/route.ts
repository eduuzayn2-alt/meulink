import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))

    const eventType = body.event || body.event_type || 'unknown'
    const source = body.source || null
    const userId = body.user_id || null
    const payload = body.payload ?? body

    // insert analytics event
    const { error } = await supabase.from('analytics_events').insert([
      {
        user_id: userId,
        event_type: eventType,
        source,
        payload,
      },
    ])

    if (error) {
      console.warn('track-event insert error', error.message)
      return NextResponse.json({ error: 'failed to record event' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
  }
}

"use client"

import { useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface TrackableLinkProps {
  href: string
  userId: string
  linkId: string
  linkTitle: string
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export default function TrackableLink({ href, userId, linkId, linkTitle, children, style, className }: TrackableLinkProps) {
  const handleClick = useCallback(async () => {
    try {
      await supabase.from('analytics_events').insert({
        user_id: userId,
        event_type: 'link_click',
        link_id: linkId,
        link_title: linkTitle,
      })
    } catch (e) {
      // ignora erros de tracking
    }
  }, [userId, linkId, linkTitle])

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={style}
      className={className}
    >
      {children}
    </a>
  )
}
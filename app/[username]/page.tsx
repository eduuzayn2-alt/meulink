import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import TrackableLink from './TrackableLink'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function getLinkIcon(titulo: string, iconUrl?: string, iconName?: string) {
  if (iconUrl) return <img src={iconUrl} alt={titulo} style={{ width: 16, height: 16, borderRadius: 4, objectFit: 'cover' }} />

  const t = (titulo || '').toLowerCase()
  const isInstagram = t.includes('instagram') || iconName === 'Instagram'
  const isWhatsApp = t.includes('whatsapp') || iconName === 'WhatsApp'
  const isYouTube = t.includes('youtube') || iconName === 'YouTube'
  const isTikTok = t.includes('tiktok') || iconName === 'TikTok'
  const isTelegram = t.includes('telegram')

  if (isInstagram) return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="#e1306c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#e1306c" stroke="none"/>
    </svg>
  )
  if (isWhatsApp) return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.1-.471-.149-.67.15-.198.297-.768.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" fill="#25d366"/>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.524 3.66 1.438 5.168L2 22l4.978-1.306A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke="#25d366" strokeWidth="1.5" fill="none"/>
    </svg>
  )
  if (isYouTube) return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="#ff0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 7.2a2.4 2.4 0 00-1.66-1.64C18.72 5 12 5 12 5s-6.72 0-8.34.56A2.4 2.4 0 002 7.2 24 24 0 002 12a24 24 0 00.66 4.8 2.4 2.4 0 001.66 1.64C5.28 19 12 19 12 19s6.72 0 8.34-.56a2.4 2.4 0 001.66-1.64A24 24 0 0022 12a24 24 0 00-.66-4.8z"/>
      <path d="M10 15.5l5-3.5-5-3.5v7z" fill="#ff0000" stroke="none"/>
    </svg>
  )
  if (isTikTok) return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" fill="#fafafa"/>
    </svg>
  )
  if (isTelegram) return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
      <path d="M3.5 12.26l16.6-6.66c.76-.3 1.24.18 1 .94l-2.24 10.54c-.18.8-.7 1.02-1.42.64l-3.9-2.88-1.88 1.8c-.2.2-.36.36-.74.36l.27-3.86 7.03-6.36c.3-.27-.06-.42-.47-.15L8.72 12.1 3.5 10.7c-.76-.22-.78-.22-.78.34 0 .1.03.2.06.29l1.72 5.96c.12.42.43.54.78.35z" fill="#0088cc"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.59 13.41a2 2 0 010-2.82l2.83-2.83a2 2 0 012.83 2.83l-1.15 1.15M7.76 16.24a2 2 0 01-2.83-2.83l1.15-1.15M13.41 10.59l-2.83 2.83"/>
    </svg>
  )
}

export default async function Page({ params }: { params: { username: string } }) {
  const username = (await Promise.resolve(params)).username

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .single()

  if (!profile) {
    return (
      <main style={{ minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem', background: '#111113', border: '0.5px solid #1c1c1e', borderRadius: 16 }}>
          <p style={{ color: '#fafafa', fontSize: 16, marginBottom: 8 }}>Perfil não encontrado</p>
          <p style={{ color: '#52525b', fontSize: 13 }}>@{username}</p>
        </div>
      </main>
    )
  }

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', profile.user_id)

  // Registra visita
  void supabase.from('analytics_events').insert({ user_id: profile.user_id, event_type: 'page_view' })

  return (
    <main style={{ minHeight: '100vh', background: '#09090b', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px 40px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* CAPA */}
        {profile.cover_url && (
          <div style={{ width: '100%', height: 140, borderRadius: 16, overflow: 'hidden', marginBottom: -36, background: '#111113' }}>
            <img src={profile.cover_url} alt="Capa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* AVATAR */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, position: 'relative', zIndex: 2 }}>
          {profile.foto_url ? (
            <Image
              src={profile.foto_url}
              alt={profile.nome ?? 'Foto'}
              width={76}
              height={76}
              unoptimized
              style={{ borderRadius: '50%', border: '3px solid #09090b', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: 76, height: 76, borderRadius: '50%', background: '#1c1c1f', border: '3px solid #09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 500, color: '#7c3aed' }}>
              {(profile.nome || username).slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        {/* NOME E BIO */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 18, fontWeight: 500, color: '#fafafa', marginBottom: 6, letterSpacing: '-0.2px' }}>{profile.nome}</h1>
          {profile.bio && <p style={{ fontSize: 13, color: '#52525b', lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>{profile.bio}</p>}
        </div>

        {/* LINKS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {links?.map((link: any) => (
            <TrackableLink
              key={link.id}
              href={link.url}
              userId={profile.user_id}
              linkId={link.id}
              linkTitle={link.titulo}
              style={{ display: 'flex', alignItems: 'center', background: '#fafafa', borderRadius: 999, padding: '14px 20px', textDecoration: 'none', position: 'relative' }}
            >
              <div style={{ position: 'absolute', left: 18, display: 'flex', alignItems: 'center' }}>
                {getLinkIcon(link.titulo, link.icon_url, link.icon_name)}
              </div>
              <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 500, color: '#09090b', letterSpacing: '-0.1px' }}>{link.titulo}</span>
            </TrackableLink>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
          <a
            href="https://linkify.app.br/login"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#111113', border: '0.5px solid #27272a', borderRadius: 999, padding: '9px 18px', textDecoration: 'none' }}
          >
            <svg width="10" height="10" viewBox="0 0 22 22" fill="none">
              <rect x="3" y="2" width="9" height="14" rx="2" transform="skewX(-8)" fill="#7c3aed"/>
              <rect x="10" y="9" width="9" height="8" rx="2" transform="skewX(-8)" fill="#7c3aed"/>
            </svg>
            <span style={{ fontSize: 11, color: '#71717a' }}>Crie seu</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#7c3aed' }}>Linkify</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </main>
  )
}
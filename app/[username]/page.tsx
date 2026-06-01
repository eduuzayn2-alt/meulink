import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const renderLinkIcon = (link: any) => {
  if (link.icon_url) {
    return (
      <img
        src={link.icon_url}
        alt={link.icon_name || link.titulo}
        className="h-10 w-10 rounded-2xl object-cover"
      />
    )
  }

  const title = (link.titulo || '').toString().toLowerCase()
  const isWhatsApp = title.includes('whatsapp')
  const isInstagram = title.includes('instagram')
  const isYouTube = title.includes('youtube')
  const isTikTok = title.includes('tiktok')
  const isTelegram = title.includes('telegram')

  const iconColor = isWhatsApp
    ? '#25D366'
    : isInstagram
    ? '#E1306C'
    : isYouTube
    ? '#FF0000'
    : isTikTok
    ? '#FFFFFF'
    : isTelegram
    ? '#0088CC'
    : '#888888'

  const iconSvg = isWhatsApp ? (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.1-.472-.149-.672.149-.198.297-.768.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.607.134-.133.297-.347.446-.52.149-.173.198-.298.298-.496.1-.198.05-.372-.025-.521-.075-.149-.672-1.611-.92-2.207-.242-.579-.487-.5-.672-.51l-.573-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.075-.124-.273-.198-.57-.347z" fill="currentColor" />
      <path d="M12 2.04C6.496 2.04 2.04 6.496 2.04 12c0 2.111.685 4.063 1.855 5.702L2 22l4.385-1.152A9.925 9.925 0 0012 21.96C17.504 21.96 21.96 17.504 21.96 12S17.504 2.04 12 2.04z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ) : isInstagram ? (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
      <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.25a4.75 4.75 0 100 9.5 4.75 4.75 0 000-9.5z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17.75 6.75h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ) : isYouTube ? (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
      <path d="M22 7.2a2.4 2.4 0 00-1.66-1.64C18.72 5 12 5 12 5s-6.72 0-8.34.56A2.4 2.4 0 002. 7.2 24 24 0 002 11.4v1.2a24 24 0 00.66 4.2 2.4 2.4 0 001.66 1.64C5.28 19 12 19 12 19s6.72 0 8.34-.56a2.4 2.4 0 001.66-1.64A24 24 0 0022 12.6v-1.2A24 24 0 0022 7.2z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 15.5l5-3.5-5-3.5v7z" fill="currentColor" />
    </svg>
  ) : isTikTok ? (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
      <path d="M9.165 3.66c2.17 0 3.934 1.064 4.92 2.719V12.1h-2.1V6.345a2.708 2.708 0 00-2.82-2.82c-1.552 0-2.818 1.26-2.818 2.82 0 1.558 1.266 2.818 2.818 2.818h.42v2.1h-.42c-2.67 0-4.818-2.147-4.818-4.918 0-2.77 2.148-4.917 4.818-4.917z" fill="currentColor" />
      <path d="M16.5 4.5h1.5v7.5c0 2.97-2.4 5.4-5.4 5.4-1.5 0-2.88-.6-3.87-1.59v-2.31c.96.9 2.22 1.5 3.66 1.5 1.8 0 3.3-1.5 3.3-3.3V4.5z" fill="currentColor" />
    </svg>
  ) : isTelegram ? (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
      <path d="M3.5 12.26l16.6-6.66c.76-.3 1.24.18 1 .94l-2.24 10.54c-.18.8-.7 1.02-1.42.64l-3.9-2.88-1.88 1.8c-.2.2-.36.36-.74.36l.27-3.86 7.03-6.36c.3-.27-.06-.42-.47-.15L8.72 12.1 3.5 10.7c-.76-.22-.78-.22-.78.34 0 .1.03.2.06.29l1.72 5.96c.12.42.43.54.78.35z" fill="currentColor" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
      <path d="M10.59 13.41a2 2 0 010-2.82l2.83-2.83a2 2 0 012.83 0 2 2 0 010 2.83l-1.15 1.15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.76 16.24a2 2 0 01-2.83 0 2 2 0 010-2.83l1.15-1.15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.41 10.59l-2.83 2.83" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-800 bg-[#111]" style={{ color: iconColor }}>
      {iconSvg}
    </div>
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
      <main style={{minHeight:'100vh',background:'#000',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center',padding:'2rem',background:'#111',borderRadius:'1rem'}}>
          <h1 style={{color:'#fff',fontSize:'1.5rem',marginBottom:'0.5rem'}}>Perfil nao encontrado</h1>
          <p style={{color:'#888'}}>username: {username}</p>
        </div>
      </main>
    )
  }

  const { data: links } = await supabase.from('links').select('*').eq('user_id', profile.user_id)

  return (
    <main style={{minHeight:'100vh',background:'#000',color:'#fff',display:'flex',flexDirection:'column',alignItems:'center',padding:'4rem 1rem'}}>
      <div style={{width:'100%',maxWidth:'28rem'}}>
        {profile.cover_url ? (
          <div style={{width:'100%',height:'240px',marginBottom:'1.5rem',overflow:'hidden',borderRadius:'1.5rem',background:'#111'}}>
            <img
              src={profile.cover_url}
              alt="Imagem de capa"
              style={{width:'100%',height:'100%',objectFit:'cover'}}
            />
          </div>
        ) : null}
        {profile.foto_url ? (
          <div style={{display:'flex',justifyContent:'center',marginBottom:'1.5rem'}}>
            <Image
              src={profile.foto_url}
              alt={profile.nome ?? 'Foto de perfil'}
              width={120}
              height={120}
              className="rounded-full"
              unoptimized={true}
            />
          </div>
        ) : null}
        <h1 style={{fontSize:'1.5rem',fontWeight:'bold',textAlign:'center',marginBottom:'0.25rem'}}>{profile.nome}</h1>
        <p style={{color:'#888',textAlign:'center',marginBottom:'2rem'}}>{profile.bio}</p>
        <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
          {links?.map((link: any) => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" style={{background:'#111',border:'1px solid #333',borderRadius:'0.75rem',padding:'1rem',display:'flex',alignItems:'center',gap:'0.75rem',color:'#fff',textDecoration:'none'}}>
              <div style={{flexShrink:0}}>{renderLinkIcon(link)}</div>
              <div>
                <div style={{fontWeight:600}}>{link.titulo}</div>
              </div>
            </a>
          ))}
        </div>
        <footer style={{textAlign:'center',color:'#888',fontSize:'0.75rem',marginTop:'3rem'}}>
          <a
            href="https://linkify.app.br/login"
            target="_blank"
            rel="noreferrer"
            style={{color:'#888',textDecoration:'none'}}
          >
            Crie seu Linkify →
          </a>
        </footer>
      </div>
    </main>
  )
}

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

  const label = (link.icon_name || 'Link').slice(0, 2).toUpperCase()
  const colorMap: Record<string, string> = {
    Instagram: 'text-pink-400',
    YouTube: 'text-red-500',
    WhatsApp: 'text-emerald-400',
    TikTok: 'text-white',
    Site: 'text-sky-400',
    Outro: 'text-zinc-300',
  }
  const colorClass = colorMap[link.icon_name ?? ''] ?? 'text-zinc-400'

  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-800 bg-[#111] ${colorClass}`}>
      {label}
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
            href="https://meulink-ruby.vercel.app/login"
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

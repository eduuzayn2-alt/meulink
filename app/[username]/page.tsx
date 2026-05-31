import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
        <h1 style={{fontSize:'1.5rem',fontWeight:'bold',textAlign:'center',marginBottom:'0.25rem'}}>{profile.nome}</h1>
        <p style={{color:'#888',textAlign:'center',marginBottom:'2rem'}}>{profile.bio}</p>
        <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
          {links?.map((link: any) => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" style={{background:'#111',border:'1px solid #333',borderRadius:'0.75rem',padding:'1rem',textAlign:'center',color:'#fff',textDecoration:'none',display:'block'}}>
              {link.titulo}
            </a>
          ))}
        </div>
        <p style={{textAlign:'center',color:'#444',fontSize:'0.75rem',marginTop:'3rem'}}>feito com Linkify</p>
      </div>
    </main>
  )
}

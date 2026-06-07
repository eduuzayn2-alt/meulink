import Link from 'next/link'
import SubscribeButton from './components/SubscribeButton'

export const metadata = {
  title: 'Linkify — Link na bio, vitrine digital e site com IA',
  description: 'Transforme seu link da bio em uma máquina de conversão. Página profissional, vitrine digital, analytics em tempo real e site criado por IA — tudo em um só lugar.',
  keywords: ['link na bio', 'link bio instagram', 'criar link bio grátis', 'site com ia', 'vitrine digital', 'linktree brasileiro'],
  openGraph: {
    title: 'Linkify — Link na bio, vitrine digital e site com IA',
    description: 'Transforme seu link da bio em uma máquina de conversão. Tudo em um só lugar.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Linkify',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linkify — Link na bio, vitrine digital e site com IA',
    description: 'Transforme seu link da bio em uma máquina de conversão.',
  },
}

const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Linkify',
  url: 'https://linkify.app.br',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'Link na bio, vitrine digital, analytics e site com IA.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
    url: 'https://linkify.app.br/login',
    availability: 'https://schema.org/InStock',
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#09090b', color: '#fafafa' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }} />

      <style>{`
        @keyframes float-left {
          0%, 100% { transform: perspective(800px) rotateY(10deg) rotateX(4deg) translateY(0px); }
          50% { transform: perspective(800px) rotateY(10deg) rotateX(4deg) translateY(-10px); }
        }
        @keyframes float-right {
          0%, 100% { transform: perspective(800px) rotateY(-10deg) rotateX(4deg) translateY(0px); }
          50% { transform: perspective(800px) rotateY(-10deg) rotateX(4deg) translateY(-10px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes progress-fill {
          0% { width: 10%; }
          100% { width: 82%; }
        }
        @keyframes pulse-text {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .screen-left { animation: float-left 4s ease-in-out infinite; }
        .screen-right { animation: float-right 4s ease-in-out infinite 0.6s; }
        .dot-1 { animation: blink 1.2s ease-in-out infinite; }
        .dot-2 { animation: blink 1.2s ease-in-out infinite 0.2s; }
        .dot-3 { animation: blink 1.2s ease-in-out infinite 0.4s; }
        .progress-bar { animation: progress-fill 3s ease-out infinite alternate; }
        .ai-pulse { animation: pulse-text 1.5s ease-in-out infinite; }
        @media (max-width: 640px) {
          .screen-left { animation: none; transform: perspective(800px) rotateY(6deg) rotateX(3deg); }
          .screen-right { animation: none; transform: perspective(800px) rotateY(-6deg) rotateX(3deg); }
          .hero-screens { gap: 8px !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(9,9,11,0.92)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid #1c1c1e' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <rect x="3" y="2" width="9" height="14" rx="2" transform="skewX(-8)" fill="#7c3aed"/>
              <rect x="10" y="9" width="9" height="8" rx="2" transform="skewX(-8)" fill="#7c3aed"/>
            </svg>
            <span style={{ fontSize: 15, fontWeight: 500, color: '#fafafa' }}>Linkify</span>
          </div>
          <div style={{ display: 'flex', gap: 28 }} className="hidden md:flex">
            <a href="#como-funciona" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>Como funciona</a>
            <a href="#planos" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>Preços</a>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/login" style={{ border: '0.5px solid #27272a', borderRadius: 999, padding: '7px 16px', fontSize: 13, color: '#a1a1aa', textDecoration: 'none', background: 'transparent' }}>
              Entrar
            </Link>
            <Link href="/login" style={{ background: '#7c3aed', border: 'none', borderRadius: 999, padding: '7px 16px', fontSize: 13, color: '#fff', fontWeight: 500, textDecoration: 'none' }}>
              Criar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#18181b', border: '0.5px solid #27272a', borderRadius: 999, padding: '5px 16px', fontSize: 12, color: '#a1a1aa', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }}></span>
            +1.000 criadores ativos no Brasil
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 500, color: '#fafafa', lineHeight: 1.15, marginBottom: 16 }}>
            Pare de perder clientes<br />
            <span style={{ color: '#7c3aed' }}>no seu perfil.</span>
          </h1>

          <p style={{ fontSize: 16, color: '#71717a', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Link na bio, vitrine digital, analytics em tempo real e site criado por IA — tudo em um só lugar.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { icon: '🔗', label: 'Link na bio' },
              { icon: '🪟', label: 'Vitrine digital' },
              { icon: '📊', label: 'Analytics' },
              { icon: '🤖', label: 'Site com IA' },
            ].map((p) => (
              <div key={p.label} style={{ background: '#18181b', border: '0.5px solid #27272a', borderRadius: 999, padding: '5px 12px', fontSize: 12, color: '#71717a', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{p.icon}</span>{p.label}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
            <Link href="/login" style={{ background: '#7c3aed', border: 'none', borderRadius: 999, padding: '12px 24px', fontSize: 14, color: '#fff', fontWeight: 500, textDecoration: 'none', display: 'inline-block' }}>
              Quero vender agora — é grátis →
            </Link>
            <a href="#como-funciona" style={{ border: '0.5px solid #27272a', borderRadius: 999, padding: '12px 24px', fontSize: 14, color: '#a1a1aa', textDecoration: 'none', display: 'inline-block' }}>
              Ver como funciona
            </a>
          </div>
          <p style={{ fontSize: 12, color: '#3f3f46', marginBottom: 48 }}>Sem cartão de crédito. Pronto em 2 minutos.</p>

          {/* 3D MOCKUPS */}
          <div className="hero-screens" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 560, margin: '0 auto' }}>

            {/* LEFT — Link na bio + Vitrine */}
            <div>
              <div className="screen-left" style={{ background: '#111113', border: '0.5px solid #1c1c1e', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ background: '#18181b', borderBottom: '0.5px solid #1c1c1e', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                  <span style={{ fontSize: 9, color: '#3f3f46', marginLeft: 6 }}>linkify.app.br/voce</span>
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7c3aed', marginBottom: 8, fontWeight: 500 }}>Link na bio + Vitrine</div>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#27272a', margin: '0 auto 6px' }}></div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: '#fafafa', textAlign: 'center', marginBottom: 2 }}>Seu Nome</div>
                  <div style={{ fontSize: 9, color: '#52525b', textAlign: 'center', marginBottom: 10 }}>Criador digital</div>
                  <div style={{ background: '#18181b', border: '0.5px solid #1c1c1e', borderRadius: 6, padding: '6px 8px', fontSize: 9, color: '#fafafa', marginBottom: 4 }}>Instagram</div>
                  <div style={{ background: '#18181b', border: '0.5px solid #1c1c1e', borderRadius: 6, padding: '6px 8px', fontSize: 9, color: '#fafafa', marginBottom: 8 }}>WhatsApp</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(124,58,237,0.1)', border: '0.5px solid rgba(124,58,237,0.3)', borderRadius: 999, padding: '2px 8px', fontSize: 8, color: '#a78bfa', marginBottom: 6 }}>
                    🪟 Vitrine digital
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                    {[{ e: '📘', n: 'e-book', p: 'R$ 47' }, { e: '🎓', n: 'Mentoria', p: 'R$ 197' }].map((item) => (
                      <div key={item.n} style={{ background: '#18181b', border: '0.5px solid #1c1c1e', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ height: 30, background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{item.e}</div>
                        <div style={{ padding: '4px 5px' }}>
                          <div style={{ fontSize: 8, fontWeight: 500, color: '#fafafa' }}>{item.n}</div>
                          <div style={{ fontSize: 7, color: '#7c3aed' }}>{item.p}</div>
                          <div style={{ fontSize: 7, color: '#52525b' }}>via WhatsApp</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 8, color: '#27272a', textAlign: 'center', marginTop: 8 }}>feito com Linkify</div>
                </div>
              </div>
              <p style={{ fontSize: 10, color: '#52525b', textAlign: 'center', marginTop: 8 }}><strong style={{ color: '#71717a' }}>Link na bio</strong> + vitrine</p>
            </div>

            {/* RIGHT — Site com IA */}
            <div>
              <div className="screen-right" style={{ background: '#111113', border: '0.5px solid rgba(124,58,237,0.3)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ background: '#18181b', borderBottom: '0.5px solid #1c1c1e', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                  <span style={{ fontSize: 9, color: 'rgba(124,58,237,0.6)', marginLeft: 6 }}>Linkify AI Studio</span>
                  <span style={{ fontSize: 7, background: '#7c3aed', color: '#fff', borderRadius: 3, padding: '1px 4px', marginLeft: 2 }}>Beta</span>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#1a1030', border: '0.5px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5">
                        <rect x="3" y="8" width="18" height="13" rx="2"/>
                        <path d="M12 8V5"/><circle cx="12" cy="4" r="1.5"/>
                        <circle cx="8.5" cy="13" r="1.5" fill="#7c3aed" stroke="none"/>
                        <circle cx="15.5" cy="13" r="1.5" fill="#7c3aed" stroke="none"/>
                        <path d="M9 18h6"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 500, color: '#fafafa' }}>Linkify IA</div>
                      <div style={{ fontSize: 8, color: '#7c3aed' }}>Seu site criado por IA</div>
                    </div>
                  </div>
                  <div style={{ background: '#0d0a1a', border: '0.5px solid #27272a', borderRadius: 8, padding: 8, marginBottom: 8 }}>
                    <div style={{ background: '#18181b', borderRadius: 5, padding: '4px 7px', fontSize: 9, color: '#a1a1aa', marginBottom: 5, textAlign: 'right' }}>Sou agência de marketing</div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 4 }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><rect x="3" y="8" width="18" height="13" rx="2"/><circle cx="8.5" cy="13" r="2" fill="#fff" stroke="none"/><circle cx="15.5" cy="13" r="2" fill="#fff" stroke="none"/></svg>
                      </div>
                      <div style={{ background: '#1a1030', border: '0.5px solid rgba(124,58,237,0.2)', borderRadius: 6, padding: '4px 7px', fontSize: 9, color: '#c4b5fd', flex: 1 }}>
                        Criando seu site<span className="ai-pulse">...</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 3, paddingLeft: 19 }}>
                      <span className="dot-1" style={{ width: 4, height: 4, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }}></span>
                      <span className="dot-2" style={{ width: 4, height: 4, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }}></span>
                      <span className="dot-3" style={{ width: 4, height: 4, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }}></span>
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 8, color: '#52525b' }}>Gerando estrutura...</span>
                      <span style={{ fontSize: 8, color: '#7c3aed' }}>82%</span>
                    </div>
                    <div style={{ background: '#18181b', borderRadius: 999, height: 3, overflow: 'hidden' }}>
                      <div className="progress-bar" style={{ height: 3, background: '#7c3aed', borderRadius: 999, width: '10%' }}></div>
                    </div>
                  </div>
                  <div style={{ background: '#1a1030', border: '0.5px solid rgba(124,58,237,0.2)', borderRadius: 7, padding: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 500, color: '#fafafa', marginBottom: 3, lineHeight: 1.3 }}>
                      Estratégias que geram <span style={{ color: '#7c3aed' }}>resultados reais.</span>
                    </div>
                    <div style={{ fontSize: 8, color: '#71717a', marginBottom: 6 }}>Atraia, converta e fidelize com marketing digital.</div>
                    <div style={{ background: '#7c3aed', borderRadius: 999, padding: '3px 10px', fontSize: 8, color: '#fff', fontWeight: 500, display: 'inline-block' }}>Quero resultados</div>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 10, color: '#52525b', textAlign: 'center', marginTop: 8 }}><strong style={{ color: '#71717a' }}>Site com IA</strong> em minutos</p>
            </div>
          </div>

          {/* SOCIAL PROOF */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 40, paddingTop: 32, borderTop: '0.5px solid #1c1c1e' }}>
            <div style={{ display: 'flex' }}>
              {['#7c3aed', '#3b82f6', '#ec4899'].map((c, i) => (
                <div key={c} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: '2px solid #09090b', marginLeft: i === 0 ? 0 : -6 }}></div>
              ))}
            </div>
            <span style={{ fontSize: 13, color: '#52525b' }}>Mais de <strong style={{ color: '#71717a' }}>1.000 criadores</strong> já usam o Linkify</span>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" style={{ padding: '60px 24px', borderTop: '0.5px solid #1c1c1e' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7c3aed', textAlign: 'center', marginBottom: 8, fontWeight: 500 }}>Como funciona</p>
          <h2 style={{ fontSize: 32, fontWeight: 500, color: '#fafafa', textAlign: 'center', marginBottom: 8 }}>Três passos para começar</h2>
          <p style={{ fontSize: 14, color: '#52525b', textAlign: 'center', marginBottom: 40 }}>Do zero à sua página no ar em menos de 2 minutos</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {[
              { n: '1', t: 'Crie sua conta', d: 'Em menos de 1 minuto, sem cartão de crédito' },
              { n: '2', t: 'Monte sua página', d: 'Adicione foto, bio, links e sua vitrine digital' },
              { n: '3', t: 'Conquiste clientes', d: 'Compartilhe seu link e acompanhe os resultados' },
            ].map((s) => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#18181b', border: '0.5px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500, color: '#7c3aed', margin: '0 auto 12px' }}>{s.n}</div>
                <h3 style={{ fontSize: 15, fontWeight: 500, color: '#fafafa', marginBottom: 6 }}>{s.t}</h3>
                <p style={{ fontSize: 13, color: '#52525b', lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECURSOS ── */}
      <section style={{ padding: '60px 24px', borderTop: '0.5px solid #1c1c1e' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7c3aed', textAlign: 'center', marginBottom: 8, fontWeight: 500 }}>Recursos</p>
          <h2 style={{ fontSize: 32, fontWeight: 500, color: '#fafafa', textAlign: 'center', marginBottom: 8 }}>Tudo em um só link</h2>
          <p style={{ fontSize: 14, color: '#52525b', textAlign: 'center', marginBottom: 40 }}>Sem precisar de vários apps diferentes</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            {[
              { e: '🔗', t: 'Link na bio', d: 'Organize todos os seus links em uma página profissional e personalizada.' },
              { e: '🪟', t: 'Vitrine digital', d: 'Mostre seus produtos com foto e preço. A negociação acontece no seu canal.' },
              { e: '📊', t: 'Analytics real', d: 'Acompanhe visitantes e cliques em tempo real. Saiba o que funciona.' },
              { e: '🤖', t: 'Site com IA', d: 'Descreva seu negócio e a IA cria seu site profissional em minutos.' },
            ].map((f) => (
              <div key={f.t} style={{ background: '#111113', border: '0.5px solid #1c1c1e', borderRadius: 12, padding: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, fontSize: 18 }}>{f.e}</div>
                <h3 style={{ fontSize: 14, fontWeight: 500, color: '#fafafa', marginBottom: 6 }}>{f.t}</h3>
                <p style={{ fontSize: 12, color: '#52525b', lineHeight: 1.6 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" style={{ padding: '60px 24px', borderTop: '0.5px solid #1c1c1e' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7c3aed', textAlign: 'center', marginBottom: 8, fontWeight: 500 }}>Preços</p>
          <h2 style={{ fontSize: 32, fontWeight: 500, color: '#fafafa', textAlign: 'center', marginBottom: 8 }}>Simples e transparente</h2>
          <p style={{ fontSize: 14, color: '#52525b', textAlign: 'center', marginBottom: 40 }}>Comece grátis, escale quando quiser</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ background: '#111113', border: '0.5px solid #1c1c1e', borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 12, color: '#52525b', marginBottom: 4 }}>Grátis</div>
              <div style={{ fontSize: 36, fontWeight: 500, color: '#fafafa', marginBottom: 2 }}>R$0</div>
              <div style={{ fontSize: 12, color: '#52525b', marginBottom: 20 }}>para sempre</div>
              {['Até 2 links', 'Página pública', 'Vitrine básica'].map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: '#71717a' }}>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#27272a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#52525b', flexShrink: 0 }}>✓</span>
                  {f}
                </div>
              ))}
              <Link href="/login" style={{ display: 'block', textAlign: 'center', marginTop: 20, background: '#18181b', border: '0.5px solid #27272a', borderRadius: 999, padding: '10px', fontSize: 13, color: '#a1a1aa', textDecoration: 'none' }}>
                Começar grátis
              </Link>
            </div>
            <div style={{ background: '#111113', border: '1px solid #7c3aed', borderRadius: 14, padding: 24 }}>
              <div style={{ background: '#7c3aed', borderRadius: 999, padding: '2px 10px', fontSize: 10, color: '#fff', display: 'inline-block', marginBottom: 8, fontWeight: 500 }}>Mais popular</div>
              <div style={{ fontSize: 12, color: '#52525b', marginBottom: 4 }}>Pro</div>
              <div style={{ fontSize: 36, fontWeight: 500, color: '#fafafa', marginBottom: 2 }}>R$9,90</div>
              <div style={{ fontSize: 12, color: '#52525b', marginBottom: 20 }}>/mês</div>
              {['Até 10 links', 'Vitrine digital completa', 'Analytics avançado', 'Site com IA', 'Sem marca d\'água'].map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: '#a1a1aa' }}>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#7c3aed', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', flexShrink: 0 }}>✓</span>
                  {f}
                </div>
              ))}
              <div style={{ marginTop: 20 }}>
                <SubscribeButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '80px 24px', borderTop: '0.5px solid #1c1c1e', textAlign: 'center' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 500, color: '#fafafa', marginBottom: 12, lineHeight: 1.2 }}>
            Seu próximo cliente já está<br />
            <span style={{ color: '#7c3aed' }}>no seu perfil.</span>
          </h2>
          <p style={{ fontSize: 15, color: '#52525b', marginBottom: 28, lineHeight: 1.6 }}>
            Dê a ele um lugar para chegar. Crie sua página agora e comece a converter.
          </p>
          <Link href="/login" style={{ background: '#7c3aed', border: 'none', borderRadius: 999, padding: '14px 28px', fontSize: 15, color: '#fff', fontWeight: 500, textDecoration: 'none', display: 'inline-block' }}>
            Criar minha página grátis →
          </Link>
          <p style={{ fontSize: 12, color: '#3f3f46', marginTop: 12 }}>Sem cartão. Sem complicação.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '0.5px solid #1c1c1e', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
                  <rect x="3" y="2" width="9" height="14" rx="2" transform="skewX(-8)" fill="#7c3aed"/>
                  <rect x="10" y="9" width="9" height="8" rx="2" transform="skewX(-8)" fill="#7c3aed"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#fafafa' }}>Linkify</span>
              </div>
              <p style={{ fontSize: 12, color: '#3f3f46', lineHeight: 1.6 }}>O link da bio que transforma seguidores em clientes.</p>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#52525b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Produto</div>
              <a href="#como-funciona" style={{ display: 'block', fontSize: 13, color: '#3f3f46', marginBottom: 6, textDecoration: 'none' }}>Como funciona</a>
              <a href="#planos" style={{ display: 'block', fontSize: 13, color: '#3f3f46', textDecoration: 'none' }}>Preços</a>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#52525b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legal</div>
              <Link href="/termos" style={{ display: 'block', fontSize: 13, color: '#3f3f46', marginBottom: 6, textDecoration: 'none' }}>Termos de Uso</Link>
              <Link href="/privacidade" style={{ display: 'block', fontSize: 13, color: '#3f3f46', textDecoration: 'none' }}>Política de Privacidade</Link>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#52525b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contato</div>
              <a href="mailto:contato@linkify.app.br" style={{ display: 'block', fontSize: 13, color: '#3f3f46', textDecoration: 'none' }}>contato@linkify.app.br</a>
            </div>
          </div>
          <div style={{ borderTop: '0.5px solid #1c1c1e', paddingTop: 20, textAlign: 'center', fontSize: 12, color: '#27272a' }}>
            © 2026 Linkify — feito para criadores brasileiros
          </div>
        </div>
      </footer>
    </div>
  )
}
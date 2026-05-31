import Link from 'next/link'
import SubscribeButton from './components/SubscribeButton'

export const metadata = {
  title: 'Linkify — O link da bio que trabalha por você',
  description: 'Transforme seus seguidores em clientes. Crie sua página em 2 minutos, adicione seus links, monte sua loja e venda com Pix.',
}

const stats = [
  { name: 'Sofia', color: 'from-pink-500 to-rose-500' },
  { name: 'Lucas', color: 'from-blue-500 to-cyan-500' },
  { name: 'Marina', color: 'from-purple-500 to-violet-500' },
]

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#0a0a0a' }} className="min-h-screen text-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: 'rgba(10, 10, 10, 0.7)' }}>
        <div className="backdrop-blur-md border-b" style={{ borderColor: '#222222' }}>
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold tracking-tight">Linkify</div>
            <div className="hidden md:flex gap-8 text-sm">
              <a href="#como-funciona" className="hover:text-gray-400 transition">Como funciona</a>
              <a href="#planos" className="hover:text-gray-400 transition">Preços</a>
            </div>
            <div className="flex gap-4">
              <Link href="/login" className="px-6 py-2 text-sm font-semibold border rounded-full hover:bg-white/5 transition" style={{ borderColor: '#222222' }}>
                Entrar
              </Link>
              <Link href="/login" className="px-6 py-2 text-sm font-semibold rounded-full text-black" style={{ backgroundColor: '#ffffff' }}>
                Criar grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-8 border" style={{ backgroundColor: '#111111', borderColor: '#222222' }}>
            Usado por criadores brasileiros
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
            O link da bio que trabalha por você
          </h1>

          <p className="text-lg sm:text-xl mb-10 max-w-3xl mx-auto leading-relaxed" style={{ color: '#888888' }}>
            Transforme seus seguidores em clientes. Crie sua página em 2 minutos, adicione seus links, monte sua loja e comece a vender com Pix — tudo em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link href="/login" className="px-8 py-4 text-lg font-semibold rounded-full text-black transition hover:opacity-90" style={{ backgroundColor: '#ffffff' }}>
              Criar meu link agora — é grátis
            </Link>
          </div>

          <p className="text-sm" style={{ color: '#888888' }}>Sem cartão de crédito. Sem complicação.</p>

          {/* MOCKUP VISUAL */}
          <div className="mt-16 flex justify-center">
            <div className="rounded-3xl p-1 w-full max-w-sm" style={{ background: 'linear-gradient(135deg, #222222, #111111)' }}>
              <div className="rounded-3xl p-8" style={{ backgroundColor: '#111111' }}>
                <div className="w-20 h-20 rounded-full mx-auto mb-4" style={{ backgroundColor: '#222222' }}></div>
                <h3 className="text-xl font-bold">Seu Nome</h3>
                <p className="text-sm mt-2" style={{ color: '#888888' }}>Descrição da sua página</p>
                <div className="space-y-3 mt-6">
                  <div className="rounded-lg p-3 border" style={{ backgroundColor: '#0a0a0a', borderColor: '#222222' }}>
                    <div className="text-sm font-medium">Link 1</div>
                  </div>
                  <div className="rounded-lg p-3 border" style={{ backgroundColor: '#0a0a0a', borderColor: '#222222' }}>
                    <div className="text-sm font-medium">Link 2</div>
                  </div>
                  <div className="rounded-lg p-3 border" style={{ backgroundColor: '#0a0a0a', borderColor: '#222222' }}>
                    <div className="text-sm font-medium">Link 3</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-16 px-6 text-center">
        <p className="text-lg">Mais de <strong>1.000 criadores</strong> já usam o Linkify</p>
        <div className="mt-8 flex justify-center gap-4">
          {stats.map((s) => (
            <div key={s.name} className={`w-12 h-12 rounded-full bg-gradient-to-br ${s.color}`}></div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-16">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold mb-4" style={{ backgroundColor: '#222222' }}>1</div>
              <h3 className="text-xl font-bold mb-2">Crie sua conta</h3>
              <p style={{ color: '#888888' }}>Em menos de 1 minuto, sem cartão</p>
            </div>
            <div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold mb-4" style={{ backgroundColor: '#222222' }}>2</div>
              <h3 className="text-xl font-bold mb-2">Monte sua página</h3>
              <p style={{ color: '#888888' }}>Adicione foto, bio e seus links</p>
            </div>
            <div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold mb-4" style={{ backgroundColor: '#222222' }}>3</div>
              <h3 className="text-xl font-bold mb-2">Comece a vender</h3>
              <p style={{ color: '#888888' }}>Ative sua loja com Pix e receba na hora</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-16">Recursos poderosos</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border" style={{ borderColor: '#222222', backgroundColor: '#111111' }}>
              <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <h3 className="text-xl font-bold mb-3">Links que convertem</h3>
              <p style={{ color: '#888888' }}>Organize e destaque o que mais importa. Cada clique conta.</p>
            </div>

            <div className="p-8 rounded-2xl border" style={{ borderColor: '#222222', backgroundColor: '#111111' }}>
              <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="text-xl font-bold mb-3">Loja com Pix nativa</h3>
              <p style={{ color: '#888888' }}>Crie sua loja e venda cursos, e-books e mentorias direto no seu perfil — sem taxas confusas.</p>
            </div>

            <div className="p-8 rounded-2xl border" style={{ borderColor: '#222222', backgroundColor: '#111111' }}>
              <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-xl font-bold mb-3">Analytics que revelam</h3>
              <p style={{ color: '#888888' }}>Descubra quem clicou, de onde veio e o que mais engaja na sua página.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-16">Preços simples</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="p-8 rounded-2xl border" style={{ borderColor: '#222222', backgroundColor: '#111111' }}>
              <div className="text-2xl font-bold mb-2">Grátis</div>
              <div className="text-4xl font-bold mb-6">R$0</div>
              <ul className="space-y-3 mb-8 text-sm" style={{ color: '#888888' }}>
                <li>Até 3 links</li>
                <li>1 tema</li>
                <li>Marca d'água Linkify</li>
              </ul>
              <Link href="/login" className="w-full block text-center py-3 rounded-full font-semibold border transition" style={{ borderColor: '#222222', backgroundColor: '#1a1a1a' }}>
                Começar grátis
              </Link>
            </div>

            <div className="p-8 rounded-2xl border-2" style={{ borderColor: '#ffffff', backgroundColor: '#111111' }}>
              <div className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-4" style={{ backgroundColor: '#ffffff', color: '#0a0a0a' }}>
                Mais popular
              </div>
              <div className="text-2xl font-bold mb-2">Pro</div>
              <div className="text-4xl font-bold mb-2">R$9,90</div>
              <div className="text-sm mb-6" style={{ color: '#888888' }}>/mês</div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="font-semibold">Links ilimitados</li>
                <li className="font-semibold">Loja com Pix</li>
                <li className="font-semibold">Sem marca d'água</li>
                <li className="font-semibold">Analytics completo</li>
                <li className="font-semibold">Suporte prioritário</li>
              </ul>
              <div className="w-full">
                <SubscribeButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold mb-6">Seu próximo cliente já está no seu perfil</h2>
          <p className="text-lg mb-10" style={{ color: '#888888' }}>Dê a ele um lugar para chegar. Crie sua página agora e comece a vender hoje.</p>
          <Link href="/login" className="inline-block px-8 py-4 text-lg font-semibold rounded-full text-black transition hover:opacity-90" style={{ backgroundColor: '#ffffff' }}>
            Criar minha página grátis →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-12 px-6" style={{ borderColor: '#222222' }}>
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-xl font-bold mb-2">Linkify</div>
              <p style={{ color: '#888888' }} className="text-sm">O link da bio que vende por você</p>
            </div>
            <div>
              <div className="font-bold mb-4 text-sm">Produto</div>
              <a href="#como-funciona" className="block text-sm mb-2 hover:text-gray-400" style={{ color: '#888888' }}>Como funciona</a>
              <a href="#planos" className="block text-sm hover:text-gray-400" style={{ color: '#888888' }}>Preços</a>
            </div>
            <div>
              <div className="font-bold mb-4 text-sm">Legal</div>
              <a href="#" className="block text-sm mb-2 hover:text-gray-400" style={{ color: '#888888' }}>Termos de uso</a>
              <a href="#" className="block text-sm hover:text-gray-400" style={{ color: '#888888' }}>Privacidade</a>
            </div>
            <div>
              <div className="font-bold mb-4 text-sm">Contato</div>
              <a href="mailto:contato@linkify.com" className="block text-sm hover:text-gray-400" style={{ color: '#888888' }}>contato@linkify.com</a>
            </div>
          </div>
          <div className="border-t text-center pt-8 text-sm" style={{ borderColor: '#222222', color: '#888888' }}>
            © 2026 Linkify — feito para criadores brasileiros
          </div>
        </div>
      </footer>
    </div>
  )
}

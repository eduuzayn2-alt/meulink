export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">Linkify 🔗</h1>
        <div className="flex gap-4">
          <a href="/login" className="text-zinc-400 hover:text-white transition">Entrar</a>
          <a href="/cadastro" className="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-zinc-200 transition">Criar grátis</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-8 py-24 max-w-4xl mx-auto">
        <h2 className="text-5xl font-bold mb-6 leading-tight">
          Seu link da bio.<br />
          <span className="text-zinc-400">Do jeito que você merece.</span>
        </h2>
        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
          Links, loja com Pix, e tudo mais — em uma página só. 
          Feito para criadores brasileiros.
        </p>
        <a href="/cadastro" className="bg-white text-black px-8 py-4 rounded-full text-lg font-bold hover:bg-zinc-200 transition">
          Criar minha página grátis →
        </a>
      </section>

      {/* Features */}
      <section className="px-8 py-16 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-zinc-900 p-8 rounded-2xl">
          <div className="text-3xl mb-4">🔗</div>
          <h3 className="text-xl font-bold mb-2">Todos os seus links</h3>
          <p className="text-zinc-400">YouTube, Instagram, WhatsApp — tudo em um lugar só.</p>
        </div>
        <div className="bg-zinc-900 p-8 rounded-2xl">
          <div className="text-3xl mb-4">⚡</div>
          <h3 className="text-xl font-bold mb-2">Loja com Pix</h3>
          <p className="text-zinc-400">Venda e-books, presets e mentorias. Receba na hora via Pix.</p>
        </div>
        <div className="bg-zinc-900 p-8 rounded-2xl">
          <div className="text-3xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">Analytics simples</h3>
          <p className="text-zinc-400">Veja quantas pessoas clicaram em cada link. Simples e claro.</p>
        </div>
      </section>

      {/* Planos */}
      <section className="px-8 py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">Planos simples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 p-8 rounded-2xl">
            <h3 className="font-bold text-lg mb-2">Grátis</h3>
            <div className="text-4xl font-bold mb-6">R$0</div>
            <ul className="text-zinc-400 text-left space-y-2">
              <li>✓ 5 links</li>
              <li>✓ 1 tema</li>
              <li>✗ Sem loja</li>
            </ul>
          </div>
          <div className="bg-white text-black p-8 rounded-2xl">
            <h3 className="font-bold text-lg mb-2">Pro</h3>
            <div className="text-4xl font-bold mb-6">R$29<span className="text-lg font-normal">/mês</span></div>
            <ul className="text-left space-y-2">
              <li>✓ Links ilimitados</li>
              <li>✓ Loja com Pix</li>
              <li>✓ Sem marca d&apos;água</li>
            </ul>
          </div>
          <div className="bg-zinc-900 p-8 rounded-2xl">
            <h3 className="font-bold text-lg mb-2">Business</h3>
            <div className="text-4xl font-bold mb-6">R$79<span className="text-lg font-normal">/mês</span></div>
            <ul className="text-zinc-400 text-left space-y-2">
              <li>✓ Tudo do Pro</li>
              <li>✓ Domínio próprio</li>
              <li>✓ Hotmart integrado</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-zinc-600">
        <p>© 2026 Linkify — feito para criadores brasileiros 🇧🇷</p>
      </footer>
    </main>
  )
}
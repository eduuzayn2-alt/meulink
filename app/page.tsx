import Link from 'next/link'

export const metadata = {
  title: 'Linkify — Seu link da bio que vende por você',
  description: 'Linkify: páginas de bio para criadores brasileiros. Loja com Pix, analytics simples e planos acessíveis.',
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white antialiased">
      <div className="mx-auto max-w-7xl px-6 py-20">
        {/* HERO */}
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight" style={{letterSpacing: '-0.02em'}}>
            Seu link da bio que vende por você
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-zinc-300">
            Crie uma página simples e profissional para divulgar seus conteúdos, vender produtos com Pix e acompanhar resultados — tudo pensado para criadores brasileiros.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link href="/login" className="inline-block rounded-full px-8 py-4 text-lg font-semibold text-black" style={{backgroundColor: '#22c55e'}}>
              Criar minha página grátis
            </Link>
            <a href="#planos" className="inline-block rounded-full px-6 py-4 text-lg font-semibold border border-zinc-700 text-white/90 hover:border-zinc-500">
              Ver planos
            </a>
          </div>
        </header>

        {/* SOCIAL PROOF */}
        <section className="mt-14 flex justify-center">
          <div className="rounded-2xl bg-zinc-900/60 px-6 py-3 text-sm text-zinc-300">Junte-se a <strong className="text-white">+1.000 criadores brasileiros</strong></div>
        </section>

        {/* FEATURES */}
        <section className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">
            <h3 className="font-bold text-lg">Links organizados</h3>
            <p className="mt-3 text-sm text-zinc-400">Organize seus links por prioridade e destaque o que mais converte.</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">
            <h3 className="font-bold text-lg">Loja com Pix</h3>
            <p className="mt-3 text-sm text-zinc-400">Venda direto pelo link com integração nativa de Pix — sem taxas confusas.</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">
            <h3 className="font-bold text-lg">Analytics simples</h3>
            <p className="mt-3 text-sm text-zinc-400">Métricas diretas: cliques, visitas e vendas em um painel objetivo.</p>
          </div>
        </section>

        {/* PLANOS */}
        <section id="planos" className="mt-16">
          <h2 className="text-center text-2xl font-semibold">Planos</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">
              <div className="text-lg font-bold">Grátis</div>
              <div className="mt-2 text-3xl font-extrabold">R$0</div>
              <p className="mt-4 text-sm text-zinc-400">Até 3 links • Marca d'água • Sem loja</p>
              <div className="mt-6">
                <Link href="/login" className="inline-block rounded-full px-6 py-3 text-sm font-semibold text-black" style={{backgroundColor: '#22c55e'}}>Começar grátis</Link>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">
              <div className="text-lg font-bold">Pro</div>
              <div className="mt-2 text-3xl font-extrabold">R$15<span className="text-sm font-medium">/mês</span></div>
              <p className="mt-4 text-sm text-zinc-400">Links ilimitados • Loja com Pix • Sem marca d'água • Analytics</p>
              <div className="mt-6">
                <Link href="/signup" className="inline-block rounded-full px-6 py-3 text-sm font-semibold text-black" style={{backgroundColor: '#22c55e'}}>Assinar Pro</Link>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">
              <div className="text-lg font-bold">Business</div>
              <div className="mt-2 text-3xl font-extrabold">R$39,90<span className="text-sm font-medium">/mês</span></div>
              <p className="mt-4 text-sm text-zinc-400">Tudo do Pro + domínio próprio • Hotmart • Suporte prioritário</p>
              <div className="mt-6">
                <Link href="/contact-sales" className="inline-block rounded-full px-6 py-3 text-sm font-semibold text-black" style={{backgroundColor: '#22c55e'}}>Quero Business</Link>
              </div>
            </div>
          </div>
        </section>

        {/* WHY */}
        <section className="mt-16 rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
          <h2 className="text-2xl font-semibold">Por que o Linkify?</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-bold">Mais barato</h4>
              <p className="mt-2 text-sm text-zinc-400">Preços pensados para criadores com planos acessíveis desde o grátis.</p>
            </div>
            <div>
              <h4 className="font-bold">Feito para o Brasil</h4>
              <p className="mt-2 text-sm text-zinc-400">Fluxos e pagamentos adaptados às necessidades do mercado brasileiro.</p>
            </div>
            <div>
              <h4 className="font-bold">Pix nativo</h4>
              <p className="mt-2 text-sm text-zinc-400">Venda com Pix integrado, sem passar por plataformas complexas.</p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mt-16 text-center">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-10">
            <h3 className="text-2xl font-extrabold">Comece grátis agora — sem cartão de crédito</h3>
            <p className="mt-4 text-zinc-400">Crie sua página, adicione links e venda com Pix em minutos.</p>
            <div className="mt-6">
              <Link href="/login" className="inline-block rounded-full px-8 py-4 text-lg font-semibold text-black" style={{backgroundColor: '#22c55e'}}>Criar minha página grátis</Link>
            </div>
          </div>
        </section>

        <footer className="mt-12 text-center text-sm text-zinc-500">© {new Date().getFullYear()} Linkify — feito para criadores brasileiros</footer>
      </div>
    </main>
  )
}

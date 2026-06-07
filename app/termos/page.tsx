import Link from 'next/link'

export const metadata = {
  title: 'Termos de Uso — Linkify',
  description: 'Termos de Uso do Linkify. Saiba as regras e condições para usar nossa plataforma de links e loja com Pix.',
}

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-3xl font-bold tracking-tight">Linkify</div>
              <p className="mt-2 text-sm text-zinc-400">Termos de Uso</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-zinc-700 bg-[#0d0d0d] px-5 py-3 text-sm font-semibold text-white transition hover:border-emerald-500 hover:text-emerald-400"
            >
              ← Voltar para home
            </Link>
          </div>
          <div className="mt-6 text-sm text-zinc-400">Última atualização: 07/06/2026</div>
        </header>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">O que é o Linkify</h2>
          <p className="mt-4 text-zinc-300 leading-7">
            O Linkify é uma plataforma que permite a criação de páginas de links personalizadas com integração para loja via Pix, ideal para criadores de conteúdo, empreendedores e profissionais que desejam oferecer uma experiência de conversão direta e segura para seus visitantes.
          </p>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">Aceitação dos termos</h2>
          <p className="mt-4 text-zinc-300 leading-7">
            Ao utilizar o Linkify, você concorda integralmente com estes Termos de Uso e com a Política de Privacidade. Caso não aceite as condições descritas, não faça uso do serviço. A continuidade no uso após alterações é considerada aceitação automática das atualizações.
          </p>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">Cadastro e conta</h2>
          <p className="mt-4 text-zinc-300 leading-7">
            O acesso ao Linkify requer cadastro com e-mail válido e criação de senha. Você é responsável por manter seus dados de acesso confidenciais e por qualquer atividade realizada em sua conta. Não é permitido compartilhar credenciais ou permitir acessos não autorizados.
          </p>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">Uso permitido</h2>
          <p className="mt-4 text-zinc-300 leading-7">
            O serviço deve ser utilizado de forma ética e legal, com base em informações verdadeiras e transparentes. Você pode usar o Linkify para promover conteúdo próprio, produtos e serviços, desde que não infrinja direitos de terceiros ou legislação aplicável.
          </p>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">Uso proibido</h2>
          <ul className="mt-4 space-y-3 text-zinc-300 leading-7 list-disc list-inside">
            <li>Distribuir spam, conteúdo malicioso ou mensagens indesejadas.</li>
            <li>Divulgar conteúdo ilegal, odioso, violento, pornográfico ou difamatório.</li>
            <li>Usar dados falsos, assumir identidade de terceiros ou criar contas fraudulentas.</li>
            <li>Realizar qualquer ação que comprometa a segurança, estabilidade ou reputação do Linkify.</li>
          </ul>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">Propriedade intelectual</h2>
          <p className="mt-4 text-zinc-300 leading-7">
            Todo o conteúdo do Linkify, incluindo marca, layout, design, código e documentação, é protegido por direitos autorais e propriedade intelectual. É proibida a reprodução, distribuição ou uso não autorizado desses elementos, salvo quando expressamente permitido.
          </p>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">Cancelamento e exclusão de conta</h2>
          <p className="mt-4 text-zinc-300 leading-7">
            Você pode solicitar o cancelamento ou exclusão de conta a qualquer momento. A remoção de conta implica a eliminação dos dados de perfil, links e conteúdos associados, exceto quando a retenção for exigida por obrigação legal ou para atender a requisitos regulatórios.
          </p>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">Limitação de responsabilidade</h2>
          <p className="mt-4 text-zinc-300 leading-7">
            O Linkify não se responsabiliza por perdas indiretas, lucros cessantes, danos morais ou prejuízos decorrentes de uso inadequado da plataforma. Nosso objetivo é oferecer um serviço confiável, mas não garantimos disponibilidade ininterrupta, ausência de erros ou resultados específicos.
          </p>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">Lei aplicável</h2>
          <p className="mt-4 text-zinc-300 leading-7">
            Estes Termos de Uso são regidos pelas leis do Brasil. Quaisquer disputas relativas ao serviço serão solucionadas no foro da comarca de São Paulo, a menos que a legislação aplicável determine foro diferente.
          </p>
        </section>
      </div>
    </main>
  )
}

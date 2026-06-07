import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade — Linkify',
  description: 'Política de Privacidade do Linkify. Saiba quais dados coletamos, como usamos e como protegemos suas informações.',
}

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-3xl font-bold tracking-tight">Linkify</div>
              <p className="mt-2 text-sm text-zinc-400">Política de Privacidade</p>
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
          <h2 className="text-2xl font-semibold">Quem somos</h2>
          <p className="mt-4 text-zinc-300 leading-7">
            O Linkify é uma plataforma brasileira dedicada a criadores de conteúdo, empreendedores e profissionais que desejam apresentar seus links e produtos em uma página personalizada. Nosso compromisso é oferecer um serviço seguro, transparente e em conformidade com a legislação brasileira de proteção de dados.
          </p>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">Dados que coletamos</h2>
          <ul className="mt-4 space-y-3 text-zinc-300 leading-7 list-disc list-inside">
            <li>Dados de identificação: nome, e-mail e foto de perfil.</li>
            <li>Dados de uso: links, títulos, URLs, ícones e configurações da página pública.</li>
            <li>Dados de autenticação: e-mail e senha criptografada para acesso à sua conta.</li>
            <li>Dados de pagamento e assinatura: informações necessárias para processar transações via Mercado Pago.</li>
            <li>Dados técnicos: endereço IP, dispositivo, navegador e informações de desempenho para melhorar a plataforma.</li>
          </ul>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">Finalidade do tratamento</h2>
          <p className="mt-4 text-zinc-300 leading-7">
            Utilizamos seus dados para permitir o funcionamento da plataforma, autenticar sua conta, exibir sua página pública, gerenciar produtos e vendas, enviar atualizações e atender solicitações de suporte. Também usamos informações de diagnóstico para identificar falhas e aprimorar a experiência do usuário.
          </p>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">Base legal</h2>
          <p className="mt-4 text-zinc-300 leading-7">
            O tratamento dos seus dados baseia-se em:
          </p>
          <ul className="mt-4 space-y-3 text-zinc-300 leading-7 list-disc list-inside">
            <li>Execução de contrato ou medidas pré-contratuais para fornecer o serviço.</li>
            <li>Cumprimento de obrigação legal e regulatória.</li>
            <li>Interesse legítimo do Linkify em manter a plataforma segura e estável.</li>
            <li>Consentimento para finalidades específicas, como o uso de cookies.</li>
          </ul>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">Como protegemos seus dados</h2>
          <p className="mt-4 text-zinc-300 leading-7">
            Adotamos medidas técnicas e administrativas compatíveis com padrões de mercado para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia de conexões, controle de acesso ao ambiente Supabase e monitoramento contínuo de segurança.
          </p>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">Tempo de retenção</h2>
          <p className="mt-4 text-zinc-300 leading-7">
            Reteremos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política, atender obrigações legais e resolver eventuais disputas. Quando os dados não forem mais necessários, eliminaremos ou tornaremos anônimas as informações de acordo com nossos processos internos.
          </p>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">Cookies e tecnologias similares</h2>
          <p className="mt-4 text-zinc-300 leading-7">
            Utilizamos cookies para lembrar sua preferência de consentimento, melhorar a navegação e oferecer uma experiência eficiente. Você pode gerenciar suas preferências por meio das configurações do navegador, mas algumas funcionalidades podem ser afetadas.
          </p>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">Compartilhamento com terceiros</h2>
          <p className="mt-4 text-zinc-300 leading-7">
            Para oferecer o serviço, compartilhamos dados com prestadores de serviço autorizados. Entre eles, Supabase para autenticação, banco de dados e armazenamento, e Mercado Pago para processamento de pagamentos. Esses parceiros estão contratualmente obrigados a proteger seus dados e usá-los apenas para as finalidades previstas.
          </p>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">Direitos do titular</h2>
          <p className="mt-4 text-zinc-300 leading-7">
            Você pode exercer seus direitos de acesso, correção, exclusão, portabilidade, bloqueio e oposição ao tratamento de dados pessoais, conforme a Lei Geral de Proteção de Dados (LGPD). Para isso, entre em contato por e-mail em <a href="mailto:privacidade@linkify.app.br" className="text-emerald-400 hover:text-emerald-300">privacidade@linkify.app.br</a>.
          </p>
        </section>

        <section className="rounded-[2rem] border border-zinc-800 bg-[#111111] p-8">
          <h2 className="text-2xl font-semibold">Atualizações desta política</h2>
          <p className="mt-4 text-zinc-300 leading-7">
            Esta política pode ser atualizada periodicamente para refletir mudanças no serviço, na legislação ou em nossas práticas de privacidade. Publicaremos a data da última atualização no início desta página e, quando necessário, comunicaremos alterações relevantes aos usuários.
          </p>
        </section>
      </div>
    </main>
  )
}

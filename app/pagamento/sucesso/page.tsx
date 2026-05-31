export const metadata = {
  title: 'Pagamento aprovado — Linkify',
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-10 text-center max-w-lg">
        <h1 className="text-2xl font-semibold">Pagamento aprovado</h1>
        <p className="mt-4 text-zinc-400">Obrigado! Sua assinatura foi aprovada e sua conta será atualizada em instantes.</p>
        <div className="mt-6">
          <a href="/dashboard" className="inline-block rounded-full bg-[#22c55e] px-6 py-3 font-semibold text-black">Ir para o painel</a>
        </div>
      </div>
    </main>
  )
}

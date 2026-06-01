import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Linkify — Crie seu link da bio e venda com Pix | Grátis',
  description: 'Crie sua página de links para o Instagram em 2 minutos. Adicione seus links, monte sua loja com Pix e comece a ve
cat > ~/Documents/meulink/app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Linkify — Crie seu link da bio e venda com Pix | Grátis',
  description: 'Crie sua página de links para o Instagram em 2 minutos. Adicione seus links, monte sua loja com Pix e comece a vender. Grátis para sempre.',
  keywords: 'link na bio, link bio instagram, criar link bio gratis, linktree brasileiro, pagina de links instagram, link bio pix',
  openGraph: {
    title: 'Linkify — O link da bio que vende por você',
    description: 'Crie sua página de links para o Instagram em 2 minutos. Links, loja com Pix e analytics — tudo em um lugar.',
    url: 'https://meulink-ruby.vercel.app',
    siteName: 'Linkify',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linkify — O link da bio que vende por você',
    description: 'Crie sua página de links para o Instagram em 2 minutos.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

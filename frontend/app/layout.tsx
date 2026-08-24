import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/lib/auth';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buscar-omega.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'BusCAR — Carros em Ribeirão Preto',
    template: '%s — BusCAR',
  },
  description:
    'Encontre seu próximo carro em Ribeirão Preto. Todo anúncio mostra o preço comparado à Tabela FIPE.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'BusCAR',
    title: 'BusCAR — Carros em Ribeirão Preto',
    description:
      'Encontre seu próximo carro em Ribeirão Preto. Todo anúncio mostra o preço comparado à Tabela FIPE.',
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <div className="flex-1">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}


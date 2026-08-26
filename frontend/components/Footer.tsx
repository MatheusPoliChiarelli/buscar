'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  function handleNav(href: string) {
    if (pathname === href) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <footer className="bg-stone-900 text-stone-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/" onClick={() => handleNav('/')} className="flex items-center gap-2 w-fit">
                <svg viewBox="0 -64 640 640" className="h-8 w-auto fill-brand-600" aria-hidden="true">
                  <path d="M544 192h-16L419.22 56.02A64.025 64.025 0 0 0 369.24 32H155.33c-26.17 0-49.7 15.93-59.42 40.23L48 194.26C20.44 201.4 0 226.21 0 256v112c0 8.84 7.16 16 16 16h48c0 53.02 42.98 96 96 96s96-42.98 96-96h128c0 53.02 42.98 96 96 96s96-42.98 96-96h48c8.84 0 16-7.16 16-16v-80c0-53.02-42.98-96-96-96zM160 432c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm72-240H116.93l38.4-96H232v96zm48 0V96h89.24l76.8 96H280zm200 240c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z" />
                </svg>
                <span className="text-xl font-bold text-white">
                  Bus<span className="text-brand-600">CAR</span>
                </span>
              </Link>
            </div>

            <p className="text-sm mt-3 leading-relaxed">
              Encontre seu próximo carro em Ribeirão Preto com o preço comparado à Tabela FIPE em
              cada anúncio
            </p>
          </div>

          <div className="flex gap-10 sm:contents">
            <div className="sm:justify-self-center">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Navegue</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/" onClick={() => handleNav('/')} className="hover:text-brand-400 transition">
                    Carros
                  </Link>
                </li>
                <li>
                  <Link
                    href="/revendas"
                    onClick={() => handleNav('/revendas')}
                    className="hover:text-brand-400 transition"
                  >
                    Revendas
                  </Link>
                </li>
              </ul>
            </div>

            <div className="sm:justify-self-end">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Institucional</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/termos" className="hover:text-brand-400 transition">
                    Termos de uso
                  </Link>
                </li>
                <li>
                  <Link href="/privacidade" className="hover:text-brand-400 transition">
                    Política de privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-700 mt-8 pt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400">
          <p>© {year} BusCAR · Ribeirão Preto - SP</p>
          <p>Os valores da Tabela FIPE são referência de mercado e não representam avaliação do veículo</p>
        </div>
      </div>
    </footer>
  );
}
'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import DealershipAvatar from '@/components/DealershipAvatar';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { dealership, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = dealership?.name
    ? dealership.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '';

  const navClass = (isActive: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition ${
      isActive ? 'bg-white text-brand-700' : 'text-brand-100 hover:bg-white/15 hover:text-white'
    }`;

  return (
    <header className="bg-brand-600 text-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer shrink-0">
            <svg
              viewBox="0 -64 640 640"
              className="h-10 w-auto shrink-0 animate-drive-in fill-stone-900"
              aria-hidden="true"
            >
              <path d="M544 192h-16L419.22 56.02A64.025 64.025 0 0 0 369.24 32H155.33c-26.17 0-49.7 15.93-59.42 40.23L48 194.26C20.44 201.4 0 226.21 0 256v112c0 8.84 7.16 16 16 16h48c0 53.02 42.98 96 96 96s96-42.98 96-96h128c0 53.02 42.98 96 96 96s96-42.98 96-96h48c8.84 0 16-7.16 16-16v-80c0-53.02-42.98-96-96-96zM160 432c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm72-240H116.93l38.4-96H232v96zm48 0V96h89.24l76.8 96H280zm200 240c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z" />
            </svg>

            <span className="text-2xl font-bold tracking-tight text-white">
              Bus<span className="text-stone-900">CAR</span>
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/"
              className={navClass(pathname === '/' || pathname.startsWith('/veiculo'))}
            >
              Carros
            </Link>
            <Link href="/revendas" className={navClass(pathname.startsWith('/revendas'))}>
              Revendas
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <span className="hidden lg:block text-sm text-brand-100">Ribeirão Preto - SP</span>

          {dealership ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex rounded-full hover:ring-2 hover:ring-white/60 transition"
                aria-label="Menu da conta"
              >
                <DealershipAvatar
                  name={dealership.name}
                  logoUrl={dealership.logo_url}
                  size="sm"
                />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-brand-200 shadow-lg overflow-hidden z-30">
                  <Link
                    href="/minha-revenda"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 border-b border-stone-500 hover:bg-brand-500 transition group"
                  >
                    <p className="text-sm font-semibold text-stone-900 group-hover:text-white truncate">
                      {dealership.name}
                    </p>
                    <p className="text-xs text-stone-500 group-hover:text-white/80 truncate">
                      Editar dados da revenda
                    </p>
                  </Link>

                  <Link
                    href="/meus-anuncios"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-brand-500 hover:text-white transition"
                  >
                    Meus anúncios
                  </Link>
                  <Link
                    href="/anunciar"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-brand-500 hover:text-white transition"
                  >
                    Novo anúncio
                  </Link>

                                    <Link
                    href="/relatorios"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-brand-500 hover:text-white transition"
                  >
                    Relatórios
                  </Link>

                  <button
                    onClick={() => {
                      setOpen(false);
                      signOut();
                      router.push('/');
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-brand-500 hover:text-white border-t border-stone-100 transition"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/entrar"
              className="bg-stone-900 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-stone-800 hover:shadow-md transition-all"
            >
              Anunciar
            </Link>
          )}
        </div>
      </div>
      <nav className="sm:hidden flex bg-white">
        <Link
          href="/"
          className={`flex-1 text-center py-2.5 text-sm font-medium border-b-2 transition ${
            pathname === '/' || pathname.startsWith('/veiculo')
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-stone-500'
          }`}
        >
          Carros
        </Link>
        <Link
          href="/revendas"
          className={`flex-1 text-center py-2.5 text-sm font-medium border-b-2 transition ${
            pathname.startsWith('/revendas')
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-stone-500'
          }`}
        >
          Revendas
        </Link>
      </nav>
    </header>
  );
}
'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Header() {
  const router = useRouter();
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

  return (
    <header className="bg-brand-600 text-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
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

        <div className="flex items-center gap-5">
          <span className="hidden sm:block text-lg text-brand-100">Ribeirão Preto - SP</span>

          {dealership ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="h-9 w-9 rounded-full bg-white text-brand-700 font-bold text-sm flex items-center justify-center hover:bg-brand-500 hover:text-white transition"
                aria-label="Menu da conta"
              >
                {initials}
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-brand-200 shadow-lg overflow-hidden z-30">
                  <Link
                    href="/minha-revenda"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 border-b border-stone-100 hover:bg-brand-50 transition"
                  >
                    <p className="text-sm font-semibold text-stone-900 truncate">
                      {dealership.name}
                    </p>
                    <p className="text-xs text-stone-500 truncate">Editar dados da revenda</p>
                  </Link>

                  <Link
                    href="/meus-anuncios"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-brand-50 transition"
                  >
                    Meus anúncios
                  </Link>
                  <Link
                    href="/anunciar"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-brand-50 transition"
                  >
                    Novo anúncio
                  </Link>

                  <button
                    onClick={() => {
                      setOpen(false);
                      signOut();
                      router.push('/');
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-brand-50 border-t border-stone-100 transition"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/entrar"
              className="text-sm font-medium bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg transition"
            >
              Anunciar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
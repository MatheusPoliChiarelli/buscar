'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { forgotPassword } from '@/lib/api';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');

    if (!email) {
      setError('Informe o e-mail da sua conta');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError('Não foi possível enviar o e-mail. Tente novamente');
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-brand-50">
        <Header />
        <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-up">
          <svg viewBox="0 -64 640 640" className="h-16 w-auto mx-auto fill-brand-600 mb-2" aria-hidden="true">
            <path d="M544 192h-16L419.22 56.02A64.025 64.025 0 0 0 369.24 32H155.33c-26.17 0-49.7 15.93-59.42 40.23L48 194.26C20.44 201.4 0 226.21 0 256v112c0 8.84 7.16 16 16 16h48c0 53.02 42.98 96 96 96s96-42.98 96-96h128c0 53.02 42.98 96 96 96s96-42.98 96-96h48c8.84 0 16-7.16 16-16v-80c0-53.02-42.98-96-96-96zM160 432c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm72-240H116.93l38.4-96H232v96zm48 0V96h89.24l76.8 96H280zm200 240c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z" />
          </svg>

          <div className="w-32 mx-auto border-t-2 border-dashed border-brand-200 mb-6" />

          <h1 className="text-2xl font-bold text-stone-900">Confira seu e-mail</h1>
          <p className="text-stone-500 mt-2">
            Enviamos um link para seu email para criar uma nova senha. Ele
            vale por 1 hora
          </p>

          <Link
            href="/entrar"
            className="inline-block mt-8 bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg shadow-sm hover:bg-brand-700 hover:shadow-md transition-all"
          >
            Voltar para o login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-50">
      <Header />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-brand-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-stone-900">Esqueci minha senha</h1>
          <p className="text-stone-500 text-sm mt-1">
            Informe o e-mail cadastrado e enviaremos um link para criar uma nova senha
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-stone-500 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                className="border border-brand-200 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="contato@revenda.com.br"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-brand-600 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-brand-700 hover:shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar link'}
            </button>
          </div>

          <div className="border-t border-stone-100 mt-6 pt-6 text-center">
            <Link href="/entrar" className="text-sm text-stone-600 group">
              Lembrou a senha?{' '}
              <span className="relative font-semibold text-brand-700 after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-brand-600 after:rounded-full after:transition-all after:duration-300 group-hover:after:w-full">
                Entrar
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
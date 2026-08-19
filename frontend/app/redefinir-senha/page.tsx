'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { resetPassword } from '@/lib/api';

function RedefinirSenhaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');

    if (!token) {
      setError('Link inválido');
      return;
    }

    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres');
      return;
    }

    if (password !== confirm) {
      setError('As senhas não são iguais');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push('/entrar'), 4200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível alterar a senha');
      setLoading(false);
    }
  }

  const inputClass =
    'border border-brand-200 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-brand-400';
  const labelClass = 'block text-xs font-medium uppercase tracking-wide text-stone-500 mb-1.5';

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-brand-200 shadow-sm p-8 text-center">
          <h1 className="text-xl font-bold text-stone-900">Link inválido</h1>
          <p className="text-stone-500 mt-2">
            Este endereço não tem um código válido. Peça um novo link para redefinir a senha
          </p>
          <Link
            href="/esqueci-senha"
            className="inline-block mt-6 bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:bg-brand-700 hover:shadow-md transition-all"
          >
            Pedir novo link
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-up">
        <svg viewBox="0 -64 640 640" className="h-16 w-auto mx-auto fill-brand-600 mb-2" aria-hidden="true">
          <path d="M544 192h-16L419.22 56.02A64.025 64.025 0 0 0 369.24 32H155.33c-26.17 0-49.7 15.93-59.42 40.23L48 194.26C20.44 201.4 0 226.21 0 256v112c0 8.84 7.16 16 16 16h48c0 53.02 42.98 96 96 96s96-42.98 96-96h128c0 53.02 42.98 96 96 96s96-42.98 96-96h48c8.84 0 16-7.16 16-16v-80c0-53.02-42.98-96-96-96zM160 432c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm72-240H116.93l38.4-96H232v96zm48 0V96h89.24l76.8 96H280zm200 240c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z" />
        </svg>

        <div className="w-32 mx-auto border-t-2 border-dashed border-brand-200 mb-6" />

        <h1 className="text-2xl font-bold text-stone-900">Senha alterada!</h1>
        <p className="text-stone-500 mt-2">Já pode entrar na sua conta com a senha nova</p>
        <p className="text-sm text-stone-400 mt-6">Levando você para o login...</p>

        <Link
          href="/entrar"
          className="inline-block mt-5 bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:bg-brand-700 hover:shadow-md transition-all"
        >
          Ir agora
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-xl border border-brand-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-stone-900">Criar nova senha</h1>
        <p className="text-stone-500 text-sm mt-1">
          Escolha uma senha com pelo menos 8 caracteres
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className={labelClass}>Nova senha</label>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Confirmar senha</label>
            <input
              type="password"
              className={inputClass}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-brand-600 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-brand-700 hover:shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <main className="min-h-screen bg-brand-50">
      <Header />
      <Suspense fallback={<p className="max-w-md mx-auto px-4 py-12 text-stone-500">Carregando...</p>}>
        <RedefinirSenhaForm />
      </Suspense>
    </main>
  );
}
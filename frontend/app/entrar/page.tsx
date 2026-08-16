'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { login, register } from '@/lib/api';
import { useAuth } from '@/lib/auth';


export default function EntrarPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Ribeirão Preto');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);

    try {
      const result =
        mode === 'login'
          ? await login(email, password)
          : await register({ name, email, password, phone: phone || undefined, city });

      signIn(result.access_token, result.dealership);
      router.push('/meus-anuncios');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo deu errado.');
      setLoading(false);
    }
  }

  const inputClass =
    'border border-brand-200 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-brand-400';
  const labelClass = 'block text-xs font-medium uppercase tracking-wide text-stone-500 mb-1.5';

  return (
    <main className="min-h-screen bg-brand-50">
      <Header />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-brand-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-stone-900">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {mode === 'login'
              ? 'Acesse para gerenciar os anúncios da sua revenda.'
              : 'Cadastre sua revenda e comece a anunciar em Ribeirão Preto e região.'}
          </p>

          <div className="mt-6 space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className={labelClass}>Nome da revenda *</label>
                  <input
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Auto Center Ribeirão"
                  />
                </div>

                <div>
                  <label className={labelClass}>WhatsApp</label>
                  <input
                    className={inputClass}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="16 99999-8888"
                  />
                </div>

                <div>
                  <label className={labelClass}>Cidade *</label>
                  <input
                    className={inputClass}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <label className={labelClass}>E-mail *</label>
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@revenda.com.br"
              />
            </div>

            <div>
              <label className={labelClass}>Senha *</label>
              <input
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : ''}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-brand-600 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-brand-700 hover:shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </div>

          <div className="border-t border-stone-100 mt-6 pt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="text-sm text-stone-600 hover:text-brand-700 transition"
            >
              {mode === 'login' ? (
                <>
                  Ainda não tem conta? <span className="font-medium text-brand-700">Cadastre sua revenda</span>
                </>
              ) : (
                <>
                  Já tem conta? <span className="font-medium text-brand-700">Entrar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import AddressFields, { type AddressValue } from '@/components/AddressFields';
import { login, register } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatPhone } from '@/lib/cep';

export default function EntrarPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [address, setAddress] = useState<AddressValue>({
    zipCode: '',
    address: '',
    number: '',
    neighborhood: '',
    city: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');

    if (!email || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }

    if (
      mode === 'register' &&
      (!name ||
        !phone ||
        !address.zipCode ||
        !address.address ||
        !address.number ||
        !address.neighborhood ||
        !address.city ||
        !openingHours)
    ) {
      setError('Preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      const result =
        mode === 'login'
          ? await login(email, password)
          : await register({
              name,
              email,
              password,
              phone,
              city: address.city,
              address: address.address,
              address_number: address.number,
              neighborhood: address.neighborhood,
              zip_code: address.zipCode,
              opening_hours: openingHours,
            });

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

      <div
        className={`${mode === 'register' ? 'max-w-3xl' : 'max-w-md'} mx-auto px-4 py-12 transition-all`}
      >
        <div className="bg-white rounded-xl border border-brand-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-stone-900">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {mode === 'login'
              ? 'Acesse para gerenciar os anúncios da sua revenda.'
              : 'Cadastre sua revenda e comece a anunciar em Ribeirão Preto e região.'}
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-6 gap-4">
            {mode === 'register' && (
              <>
                <div className="sm:col-span-4">
                  <label className={labelClass}>Nome da revenda</label>
                  <input
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Auto Center Ribeirão"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>WhatsApp</label>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(16) 99999-8888"
                  />
                </div>

                <AddressFields value={address} onChange={setAddress} />

                <div className="sm:col-span-6">
                  <label className={labelClass}>Horário de funcionamento</label>
                  <input
                    className={inputClass}
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="Seg a sex, 8h às 18h · Sáb, 8h às 12h"
                  />
                </div>
              </>
            )}

            <div className={mode === 'register' ? 'sm:col-span-3' : 'sm:col-span-6'}>
              <label className={labelClass}>E-mail</label>
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@revenda.com.br"
              />
            </div>

            <div className={mode === 'register' ? 'sm:col-span-3' : 'sm:col-span-6'}>
              <label className={labelClass}>Senha</label>
              <input
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : ''}
              />
            </div>

            {error && <p className="sm:col-span-6 text-sm text-red-600">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="sm:col-span-6 w-full bg-brand-600 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-brand-700 hover:shadow-md transition-all disabled:opacity-50"
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
                  Ainda não tem conta?{' '}
                  <span className="font-medium text-brand-700">Cadastre sua revenda</span>
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
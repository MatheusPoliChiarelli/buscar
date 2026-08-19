'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import AddressFields, { type AddressValue } from '@/components/AddressFields';
import DealershipAvatar from '@/components/DealershipAvatar';
import { login, register, uploadLogo } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatPhone } from '@/lib/cep';
import { formatHours } from '@/lib/hours';
import OpeningHoursFields from '@/components/OpeningHoursFields';
import { type HourBlock } from '@/lib/hours';
import Link from 'next/link';

export default function EntrarPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
const [hours, setHours] = useState<HourBlock[]>([
    { days: ['mon', 'tue', 'wed', 'thu', 'fri'], open: '08:00', close: '18:00' },
  ]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [address, setAddress] = useState<AddressValue>({
    zipCode: '',
    address: '',
    number: '',
    neighborhood: '',
    city: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);


  async function handleSubmit() {
    setError('');

    const validHours = hours.filter((h) => h.days.length > 0 && h.open && h.close);

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
        !address.city)
    ) {
      setError('Preencha todos os campos.');
      return;
    }

    if (mode === 'register' && validHours.length === 0) {
      setError('Informe pelo menos um horário de funcionamento.');
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
              opening_hours_json: JSON.stringify(validHours),
            });

      let dealership = result.dealership;

      if (mode === 'register' && logoFile) {
        try {
          dealership = await uploadLogo(logoFile, result.access_token);
        } catch (e) {
          console.error('Falha ao enviar a logo', e);
        }
      }

      signIn(result.access_token, dealership);
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

          {mode === 'register' && (
            <div className="flex items-center gap-5 mt-6 pb-6 border-b border-stone-100">
              <DealershipAvatar name={name || 'Revenda'} logoUrl={logoPreview} size="lg" />

              <div>
                <label className="inline-block border border-brand-500 text-brand-700 font-medium text-sm px-4 py-2 rounded-lg cursor-pointer hover:bg-brand-50 transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                  {logoFile ? 'Trocar logo' : 'Enviar logo'}
                </label>
                <p className="text-xs text-stone-400 mt-2">
                  Opcional · JPG, PNG ou WEBP · imagem quadrada funciona melhor
                </p>
              </div>
            </div>
          )}

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
                  <OpeningHoursFields value={hours} onChange={setHours} />
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

            {mode === 'login' && (
              <div className="sm:col-span-6 -mt-2">
                <Link
                  href="/esqueci-senha"
                  className="text-sm text-stone-500 hover:text-brand-700 transition"
                >
                  Esqueci minha senha
                </Link>
              </div>
            )}

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
              className="text-sm text-stone-600 group"
            >
              {mode === 'login' ? (
                <>
                  Ainda não tem conta?{' '}
                  <span className="relative font-semibold text-brand-700 after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-brand-600 after:rounded-full after:transition-all after:duration-300 group-hover:after:w-full">
                    Cadastre sua revenda
                  </span>
                </>
              ) : (
                <>
                  Já tem conta?{' '}
                  <span className="relative font-semibold text-brand-700 after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-brand-600 after:rounded-full after:transition-all after:duration-300 group-hover:after:w-full">
                    Entrar
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
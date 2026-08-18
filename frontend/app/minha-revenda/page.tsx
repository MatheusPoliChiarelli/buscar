'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import DealershipAvatar from '@/components/DealershipAvatar';
import AddressFields, { type AddressValue } from '@/components/AddressFields';
import { getMe, updateMe, uploadLogo, deleteLogo } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatPhone } from '@/lib/cep';
import OpeningHoursFields from '@/components/OpeningHoursFields';
import { type HourBlock } from '@/lib/hours';


export default function MinhaRevendaPage() {
  const router = useRouter();
  const { token, loading: authLoading, signIn } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [address, setAddress] = useState<AddressValue>({
    zipCode: '',
    address: '',
    number: '',
    neighborhood: '',
    city: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [hours, setHours] = useState<HourBlock[]>([
    { days: ['mon', 'tue', 'wed', 'thu', 'fri'], open: '08:00', close: '18:00' },
  ]);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push('/entrar');
      return;
    }

    getMe(token)
      .then((data) => {
        setName(data.name);
        setPhone(formatPhone(data.phone || ''));
        setOpeningHours(data.opening_hours || '');
        setLogoUrl(data.logo_url || null);
        setAddress({
          zipCode: data.zip_code || '',
          address: data.address || '',
          number: data.address_number || '',
          neighborhood: data.neighborhood || '',
          city: data.city || '',
        });

        if (data.opening_hours_json) {
          try {
            const parsed = JSON.parse(data.opening_hours_json);
            if (Array.isArray(parsed) && parsed.length > 0) setHours(parsed);
          } catch {
            // mantém o padrão
          }
        }
      })
      .catch(() => setError('Não foi possível carregar seus dados.'))
      .finally(() => setLoading(false));
  }, [token, authLoading, router]);

  async function handleLogoChange(file: File | undefined) {
    if (!file || !token) return;
    setUploadingLogo(true);
    setError('');

    try {
      const updated = await uploadLogo(file, token);
      setLogoUrl(updated.logo_url || null);
      signIn(token, updated);
    } catch (e) {
      setError('Não foi possível enviar a logo.');
      console.error(e);
    } finally {
      setUploadingLogo(false);
    }
  }



  async function handleRemoveLogo() {
    if (!token) return;
    setUploadingLogo(true);
    setError('');

    try {
      const updated = await deleteLogo(token);
      setLogoUrl(null);
      signIn(token, updated);
    } catch (e) {
      setError('Não foi possível remover a logo.');
      console.error(e);
    } finally {
      setUploadingLogo(false);
    }
  }



  async function handleSave() {
    if (!token) return;

    const validHours = hours.filter((h) => h.days.length > 0 && h.open && h.close);

    if (
      !name ||
      !phone ||
      !address.zipCode ||
      !address.address ||
      !address.number ||
      !address.neighborhood ||
      !address.city ||
      !openingHours
    ) {
      setError('Preencha todos os campos.');
      return;
    }

    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const updated = await updateMe(
        {
          name,
          phone,
          city: address.city,
          address: address.address,
          address_number: address.number,
          neighborhood: address.neighborhood,
          zip_code: address.zipCode,
          opening_hours_json: JSON.stringify(validHours),
        },
        token
      );
      signIn(token, updated);
      setSaved(true);
      setTimeout(() => router.push('/meus-anuncios'), 4200);
    } catch (e) {
      setError('Não foi possível salvar as alterações.');
      console.error(e);
      setSaving(false);
    }
  }

  const inputClass =
    'border border-brand-200 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-brand-400';
  const labelClass = 'block text-xs font-medium uppercase tracking-wide text-stone-500 mb-1.5';

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-brand-50">
        <Header />
        <p className="max-w-3xl mx-auto px-4 py-8 text-stone-500">Carregando...</p>
      </main>
    );
  }

  if (saved) {
    return (
      <main className="min-h-screen bg-brand-50">
        <Header />

        <div className="max-w-lg mx-auto px-4 py-24 text-center animate-fade-up">
          <svg
            viewBox="0 -64 640 640"
            className="h-16 w-auto mx-auto fill-brand-600 mb-2"
            aria-hidden="true"
          >
            <path d="M544 192h-16L419.22 56.02A64.025 64.025 0 0 0 369.24 32H155.33c-26.17 0-49.7 15.93-59.42 40.23L48 194.26C20.44 201.4 0 226.21 0 256v112c0 8.84 7.16 16 16 16h48c0 53.02 42.98 96 96 96s96-42.98 96-96h128c0 53.02 42.98 96 96 96s96-42.98 96-96h48c8.84 0 16-7.16 16-16v-80c0-53.02-42.98-96-96-96zM160 432c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm72-240H116.93l38.4-96H232v96zm48 0V96h89.24l76.8 96H280zm200 240c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z" />
          </svg>

          <div className="w-32 mx-auto border-t-2 border-dashed border-brand-200 mb-6" />

          <h1 className="text-2xl font-bold text-stone-900">Dados atualizados!</h1>
          <p className="text-stone-500 mt-2">
            As informações da sua revenda já aparecem assim para quem visita seus anúncios.
          </p>
          <p className="text-sm text-stone-400 mt-6">Levando você de volta aos seus anúncios...</p>

          <Link
            href="/meus-anuncios"
            className="inline-block mt-5 bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:bg-brand-700 hover:shadow-md transition-all"
          >
            Ir agora
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/meus-anuncios"
          className="text-sm text-stone-500 hover:text-brand-700 transition"
        >
          ‹ Voltar para meus anúncios
        </Link>

        <h1 className="text-2xl font-bold text-stone-900 mt-3">Minha revenda</h1>
        <p className="text-stone-500 mt-1">
          Estes dados aparecem para o comprador nos seus anúncios.
        </p>

        <div className="bg-white rounded-xl border border-brand-200 shadow-sm p-6 mt-6">
          <div className="flex items-center gap-5 pb-5 border-b border-stone-100">
            <DealershipAvatar name={name || 'Revenda'} logoUrl={logoUrl} size="lg" />

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-block border border-brand-500 text-brand-700 font-medium text-sm px-4 py-2 rounded-lg cursor-pointer hover:bg-brand-100 transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLogoChange(e.target.files?.[0])}
                  />
                  {uploadingLogo ? 'Enviando...' : logoUrl ? 'Trocar logo' : 'Enviar logo'}
                </label>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    disabled={uploadingLogo}
                    className="bg-red-600 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm hover:bg-red-700 hover:shadow-md transition-all disabled:opacity-50"
                  >
                    Remover logo
                  </button>
                )}
              </div>

              <p className="text-xs text-stone-400 mt-2">
                JPG, PNG ou WEBP · imagem quadrada funciona melhor
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mt-5">
            <div className="sm:col-span-4">
              <label className={labelClass}>Nome da revenda</label>
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
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

            {error && <p className="sm:col-span-6 text-red-600 text-sm">{error}</p>}
          </div>

          <div className="border-t border-stone-100 pt-5 mt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg shadow-sm hover:bg-brand-700 hover:shadow-md transition-all disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
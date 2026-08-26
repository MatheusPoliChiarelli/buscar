'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import {
  getVehicle,
  updateVehicle,
  deleteVehicle,
  deletePhoto,
  uploadPhoto,
  photoUrl,
  type Vehicle,
} from '@/lib/api';
import { useAuth } from '@/lib/auth';

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function formatThousands(digits: string): string {
  if (!digits) return '';
  return Number(digits).toLocaleString('pt-BR');
}

function formatCurrency(digits: string): string {
  if (!digits) return '';
  return Number(digits).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

export default function EditarAnuncioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [mileage, setMileage] = useState('');
  const [price, setPrice] = useState('');
  const [mileageInput, setMileageInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [description, setDescription] = useState('');
  const [hasHistory, setHasHistory] = useState(false);
  const [isInspected, setIsInspected] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push('/entrar');
      return;
    }

    getVehicle(Number(id))
      .then((data) => {
        setVehicle(data);
        setMileage(String(data.mileage));
        setPrice(String(data.price));
        setMileageInput(formatThousands(String(data.mileage)));
        setPriceInput(formatCurrency(String(Math.round(data.price))));
        setDescription(data.description || '');
        setHasHistory(data.has_history_report);
        setIsInspected(data.is_inspected);
      })
      .catch(() => setError('Anúncio não encontrado.'))
      .finally(() => setLoading(false));
  }, [id, token, authLoading, router]);

  async function reload() {
    const updated = await getVehicle(Number(id));
    setVehicle(updated);
  }

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      await updateVehicle(
        Number(id),
        {
          mileage: Number(mileage),
          price: Number(price),
          description: description || undefined,
          has_history_report: hasHistory,
          is_inspected: isInspected,
        },
        token
      );
      setSaved(true);
      setTimeout(() => router.push('/meus-anuncios'), 4000);
    } catch (e) {
      setError('Não foi possível salvar as alterações.');
      console.error(e);
      setSaving(false);
    }
  }

async function handleDelete() {
    if (!token) return;
    try {
      await deleteVehicle(Number(id), token);
      setConfirmDelete(false);
      setDeleted(true);
      setTimeout(() => router.push('/meus-anuncios'), 4200);
    } catch (e) {
      setError('Não foi possível remover o anúncio.');
      console.error(e);
    }
  }

  async function handleRemovePhoto(photoId: number) {
    if (!token) return;
    try {
      await deletePhoto(Number(id), photoId, token);
      await reload();
    } catch (e) {
      setError('Não foi possível remover a foto.');
      console.error(e);
    }
  }

  async function handleAddPhotos(newFiles: File[]) {
    if (!token) return;
    try {
      for (const file of newFiles) {
        await uploadPhoto(Number(id), file, token);
      }
      await reload();
    } catch (e) {
      setError('Não foi possível enviar as fotos.');
      console.error(e);
    }
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-brand-50">
        <Header />
        <p className="max-w-3xl mx-auto px-4 py-8 text-stone-500">Carregando...</p>
      </main>
    );
  }

  if (!vehicle) {
    return (
      <main className="min-h-screen bg-brand-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/meus-anuncios" className="text-brand-700 font-medium hover:underline">
            Voltar para meus anúncios
          </Link>
        </div>
      </main>
    );
  }


  if (saved) {
    return (
      <main className="min-h-screen bg-brand-50">
        <Header />

        <div className="max-w-lg mx-auto px-4 py-24 text-center animate-fade-up">
          <svg viewBox="0 -64 640 640" className="h-16 w-auto mx-auto fill-brand-600 mb-2" aria-hidden="true">
            <path d="M544 192h-16L419.22 56.02A64.025 64.025 0 0 0 369.24 32H155.33c-26.17 0-49.7 15.93-59.42 40.23L48 194.26C20.44 201.4 0 226.21 0 256v112c0 8.84 7.16 16 16 16h48c0 53.02 42.98 96 96 96s96-42.98 96-96h128c0 53.02 42.98 96 96 96s96-42.98 96-96h48c8.84 0 16-7.16 16-16v-80c0-53.02-42.98-96-96-96zM160 432c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm72-240H116.93l38.4-96H232v96zm48 0V96h89.24l76.8 96H280zm200 240c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z" />
          </svg>

          <div className="w-32 mx-auto border-t-2 border-dashed border-brand-200 mb-6" />

          <h1 className="text-2xl font-bold text-stone-900">Anúncio atualizado!</h1>
          <p className="text-stone-500 mt-2">
            As alterações já estão valendo para quem visitar o anúncio.
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


  if (deleted) {
    return (
      <main className="min-h-screen bg-brand-50">
        <Header />

        <div className="max-w-lg mx-auto px-4 py-24 text-center animate-fade-up">
          <svg viewBox="0 -64 640 640" className="h-16 w-auto mx-auto fill-stone-300 mb-2" aria-hidden="true">
            <path d="M544 192h-16L419.22 56.02A64.025 64.025 0 0 0 369.24 32H155.33c-26.17 0-49.7 15.93-59.42 40.23L48 194.26C20.44 201.4 0 226.21 0 256v112c0 8.84 7.16 16 16 16h48c0 53.02 42.98 96 96 96s96-42.98 96-96h128c0 53.02 42.98 96 96 96s96-42.98 96-96h48c8.84 0 16-7.16 16-16v-80c0-53.02-42.98-96-96-96zM160 432c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm72-240H116.93l38.4-96H232v96zm48 0V96h89.24l76.8 96H280zm200 240c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z" />
          </svg>

          <div className="w-32 mx-auto border-t-2 border-dashed border-stone-200 mb-6" />

          <h1 className="text-2xl font-bold text-stone-900">Anúncio removido</h1>
          <p className="text-stone-500 mt-2">
            Ele saiu da busca, mas continua na sua lista caso queira consultar depois.
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

  const inputClass =
    'border border-brand-200 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-brand-400';
  const labelClass = 'block text-xs font-medium uppercase tracking-wide text-stone-500 mb-1.5';

  return (
    <main className="min-h-screen bg-brand-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/meus-anuncios" className="text-sm text-stone-500 hover:text-brand-700 transition">
          ‹ Voltar para meus anúncios
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3 mt-3">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-stone-500">
              {vehicle.version || '—'} · {vehicle.year}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {vehicle.active === false ? (
              <span className="text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1.5 rounded-md bg-stone-200 text-stone-600">
                Anúncio removido
              </span>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="bg-red-600 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm hover:bg-red-700 hover:shadow-md transition-all"
              >
                Remover anúncio
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-brand-200 shadow-sm p-6 mt-6 space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-stone-900 mb-3">Fotos</h2>

            <div className="flex flex-wrap gap-3">
              {vehicle.photos.map((photo, i) => (
                <div key={photo.id} className="relative shrink-0">
                  <img
                    src={photoUrl(photo.url)}
                    alt=""
                    className="h-24 w-32 object-cover rounded-lg border border-brand-200"
                  />
                  {i === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-brand-600 text-white text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded">
                      Capa
                    </span>
                  )}
                    <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-stone-900/80 text-white shadow hover:bg-red-600 transition"
                    aria-label="Remover foto"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              <label className="h-24 w-32 shrink-0 border-2 border-dashed border-brand-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 transition">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAddPhotos(Array.from(e.target.files || []))}
                />
                <span className="text-sm text-stone-400">+ Adicionar</span>
              </label>
            </div>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-sm font-semibold text-stone-900 mb-4">Dados editáveis</h2>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Quilometragem</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={inputClass}
                  value={mileageInput}
                  onChange={(e) => {
                    const digits = onlyDigits(e.target.value);
                    setMileageInput(formatThousands(digits));
                    setMileage(digits);
                  }}
                />
              </div>

              <div>
                <label className={labelClass}>Preço</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={inputClass}
                  value={priceInput}
                  onChange={(e) => {
                    const digits = onlyDigits(e.target.value);
                    setPriceInput(formatCurrency(digits));
                    setPrice(digits);
                  }}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className={labelClass}>Descrição</label>
              <textarea
                className={`${inputClass} h-28`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-8 mt-5">
              <button
                type="button"
                role="switch"
                aria-checked={hasHistory}
                onClick={() => setHasHistory(!hasHistory)}
                className="flex items-center gap-2.5 text-sm text-stone-700"
              >
                <span
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    hasHistory ? 'bg-brand-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      hasHistory ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </span>
                Possui histórico veicular
              </button>

              <button
                type="button"
                role="switch"
                aria-checked={isInspected}
                onClick={() => setIsInspected(!isInspected)}
                className="flex items-center gap-2.5 text-sm text-stone-700"
              >
                <span
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    isInspected ? 'bg-brand-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      isInspected ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </span>
                Vistoriado
              </button>
            </div>
          </section>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          

         <div className="border-t border-stone-100 pt-6">
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

      {confirmDelete && (
        <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-lg font-bold text-stone-900">Remover este anúncio?</h2>
            <p className="text-stone-500 text-sm mt-2">
              Ele deixa de aparecer na busca, mas continua na sua lista caso você queira consultar
              depois.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white font-medium py-2.5 rounded-lg hover:bg-red-700 transition"
              >
                Remover
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-stone-300 text-stone-700 font-medium py-2.5 rounded-lg hover:bg-stone-200 hover:border-stone-400 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
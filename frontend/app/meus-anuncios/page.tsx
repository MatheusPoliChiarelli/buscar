'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { listMyVehicles, photoUrl, type Vehicle } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const FUEL_LABELS: Record<string, string> = {
  gasolina: 'Gasolina',
  alcool: 'Álcool',
  flex: 'Flex',
  diesel: 'Diesel',
  hibrido: 'Híbrido',
  eletrico: 'Elétrico',
};

const TRANSMISSION_LABELS: Record<string, string> = {
  manual: 'Manual',
  automatico: 'Automático',
};

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function formatMileage(value: number): string {
  return `${value.toLocaleString('pt-BR')} km`;
}

function formatFuel(value: string | null): string {
  if (!value) return '—';
  return FUEL_LABELS[value.toLowerCase()] || value;
}

function formatTransmission(value: string | null): string {
  if (!value) return '—';
  return TRANSMISSION_LABELS[value.toLowerCase()] || value;
}

export default function MeusAnunciosPage() {
  const router = useRouter();
  const { token, dealership, loading: authLoading } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      router.push('/entrar');
      return;
    }

    listMyVehicles(token)
      .then(setVehicles)
      .catch((e) => {
        setError('Não foi possível carregar seus anúncios.');
        console.error(e);
      })
      .finally(() => setLoading(false));
  }, [token, authLoading, router]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-brand-50">
        <Header />
        <p className="max-w-6xl mx-auto px-4 py-8 text-stone-500">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Meus anúncios</h1>
            <p className="text-stone-500 mt-1">{dealership?.name}</p>
          </div>

          <Link
            href="/anunciar"
            className="bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-brand-700 hover:shadow-md transition-all"
          >
            Novo anúncio
          </Link>
        </div>

        {error && <p className="text-red-600 mt-6">{error}</p>}

        {!error && vehicles.length === 0 && (
          <div className="flex flex-col items-center text-center py-20 animate-fade-up">
            <svg viewBox="0 -64 640 640" className="h-20 w-auto fill-brand-200 mb-1" aria-hidden="true">
              <path d="M544 192h-16L419.22 56.02A64.025 64.025 0 0 0 369.24 32H155.33c-26.17 0-49.7 15.93-59.42 40.23L48 194.26C20.44 201.4 0 226.21 0 256v112c0 8.84 7.16 16 16 16h48c0 53.02 42.98 96 96 96s96-42.98 96-96h128c0 53.02 42.98 96 96 96s96-42.98 96-96h48c8.84 0 16-7.16 16-16v-80c0-53.02-42.98-96-96-96zM160 432c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm72-240H116.93l38.4-96H232v96zm48 0V96h89.24l76.8 96H280zm200 240c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z" />
            </svg>

            <div className="w-40 border-t-2 border-dashed border-brand-200 mb-6" />

            <h2 className="text-lg font-semibold text-stone-900">Sua garagem ainda está vazia</h2>
            <p className="text-stone-500 mt-2 max-w-md">
              Publique o primeiro veículo e ele aparece na busca de quem está procurando carro na
              região.
            </p>

            <Link
              href="/anunciar"
              className="mt-6 bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-brand-700 transition"
            >
              Anunciar veículo
            </Link>
          </div>
        )}

        {vehicles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {vehicles.map((vehicle, index) => (
              <Link
                key={vehicle.id}
                href={`/meus-anuncios/${vehicle.id}`}
                style={{ animationDelay: `${index * 60}ms` }}
                className={`animate-fade-up bg-white rounded-xl border border-brand-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full ${
                  vehicle.active === false ? 'opacity-60' : ''
                }`}
              >
                <div className="h-44 bg-stone-100 relative">
                  {vehicle.photos.length > 0 ? (
                    <img
                      src={photoUrl(vehicle.photos[0].url)}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm">
                      Sem foto
                    </div>
                  )}

                  {vehicle.active === false && (
                    <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md bg-stone-900/80 text-white">
                      Removido
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-stone-900">
                      {vehicle.brand} {vehicle.model}
                    </p>

                    {vehicle.fipe_price && (
                      <span
                        className={`shrink-0 text-[13px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md border ${
                          vehicle.price <= vehicle.fipe_price
                            ? 'border-money-600/30 text-money-700 bg-money-600/5'
                            : 'border-brand-500/30 text-brand-700 bg-brand-500/5'
                        }`}
                      >
                        FIPE {formatPrice(vehicle.fipe_price)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-stone-500">
                    {vehicle.version || '—'} · {vehicle.year}
                  </p>

                  <p className="text-2xl font-bold text-money-700 mt-2">
                    {formatPrice(vehicle.price)}
                  </p>

                  <p className="text-sm text-stone-500 mt-1">
                    {formatMileage(vehicle.mileage)} · {formatTransmission(vehicle.transmission)} ·{' '}
                    {formatFuel(vehicle.fuel)}
                  </p>
                </div>

                <div className="bg-brand-600 px-4 py-2.5 rounded-b-xl">
                  <p className="text-xs font-medium text-white">Clique para editar</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
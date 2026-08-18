'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import DealershipAvatar from '@/components/DealershipAvatar';
import {
  getDealership,
  listDealershipVehicles,
  photoUrl,
  type Dealership,
  type Vehicle,
} from '@/lib/api';
import { formatHours } from '@/lib/hours';

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

export default function RevendaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [dealership, setDealership] = useState<Dealership | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getDealership(Number(id)), listDealershipVehicles(Number(id))])
      .then(([d, v]) => {
        setDealership(d);
        setVehicles(v);
      })
      .catch(() => setError('Revenda não encontrada.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-50">
        <Header />
        <p className="max-w-6xl mx-auto px-4 py-8 text-stone-500">Carregando...</p>
      </main>
    );
  }

  if (error || !dealership) {
    return (
      <main className="min-h-screen bg-brand-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/revendas" className="text-brand-700 font-medium hover:underline">
            Ver todas as revendas
          </Link>
        </div>
      </main>
    );
  }

  const whatsappLink = dealership.phone
    ? `https://wa.me/55${dealership.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Olá! Vi os anúncios da ${dealership.name} no BusCAR.`
      )}`
    : null;

  return (
    <main className="min-h-screen bg-brand-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/revendas" className="text-sm text-stone-500 hover:text-brand-700 transition">
          ‹ Todas as revendas
        </Link>

        <div className="bg-white rounded-xl border border-brand-200 shadow-sm p-6 mt-3">
          <div className="flex flex-wrap items-start gap-5">
            <DealershipAvatar name={dealership.name} logoUrl={dealership.logo_url} size="lg" />

            <div className="flex-1 min-w-56">
              <h1 className="text-2xl font-bold text-stone-900">{dealership.name}</h1>

              {dealership.address && (
                <p className="text-stone-600 mt-1">
                  {dealership.address}
                  {dealership.address_number ? `, ${dealership.address_number}` : ''}
                </p>
              )}

              {dealership.neighborhood && (
                <p className="text-stone-600">{dealership.neighborhood}</p>
              )}

              <p className="text-stone-600">
                {dealership.city}
                {dealership.state ? ` - ${dealership.state}` : ''}
              </p>

              {dealership.zip_code && (
                <p className="text-stone-600">CEP {dealership.zip_code}</p>
              )}

              {(dealership.opening_hours_json || dealership.opening_hours) && (
                <p className="text-stone-600 mt-3">
                  {formatHours(dealership.opening_hours_json) || dealership.opening_hours}
                </p>
              )}
            </div>

            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 bg-money-600 text-white font-semibold px-5 py-3 rounded-lg shadow-sm hover:bg-money-700 hover:shadow-md transition-all"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23a8.2 8.2 0 0 1 8.22 8.24c0 4.54-3.7 8.23-8.23 8.23z" />
                </svg>
                Falar no WhatsApp
              </a>
            )}
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 animate-fade-up">
            <svg viewBox="0 -64 640 640" className="h-20 w-auto fill-brand-200 mb-1" aria-hidden="true">
              <path d="M544 192h-16L419.22 56.02A64.025 64.025 0 0 0 369.24 32H155.33c-26.17 0-49.7 15.93-59.42 40.23L48 194.26C20.44 201.4 0 226.21 0 256v112c0 8.84 7.16 16 16 16h48c0 53.02 42.98 96 96 96s96-42.98 96-96h128c0 53.02 42.98 96 96 96s96-42.98 96-96h48c8.84 0 16-7.16 16-16v-80c0-53.02-42.98-96-96-96zM160 432c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm72-240H116.93l38.4-96H232v96zm48 0V96h89.24l76.8 96H280zm200 240c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z" />
            </svg>

            <div className="w-40 border-t-2 border-dashed border-brand-200 mb-6" />

            <h2 className="text-lg font-semibold text-stone-900">
              Esta revenda ainda não publicou anúncios
            </h2>
            <p className="text-stone-500 mt-2 max-w-md">
              Ela ainda não tem carros anunciados no BusCAR. Vale chamar no WhatsApp para saber o
              que está chegando, ou voltar em outro momento
            </p>

            <Link
              href="/revendas"
              className="mt-6 bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:bg-brand-700 hover:shadow-md transition-all"
            >
              Ver outras revendas
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-stone-900 mt-8">
              {vehicles.length === 1
                ? '1 carro anunciado'
                : `${vehicles.length} carros anunciados`}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
              {vehicles.map((vehicle, index) => (
                <Link
                  key={vehicle.id}
                  href={`/veiculo/${vehicle.id}`}
                  style={{ animationDelay: `${index * 60}ms` }}
                  className="animate-fade-up bg-white rounded-xl border border-brand-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full"
                >
                  <div className="h-44 bg-stone-100">
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
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
'use client';

import Header from '@/components/Header';
import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { getVehicle, photoUrl, type Vehicle } from '@/lib/api';



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

function formatFuel(value: string | null): string {
  if (!value) return '—';
  return FUEL_LABELS[value.toLowerCase()] || value;
}

function formatTransmission(value: string | null): string {
  if (!value) return '—';
  return TRANSMISSION_LABELS[value.toLowerCase()] || value;
}

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export default function VehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getVehicle(Number(id));
        setVehicle(data);
      } catch (e) {
        setError('Anúncio não encontrado.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-50">
        <Header />
        <p className="max-w-5xl mx-auto px-4 py-8 text-stone-500">Carregando...</p>
      </main>
    );
  }

  if (error || !vehicle) {
    return (
      <main className="min-h-screen bg-brand-50">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-brand-700 font-medium hover:underline">
            Voltar para a busca
          </Link>
        </div>
      </main>
    );
  }

  const whatsappLink = vehicle.dealership.phone
    ? `https://wa.me/55${vehicle.dealership.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.year} anunciado no BusCAR.`
      )}`
    : null;
return (
    <main className="min-h-screen bg-brand-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Link href="/" className="text-sm text-stone-500 hover:text-brand-700 transition">
          ‹ Todos os carros
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-6 pt-3 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:grid-rows-[auto_1fr]">
        <div className="lg:col-span-2 bg-white rounded-xl border border-brand-200 overflow-hidden">
          <div className="aspect-[16/10] sm:aspect-auto sm:h-80 bg-stone-100 relative">
            {vehicle.photos.length > 0 ? (
              <>
                <img
                  src={photoUrl(vehicle.photos[selectedPhoto].url)}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setZoomed(true)}
                />

                {vehicle.photos.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedPhoto(
                          (selectedPhoto - 1 + vehicle.photos.length) % vehicle.photos.length
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-md hover:bg-white transition "
                      aria-label="Foto anterior"
                    >
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>

                    <button
                      onClick={() => setSelectedPhoto((selectedPhoto + 1) % vehicle.photos.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-md hover:bg-white transition "
                      aria-label="Próxima foto"
                    >
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>

                    <span className="absolute bottom-3 left-3 text-xs font-medium px-2 py-1 rounded-md bg-stone-900/70 text-white transition">
                      Clique para ampliar
                    </span>

                    <span className="absolute bottom-3 right-3 text-xs font-medium px-2 py-1 rounded-md bg-stone-900/70 text-white">
                      {selectedPhoto + 1} / {vehicle.photos.length}
                    </span>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">
                Sem foto disponível
              </div>
            )}
          </div>

          {vehicle.photos.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {vehicle.photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(index)}
                  className={`h-16 w-24 shrink-0 rounded-lg overflow-hidden border-2 transition ${
                    index === selectedPhoto ? 'border-brand-500' : 'border-transparent'
                  }`}
                >
                  <img src={photoUrl(photo.url)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-brand-200 p-5">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-stone-900">
              {vehicle.brand} {vehicle.model}
            </h1>

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

          <p className="text-stone-500">{vehicle.version || '—'}</p>
          <p className="text-3xl font-bold text-money-700 mt-3">{formatPrice(vehicle.price)}</p>

          {vehicle.fipe_price && (
            <p
              className={`text-sm font-medium mt-1 ${
                vehicle.price < vehicle.fipe_price
                  ? 'text-money-700'
                  : vehicle.price === vehicle.fipe_price
                  ? 'text-stone-600'
                  : 'text-brand-700'
              }`}
            >
              {vehicle.price < vehicle.fipe_price
                ? 'Valor abaixo da FIPE'
                : vehicle.price === vehicle.fipe_price
                ? 'Valor igual à FIPE'
                : 'Valor acima da FIPE'}
            </p>
          )}

          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-500">Ano</dt>
              <dd className="text-stone-900">{vehicle.year}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">Quilometragem</dt>
              <dd className="text-stone-900">{vehicle.mileage.toLocaleString('pt-BR')} km</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">Câmbio</dt>
              <dd className="text-stone-900">{formatTransmission(vehicle.transmission)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">Combustível</dt>
              <dd className="text-stone-900">{formatFuel(vehicle.fuel)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">Cor</dt>
              <dd className="text-stone-900">{vehicle.color || '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-brand-200 p-5">
          <h2 className="font-semibold text-stone-900 mb-2">Descrição</h2>
          <p className="text-stone-700 whitespace-pre-line">
            {vehicle.description || 'Sem descrição informada.'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-brand-200 p-5">
          <h2 className="font-semibold text-stone-900">{vehicle.dealership.name}</h2>
          <p className="text-sm text-stone-500">{vehicle.dealership.city}</p>

          {whatsappLink && (
              <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 bg-money-600 text-white font-semibold px-4 py-3.5 rounded-lg mt-4 shadow-sm hover:bg-money-700 hover:shadow-md transition-all duration-200"
              >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23a8.2 8.2 0 0 1 8.22 8.24c0 4.54-3.7 8.23-8.23 8.23z" />
              </svg>
              Falar no WhatsApp
            </a>
          )}
        </div>
      </div>

      {zoomed && vehicle.photos.length > 0 && (
        <div
          className="fixed inset-0 bg-stone-900/90 flex items-center justify-center p-4 z-50"
          onClick={() => setZoomed(false)}
        >
          <button
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 h-11 w-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Fechar"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <img
            src={photoUrl(vehicle.photos[selectedPhoto].url)}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="max-h-full max-w-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {vehicle.photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhoto((selectedPhoto - 1 + vehicle.photos.length) % vehicle.photos.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                aria-label="Foto anterior"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhoto((selectedPhoto + 1) % vehicle.photos.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                aria-label="Próxima foto"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-medium px-3 py-1.5 rounded-md bg-white/10 text-white">
                {selectedPhoto + 1} / {vehicle.photos.length}
              </span>
            </>
          )}
        </div>
      )}
    </main>
  );
}
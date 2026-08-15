'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { getVehicle, photoUrl, type Vehicle } from '@/lib/api';

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export default function VehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(0);

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
    return <main className="min-h-screen p-8 text-gray-500">Carregando...</main>;
  }

  if (error || !vehicle) {
    return (
      <main className="min-h-screen p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/" className="text-blue-600 hover:underline">Voltar para a busca</Link>
      </main>
    );
  }

  const whatsappLink = vehicle.dealership.phone
    ? `https://wa.me/55${vehicle.dealership.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.year} anunciado no BusCAR.`
      )}`
    : null;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold">
            Bus<span className="text-blue-600">CAR</span>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="h-80 bg-gray-200">
              {vehicle.photos.length > 0 ? (
                <img
                  src={photoUrl(vehicle.photos[selectedPhoto].url)}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
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
                    className={`h-16 w-24 shrink-0 rounded overflow-hidden border-2 ${
                      index === selectedPhoto ? 'border-blue-600' : 'border-transparent'
                    }`}
                  >
                    <img src={photoUrl(photo.url)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {vehicle.description && (
            <div className="bg-white rounded-lg border p-5 mt-5">
              <h2 className="font-semibold mb-2">Descrição</h2>
              <p className="text-gray-700 whitespace-pre-line">{vehicle.description}</p>
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div className="bg-white rounded-lg border p-5">
            <h1 className="text-xl font-bold">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-gray-500">{vehicle.version || '—'}</p>
            <p className="text-3xl font-bold text-blue-600 mt-3">{formatPrice(vehicle.price)}</p>

            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Ano</dt>
                <dd>{vehicle.year}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Quilometragem</dt>
                <dd>{vehicle.mileage.toLocaleString('pt-BR')} km</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Câmbio</dt>
                <dd>{vehicle.transmission || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Combustível</dt>
                <dd>{vehicle.fuel || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Cor</dt>
                <dd>{vehicle.color || '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg border p-5">
            <h2 className="font-semibold">{vehicle.dealership.name}</h2>
            <p className="text-sm text-gray-500">{vehicle.dealership.city}</p>

            {whatsappLink && (
                <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-green-600 text-white px-4 py-3 rounded mt-4 hover:bg-green-700"
              >
                Falar no WhatsApp
              </a>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
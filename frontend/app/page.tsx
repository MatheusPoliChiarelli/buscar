'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { listVehicles, photoUrl, type Vehicle, type VehicleFilters } from '@/lib/api';

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function formatMileage(value: number): string {
  return `${value.toLocaleString('pt-BR')} km`;
}

export default function Home() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<VehicleFilters>({});
  const [showAnimation, setShowAnimation] = useState(false);

  async function loadVehicles(activeFilters: VehicleFilters) {
    setLoading(true);
    setError('');
    try {
      const data = await listVehicles(activeFilters);
      setVehicles(data);
    } catch (e) {
      setError('Não foi possível carregar os anúncios.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVehicles({});
  }, []);


  useEffect(() => {
    const seen = sessionStorage.getItem('buscar-intro');
    if (!seen) {
      setShowAnimation(true);
      sessionStorage.setItem('buscar-intro', '1');
    }
  }, []);

  function handleSearch() {
    loadVehicles(filters);
  }

  return (
    <main className="min-h-screen bg-brand-50">
      <header className="bg-brand-600 text-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg
              viewBox="0 -64 640 640"
              className="h-10 w-auto shrink-0 animate-drive-in fill-stone-900"
              aria-hidden="true"
            >
              <path d="M544 192h-16L419.22 56.02A64.025 64.025 0 0 0 369.24 32H155.33c-26.17 0-49.7 15.93-59.42 40.23L48 194.26C20.44 201.4 0 226.21 0 256v112c0 8.84 7.16 16 16 16h48c0 53.02 42.98 96 96 96s96-42.98 96-96h128c0 53.02 42.98 96 96 96s96-42.98 96-96h48c8.84 0 16-7.16 16-16v-80c0-53.02-42.98-96-96-96zM160 432c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm72-240H116.93l38.4-96H232v96zm48 0V96h89.24l76.8 96H280zm200 240c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z" />
            </svg>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              Bus<span className="text-stone-900">CAR</span>
            </h1>
          </div>

          <span className="text-sm text-brand-100">Ribeirão Preto e região</span>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-brand-200 shadow-sm p-4 flex flex-wrap gap-3">
          <input
            className="border border-brand-200 rounded-lg px-3 py-2 flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Marca"
            value={filters.brand || ''}
            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
          />
          <input
            className="border border-brand-200 rounded-lg px-3 py-2 flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Modelo"
            value={filters.model || ''}
            onChange={(e) => setFilters({ ...filters, model: e.target.value })}
          />
          <input
            className="border border-brand-200 rounded-lg px-3 py-2 w-36 focus:outline-none focus:ring-2 focus:ring-brand-400"
            type="number"
            placeholder="Preço máx."
            value={filters.max_price || ''}
            onChange={(e) => setFilters({ ...filters, max_price: e.target.value ? Number(e.target.value) : undefined })}
          />
          <input
            className="border border-brand-200 rounded-lg px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-brand-400"
            type="number"
            placeholder="Ano mín."
            value={filters.min_year || ''}
            onChange={(e) => setFilters({ ...filters, min_year: e.target.value ? Number(e.target.value) : undefined })}
          />
          <button
            className="bg-brand-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-brand-700 transition"
            onClick={handleSearch}
          >
            BusCAR
          </button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        {loading && <p className="text-stone-500">Carregando...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && vehicles.length === 0 && (
          <p className="text-stone-500">Nenhum veículo encontrado.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((vehicle, index) => (
           <Link
              key={vehicle.id}
              href={`/veiculo/${vehicle.id}`}
              style={{ animationDelay: `${index * 60}ms` }}
              className="animate-fade-up bg-white rounded-xl border border-brand-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
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

              <div className="p-4">
                <p className="font-semibold text-stone-900">
                  {vehicle.brand} {vehicle.model}
                </p>
                <p className="text-sm text-stone-500">
                  {vehicle.version || '—'} · {vehicle.year}
                </p>
                <p className="text-2xl font-bold text-brand-700 mt-2">
                  {formatPrice(vehicle.price)}
                </p>
                <p className="text-sm text-stone-500 mt-1">
                  {formatMileage(vehicle.mileage)} · {vehicle.transmission || '—'}
                </p>
                <p className="text-xs text-stone-400 mt-3 pt-3 border-t border-stone-100">
                  {vehicle.dealership.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
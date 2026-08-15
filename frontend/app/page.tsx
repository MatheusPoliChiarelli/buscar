'use client';
import Header from '@/components/Header';

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
      <Header />
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
                  {formatMileage(vehicle.mileage)} · {vehicle.transmission || '—'}
                </p>
              </div>

              <div className="bg-brand-600 px-4 py-2.5 rounded-b-xl">
                <p className="text-xs font-medium text-white">{vehicle.dealership.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
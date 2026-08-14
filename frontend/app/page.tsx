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

  function handleSearch() {
    loadVehicles(filters);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Bus<span className="text-blue-600">CAR</span>
          </h1>
          <span className="text-sm text-gray-500">Ribeirão Preto e região</span>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border p-4 flex flex-wrap gap-3">
          <input
            className="border rounded px-3 py-2 flex-1 min-w-40"
            placeholder="Marca"
            value={filters.brand || ''}
            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2 flex-1 min-w-40"
            placeholder="Modelo"
            value={filters.model || ''}
            onChange={(e) => setFilters({ ...filters, model: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2 w-36"
            type="number"
            placeholder="Preço máx."
            value={filters.max_price || ''}
            onChange={(e) => setFilters({ ...filters, max_price: e.target.value ? Number(e.target.value) : undefined })}
          />
          <input
            className="border rounded px-3 py-2 w-32"
            type="number"
            placeholder="Ano mín."
            value={filters.min_year || ''}
            onChange={(e) => setFilters({ ...filters, min_year: e.target.value ? Number(e.target.value) : undefined })}
          />
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            onClick={handleSearch}
          >
            Buscar
          </button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        {loading && <p className="text-gray-500">Carregando...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && vehicles.length === 0 && (
          <p className="text-gray-500">Nenhum veículo encontrado.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              href={`/veiculo/${vehicle.id}`}
              className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition"
            >
              <div className="h-44 bg-gray-200">
                {vehicle.photos.length > 0 ? (
                  <img
                    src={photoUrl(vehicle.photos[0].url)}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Sem foto
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="font-semibold">
                  {vehicle.brand} {vehicle.model}
                </p>
                <p className="text-sm text-gray-500">
                  {vehicle.version || '—'} · {vehicle.year}
                </p>
                <p className="text-xl font-bold text-blue-600 mt-2">
                  {formatPrice(vehicle.price)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatMileage(vehicle.mileage)} · {vehicle.transmission || '—'}
                </p>
                <p className="text-xs text-gray-400 mt-2">{vehicle.dealership.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
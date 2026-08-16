'use client';
import Header from '@/components/Header';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Combobox from '@/components/Combobox';
import { listVehicles, listModelsByBrand, photoUrl, type Vehicle, type VehicleFilters, type FipeModelGroup } from '@/lib/api';
import { CAR_BRANDS } from '@/lib/brands';




const FUEL_LABELS: Record<string, string> = {
  gasolina: 'Gasolina',
  alcool: 'Álcool',
  flex: 'Flex',
  diesel: 'Diesel',
  hibrido: 'Híbrido',
  eletrico: 'Elétrico',
};



function formatTransmission(value: string | null): string {
  if (!value) return '—';
  return value.toLowerCase() === 'automatico' ? 'Automático' : 'Manual';
}

function formatFuel(value: string | null): string {
  if (!value) return '—';
  return FUEL_LABELS[value.toLowerCase()] || value;
}

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
  const [modelGroups, setModelGroups] = useState<FipeModelGroup[]>([]);
  const [mileageInput, setMileageInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  

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
    if (!filters.brand) {
      setModelGroups([]);
      return;
    }
    listModelsByBrand(filters.brand).then(setModelGroups).catch(console.error);
  }, [filters.brand]);


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

  function clearFilters() {
    setFilters({});
    setMileageInput('');
    setPriceInput('');
    loadVehicles({});
  }




const brandOptions = CAR_BRANDS;

const modelOptions = modelGroups.map((g) => g.model);

  const versionOptions = filters.model
    ? modelGroups.find((g) => g.model === filters.model)?.versions || []
    : [];
  return (
    <main className="min-h-screen bg-brand-50">
      <Header />
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-brand-200 shadow-sm p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Combobox
              placeholder="Marca"
              value={filters.brand || ''}
              options={brandOptions}
              onChange={(v) => setFilters({ ...filters, brand: v, model: undefined, version: undefined })}
            />

            <Combobox
              placeholder="Modelo"
              value={filters.model || ''}
              options={modelOptions}
              disabled={!filters.brand}
              onChange={(v) => setFilters({ ...filters, model: v, version: undefined })}
            />

            <Combobox
              placeholder="Versão"
              value={filters.version || ''}
              options={versionOptions}
              disabled={!filters.model}
              onChange={(v) => setFilters({ ...filters, version: v })}
            />

            <button
              type="button"
              role="switch"
              aria-checked={!!filters.has_history_report}
              onClick={() => setFilters({ ...filters, has_history_report: !filters.has_history_report })}
              className="flex items-center gap-2 text-sm text-stone-700 shrink-0"
            >
              <span
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  filters.has_history_report ? 'bg-brand-600' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    filters.has_history_report ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </span>
              Histórico veicular
            </button>

            <button
              type="button"
              role="switch"
              aria-checked={!!filters.is_inspected}
              onClick={() => setFilters({ ...filters, is_inspected: !filters.is_inspected })}
              className="flex items-center gap-2 text-sm text-stone-700 shrink-0"
            >
              <span
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  filters.is_inspected ? 'bg-brand-600' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    filters.is_inspected ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </span>
              Vistoriado
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              className="border border-brand-200 rounded-lg px-3 py-2 flex-1 min-w-28 focus:outline-none focus:ring-2 focus:ring-brand-400"
              type="number"
              placeholder="Ano mínimo"
              value={filters.min_year || ''}
              onChange={(e) => setFilters({ ...filters, min_year: e.target.value ? Number(e.target.value) : undefined })}
            />
            <input
              className="border border-brand-200 rounded-lg px-3 py-2 flex-1 min-w-28 focus:outline-none focus:ring-2 focus:ring-brand-400"
              type="number"
              placeholder="Ano máximo"
              value={filters.max_year || ''}
              onChange={(e) => setFilters({ ...filters, max_year: e.target.value ? Number(e.target.value) : undefined })}
            />
            <input
              className="border border-brand-200 rounded-lg px-3 py-2 flex-1 min-w-32 focus:outline-none focus:ring-2 focus:ring-brand-400"
              type="text"
              inputMode="numeric"
              placeholder="Km máximo"
              value={mileageInput}
              onChange={(e) => {
                const digits = onlyDigits(e.target.value);
                setMileageInput(formatThousands(digits));
                setFilters({ ...filters, max_mileage: digits ? Number(digits) : undefined });
              }}
            />
            <input
              className="border border-brand-200 rounded-lg px-3 py-2 flex-1 min-w-32 focus:outline-none focus:ring-2 focus:ring-brand-400"
              type="text"
              inputMode="numeric"
              placeholder="Preço máximo"
              value={priceInput}
              onChange={(e) => {
                const digits = onlyDigits(e.target.value);
                setPriceInput(formatCurrency(digits));
                setFilters({ ...filters, max_price: digits ? Number(digits) : undefined });
              }}
            />
            <button
              className="bg-brand-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-brand-700 transition shrink-0"
              onClick={handleSearch}
            >
              BusCAR
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-brand-200 overflow-hidden flex flex-col h-full"
              >
                <div className="h-44 bg-stone-100 animate-pulse" />
                <div className="p-4 flex-1 space-y-3">
                  <div className="h-4 w-2/3 bg-stone-100 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-stone-100 rounded animate-pulse" />
                  <div className="h-7 w-1/2 bg-stone-100 rounded animate-pulse" />
                  <div className="h-3 w-3/5 bg-stone-100 rounded animate-pulse" />
                </div>
                <div className="h-9 bg-brand-200 animate-pulse rounded-b-xl" />
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && vehicles.length === 0 && (
          <div className="animate-fade-up flex flex-col items-center text-center py-20">
            <svg viewBox="0 -64 640 640" className="h-20 w-auto fill-brand-200 mb-1" aria-hidden="true">
              <path d="M544 192h-16L419.22 56.02A64.025 64.025 0 0 0 369.24 32H155.33c-26.17 0-49.7 15.93-59.42 40.23L48 194.26C20.44 201.4 0 226.21 0 256v112c0 8.84 7.16 16 16 16h48c0 53.02 42.98 96 96 96s96-42.98 96-96h128c0 53.02 42.98 96 96 96s96-42.98 96-96h48c8.84 0 16-7.16 16-16v-80c0-53.02-42.98-96-96-96zM160 432c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm72-240H116.93l38.4-96H232v96zm48 0V96h89.24l76.8 96H280zm200 240c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z" />
            </svg>

            <div className="w-40 border-t-2 border-dashed border-brand-200 mb-6" />

            <h2 className="text-lg font-semibold text-stone-900">
              Rodamos a cidade inteira e não achamos esse carro
            </h2>
            <p className="text-stone-500 mt-2 max-w-md">
              Nenhum anúncio bate com todos os filtros. Tirar a versão ou ampliar a faixa de preço
              costuma revelar boas opções que ficaram de fora por pouco...
            </p>

            <button
              onClick={clearFilters}
              className="mt-6 bg-brand-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-brand-700 transition"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {!loading && vehicles.length > 0 && (
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
                      className={`shrink-0 text-[14px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md border ${
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
                  {formatMileage(vehicle.mileage)} · {formatTransmission(vehicle.transmission)} · {formatFuel(vehicle.fuel)}
                </p>
              </div>

              <div className="bg-brand-600 px-4 py-2.5 rounded-b-xl">
                <p className="text-xs font-medium text-white">{vehicle.dealership.name}</p>
              </div>
            </Link>
          ))}
          </div>
        )}
      </section>
    </main>
  );
}
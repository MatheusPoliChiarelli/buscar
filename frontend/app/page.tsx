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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  

  async function loadVehicles(activeFilters: VehicleFilters, targetPage: number = 1) {
    setLoading(true);
    setError('');
    try {
      const data = await listVehicles(activeFilters, targetPage);
      setVehicles(data.items);
      setTotalPages(data.pages);
      setTotal(data.total);
      setPage(data.page);
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
    loadVehicles(filters, 1);
  }

  function goToPage(target: number) {
    if (target < 1 || target > totalPages || target === page) return;
    loadVehicles(filters, target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      <section className="bg-brand-600 text-white border-t-2 border-white/25">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl xs:text-[1.4rem] md:text-[1.7rem] lg:text-3xl font-bold tracking-tight">
            Encontre seu próximo carro em Ribeirão Preto
          </h1>
          <p className="text-brand-100 mt-1.5 max-w-4xl text-sm xs:text-[0.75rem] md:text-[0.9rem] lg:text-base">
            Todo anúncio mostra o preço comparado à Tabela FIPE, para você saber na hora se está
            pagando um valor justo
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-brand-200 shadow-sm p-4 space-y-3">
            <div className="grid grid-cols-1 xs:grid-cols-3 lg:grid-cols-5 items-center gap-3">
            <div className="w-full">
              <Combobox
                placeholder="Marca"
                value={filters.brand || ''}
                options={brandOptions}
                onChange={(v) => setFilters({ ...filters, brand: v, model: undefined, version: undefined })}
              />
            </div>

            <div className="w-full">
              <Combobox
                placeholder="Modelo"
                value={filters.model || ''}
                options={modelOptions}
                disabled={!filters.brand}
                onChange={(v) => setFilters({ ...filters, model: v, version: undefined })}
              />
            </div>

            <div className="w-full">
              <Combobox
                placeholder="Versão"
                value={filters.version || ''}
                options={versionOptions}
                disabled={!filters.model}
                onChange={(v) => setFilters({ ...filters, version: v })}
              />
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={!!filters.has_history_report}
              onClick={() => setFilters({ ...filters, has_history_report: !filters.has_history_report })}
              className="hidden lg:flex items-center gap-2 text-sm text-stone-700 shrink-0"
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
              className="hidden lg:flex items-center gap-2 text-sm text-stone-700 shrink-0"
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

          <div className="grid grid-cols-1 xs:grid-cols-3 lg:grid-cols-5 items-center gap-3">
            <input
              className="border border-brand-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-400"
              type="number"
              placeholder="Ano mínimo"
              value={filters.min_year || ''}
              onChange={(e) => setFilters({ ...filters, min_year: e.target.value ? Number(e.target.value) : undefined })}
            />
            <input
              className="border border-brand-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-400"
              type="number"
              placeholder="Ano máximo"
              value={filters.max_year || ''}
              onChange={(e) => setFilters({ ...filters, max_year: e.target.value ? Number(e.target.value) : undefined })}
            />
            <input
              className="border border-brand-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-400"
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
              className="border border-brand-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-400"
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
              type="button"
              role="switch"
              aria-checked={!!filters.has_history_report}
              onClick={() => setFilters({ ...filters, has_history_report: !filters.has_history_report })}
              className="hidden xs:flex lg:hidden items-center gap-2 text-sm text-stone-700"
            >
              <span
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
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
              className="hidden xs:flex lg:hidden items-center gap-2 text-sm text-stone-700"
            >
              <span
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
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

            <button
              className="hidden lg:block bg-brand-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-brand-700 transition"
              onClick={handleSearch}
            >
              BusCAR
            </button>
          </div>
          <div className="lg:hidden space-y-3">
            <div className="xs:hidden flex items-center gap-6">
              <button
                type="button"
                role="switch"
                aria-checked={!!filters.has_history_report}
                onClick={() => setFilters({ ...filters, has_history_report: !filters.has_history_report })}
                className="flex items-center gap-2 text-sm text-stone-700"
              >
                <span
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                    filters.has_history_report ? 'bg-brand-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      filters.has_history_report ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </span>
                <span className="min-[400px]:hidden">Histórico</span>
                <span className="hidden min-[400px]:inline">Histórico veicular</span>
              </button>

              <button
                type="button"
                role="switch"
                aria-checked={!!filters.is_inspected}
                onClick={() => setFilters({ ...filters, is_inspected: !filters.is_inspected })}
                className="flex items-center gap-2 text-sm text-stone-700"
              >
                <span
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
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

            <button
              className="w-full bg-brand-600 text-white font-semibold py-3 rounded-lg"
              onClick={handleSearch}
            >
              BusCAR
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        {loading && (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-5">
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
              Rodamos a região inteira e não achamos esse carro
            </h2>
            <p className="text-stone-500 mt-2 max-w-md">
              Nenhum anúncio bate com todos os filtros. Tirar a versão ou ampliar a faixa de preço
              costuma revelar boas opções que ficaram de fora por pouco
            </p>

            <button
              onClick={clearFilters}
              className="mt-6 bg-brand-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-brand-700 transition"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {!loading && !error && total > 0 && (
          <p className="text-sm text-stone-500 mb-4">
            {total === 1 ? '1 carro encontrado' : `${total} carros encontrados`}
          </p>
        )}

        {!loading && vehicles.length > 0 && (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-5">
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

                <div className="bg-brand-600 px-4 py-2.5 rounded-b-xl">
                  <p className="text-xs font-medium text-white">{vehicle.dealership.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-1 xs:gap-2 mt-10">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="h-10 px-2 sm:px-4 flex items-center gap-1 xs:gap-1.5 rounded-lg border border-brand-200 bg-white text-sm font-medium text-stone-700 hover:border-brand-400 hover:text-brand-700 transition disabled:opacity-40"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span className="text-xs sm:text-sm">Anterior</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .map((n, index, array) => (
                <span key={n} className="flex items-center gap-2">
                  {index > 0 && array[index - 1] !== n - 1 && (
                    <span className="text-stone-400 px-1">...</span>
                  )}
                  <button
                    onClick={() => goToPage(n)}
                    className={`h-10 w-10 rounded-lg text-sm font-medium transition ${
                      n === page
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'border border-brand-200 bg-white text-stone-700 hover:border-brand-400 hover:text-brand-700'
                    }`}
                  >
                    {n}
                  </button>
                </span>
              ))}

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="h-10 px-2 xs:px-4 flex items-center gap-1 xs:gap-1.5 rounded-lg border border-brand-200 bg-white text-sm font-medium text-stone-700 hover:border-brand-400 hover:text-brand-700 transition disabled:opacity-40"
            >
              <span className="text-xs sm:text-sm">Próxima</span>
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </section>

            <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-stone-900 rounded-2xl px-6 py-10 sm:px-10 sm:py-12 text-center">
          <svg viewBox="0 -64 640 640" className="h-12 w-auto mx-auto fill-brand-600 mb-4" aria-hidden="true">
            <path d="M544 192h-16L419.22 56.02A64.025 64.025 0 0 0 369.24 32H155.33c-26.17 0-49.7 15.93-59.42 40.23L48 194.26C20.44 201.4 0 226.21 0 256v112c0 8.84 7.16 16 16 16h48c0 53.02 42.98 96 96 96s96-42.98 96-96h128c0 53.02 42.98 96 96 96s96-42.98 96-96h48c8.84 0 16-7.16 16-16v-80c0-53.02-42.98-96-96-96zM160 432c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm72-240H116.93l38.4-96H232v96zm48 0V96h89.24l76.8 96H280zm200 240c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z" />
          </svg>

          <h2 className="text-2xl font-bold text-white">Tem uma revenda em Ribeirão Preto?</h2>
                    <p className="text-stone-300 mt-3 max-w-xl mx-auto">
            Cadastre seus veículos e apareça para quem está procurando carro na cidade
          </p>
          <p className="text-brand-400 font-medium mt-2">Os anúncios são 100% gratuitos</p>

          <Link
            href="/entrar"
            className="inline-block mt-7 bg-brand-600 text-white font-semibold px-7 py-3 rounded-lg shadow-sm hover:bg-brand-700 hover:shadow-md transition-all"
          >
            Anuncie agora
          </Link>
        </div>
      </section>
    </main>
  );
}
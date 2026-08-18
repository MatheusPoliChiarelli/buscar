'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import DealershipAvatar from '@/components/DealershipAvatar';
import { listDealerships, type DealershipWithCount } from '@/lib/api';

export default function RevendasPage() {
  const [dealerships, setDealerships] = useState<DealershipWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [searchNeighborhood, setSearchNeighborhood] = useState('');

  useEffect(() => {
    listDealerships()
      .then(setDealerships)
      .catch(() => setError('Não foi possível carregar as revendas.'))
      .finally(() => setLoading(false));
  }, []);



  function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const hasFilter = !!(searchName || searchAddress || searchNeighborhood);

const filtered = dealerships.filter((d) => {
    if (searchName && !normalize(d.name).includes(normalize(searchName))) {
      return false;
    }
    if (searchAddress && !normalize(d.address || '').includes(normalize(searchAddress))) {
      return false;
    }
    if (
      searchNeighborhood &&
      !normalize(d.neighborhood || '').includes(normalize(searchNeighborhood))
    ) {
      return false;
    }
    return true;
  });


  return (
    <main className="min-h-screen bg-brand-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-900">Revendas parceiras</h1>
        <p className="text-stone-500 mt-1">
          Lojas de Ribeirão Preto que anunciam no BusCAR
        </p>


        <div className="bg-white rounded-xl border border-brand-200 shadow-sm p-4 mt-6 flex flex-wrap gap-3">
          <input
            className="border border-brand-200 rounded-lg px-3 py-2.5 flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Nome da revenda"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <input
            className="border border-brand-200 rounded-lg px-3 py-2.5 flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Rua"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
          />
          <input
            className="border border-brand-200 rounded-lg px-3 py-2.5 flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Bairro"
            value={searchNeighborhood}
            onChange={(e) => setSearchNeighborhood(e.target.value)}
          />
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-brand-200 p-5">
                <div className="h-14 w-14 rounded-full bg-stone-100 animate-pulse" />
                <div className="h-4 w-2/3 bg-stone-100 rounded animate-pulse mt-4" />
                <div className="h-3 w-1/2 bg-stone-100 rounded animate-pulse mt-3" />
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-600 mt-6">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-stone-500 mt-6">
            {hasFilter
              ? 'Nenhuma revenda encontrada com esses termos'
              : 'Nenhuma revenda cadastrada ainda'}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {filtered.map((dealership, index) => (
            <Link
              key={dealership.id}
              href={`/revendas/${dealership.id}`}
              style={{ animationDelay: `${index * 60}ms` }}
              className="animate-fade-up bg-white rounded-xl border border-brand-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full"
            >
              <div className="p-5 flex-1">
                <DealershipAvatar
                  name={dealership.name}
                  logoUrl={dealership.logo_url}
                  size="md"
                />

                <p className="font-semibold text-stone-900 mt-4">{dealership.name}</p>

                {dealership.address && (
                  <p className="text-sm text-stone-500 mt-1">
                    {dealership.address}
                    {dealership.address_number ? `, ${dealership.address_number}` : ''}
                  </p>
                )}

                {dealership.neighborhood && (
                  <p className="text-sm text-stone-500">{dealership.neighborhood}</p>
                )}
                {dealership.zip_code && (
                  <p className="text-xs text-stone-400 mt-1">CEP {dealership.zip_code}</p>
                )}
              </div>

              <div className="bg-brand-600 px-5 py-2.5 rounded-b-xl">
                <p className="text-xs font-medium text-white">
                  {dealership.vehicle_count === 0
                    ? 'Sem anúncios no momento'
                    : dealership.vehicle_count === 1
                    ? '1 carro anunciado'
                    : `${dealership.vehicle_count} carros anunciados`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
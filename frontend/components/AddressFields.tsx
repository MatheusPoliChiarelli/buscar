'use client';

import { useState, useRef } from 'react';
import { lookupCep, formatCep } from '@/lib/cep';

export type AddressValue = {
  zipCode: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
};

type Props = {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
};

const inputClass =
  'border border-brand-200 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-brand-400';
const labelClass = 'block text-xs font-medium uppercase tracking-wide text-stone-500 mb-1.5';

export default function AddressFields({ value, onChange }: Props) {
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const lastSearched = useRef('');

  async function handleCepChange(raw: string) {
    const masked = formatCep(raw);
    const digits = masked.replace(/\D/g, '');

    onChange({ ...value, zipCode: masked });
    setNotFound(false);

    if (digits.length !== 8 || digits === lastSearched.current) return;

    lastSearched.current = digits;
    setSearching(true);

    try {
      const result = await lookupCep(digits);
      if (!result) {
        setNotFound(true);
        return;
      }

      onChange({
        ...value,
        zipCode: masked,
        address: result.street,
        neighborhood: result.neighborhood,
        city: result.city,
      });
    } catch {
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  }

  return (
    <>
      <div className="sm:col-span-2">
        <label className={labelClass}>CEP</label>
        <input
          className={inputClass}
          inputMode="numeric"
          value={value.zipCode}
          onChange={(e) => handleCepChange(e.target.value)}
          placeholder="14025-000"
        />
        {searching && <p className="text-xs text-stone-400 mt-1.5">Buscando...</p>}
        {notFound && <p className="text-xs text-brand-700 mt-1.5">CEP não encontrado.</p>}
      </div>

      <div className="sm:col-span-3">
        <label className={labelClass}>Endereço</label>
        <input
          className={inputClass}
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          placeholder="Av. Independência"
        />
      </div>

      <div className="sm:col-span-1">
        <label className={labelClass}>Número</label>
        <input
          className={inputClass}
          inputMode="numeric"
          value={value.number}
          onChange={(e) => onChange({ ...value, number: e.target.value })}
          placeholder="1200"
        />
      </div>

      <div className="sm:col-span-3">
        <label className={labelClass}>Bairro</label>
        <input
          className={inputClass}
          value={value.neighborhood}
          onChange={(e) => onChange({ ...value, neighborhood: e.target.value })}
          placeholder="Jardim Sumaré"
        />
      </div>

      <div className="sm:col-span-3">
        <label className={labelClass}>Cidade</label>
        <input
          className={inputClass}
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
          placeholder="Ribeirão Preto"
        />
      </div>
    </>
  );
}
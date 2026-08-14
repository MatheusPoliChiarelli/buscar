'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createVehicle, uploadPhoto, type VehicleInput } from '@/lib/api';

export default function AnunciarPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    brand: '',
    model: '',
    version: '',
    year: '',
    mileage: '',
    price: '',
    transmission: '',
    fuel: '',
    color: '',
    description: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function updateField(field: string, value: string) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit() {
    setError('');

    if (!form.brand || !form.model || !form.year || !form.mileage || !form.price) {
      setError('Preencha marca, modelo, ano, quilometragem e preço.');
      return;
    }

    setSaving(true);
    try {
      const payload: VehicleInput = {
        dealership_id: 1,
        brand: form.brand,
        model: form.model,
        version: form.version || undefined,
        year: Number(form.year),
        mileage: Number(form.mileage),
        price: Number(form.price),
        transmission: form.transmission || undefined,
        fuel: form.fuel || undefined,
        color: form.color || undefined,
        description: form.description || undefined,
      };

      const vehicle = await createVehicle(payload);

      for (const file of files) {
        await uploadPhoto(vehicle.id, file);
      }

      router.push(`/veiculo/${vehicle.id}`);
    } catch (e) {
      setError('Não foi possível cadastrar o anúncio. Tente novamente.');
      console.error(e);
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold">
            Bus<span className="text-blue-600">CAR</span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-5">Anunciar veículo</h1>

        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Marca *</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={form.brand}
                onChange={(e) => updateField('brand', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Modelo *</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={form.model}
                onChange={(e) => updateField('model', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Versão</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={form.version}
                onChange={(e) => updateField('version', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ano *</label>
              <input
                type="number"
                className="border rounded px-3 py-2 w-full"
                value={form.year}
                onChange={(e) => updateField('year', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Quilometragem *</label>
              <input
                type="number"
                className="border rounded px-3 py-2 w-full"
                value={form.mileage}
                onChange={(e) => updateField('mileage', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Preço *</label>
              <input
                type="number"
                className="border rounded px-3 py-2 w-full"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Câmbio</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={form.transmission}
                onChange={(e) => updateField('transmission', e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="manual">Manual</option>
                <option value="automatico">Automático</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Combustível</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={form.fuel}
                onChange={(e) => updateField('fuel', e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="flex">Flex</option>
                <option value="gasolina">Gasolina</option>
                <option value="diesel">Diesel</option>
                <option value="eletrico">Elétrico</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cor</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={form.color}
                onChange={(e) => updateField('color', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Descrição</label>
            <textarea
              className="border rounded px-3 py-2 w-full h-28"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Fotos</label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="w-full"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
            {files.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">{files.length} foto(s) selecionada(s)</p>
            )}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Publicando...' : 'Publicar anúncio'}
          </button>
        </div>
      </div>
    </main>
  );
}
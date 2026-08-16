'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Combobox from '@/components/Combobox';
import Link from 'next/link';
import { CAR_BRANDS } from '@/lib/brands';
import {
  createVehicle,
  uploadPhoto,
  listModelsByBrand,
  fetchFipePrice,
  type VehicleInput,
  type FipeModelGroup,
  type FipePriceResult,
} from '@/lib/api';

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

export default function AnunciarPage() {
  const [form, setForm] = useState({
    brand: '',
    model: '',
    version: '',
    year: '',
    color: '',
    mileage: '',
    price: '',
    transmission: '',
    fuel: '',
    description: '',
    has_history_report: false,
    is_inspected: false,
  });

  const [mileageInput, setMileageInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [modelGroups, setModelGroups] = useState<FipeModelGroup[]>([]);
  const [fipeResult, setFipeResult] = useState<FipePriceResult | null>(null);
  const [fipeLoading, setFipeLoading] = useState(false);
  const [fipeError, setFipeError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);

  useEffect(() => {
    if (!form.brand) {
      setModelGroups([]);
      return;
    }
    listModelsByBrand(form.brand).then(setModelGroups).catch(console.error);
  }, [form.brand]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const modelOptions = modelGroups.map((g) => g.model);
  const versionOptions = form.model
    ? modelGroups.find((g) => g.model === form.model)?.versions || []
    : [];

  function moveFile(from: number, to: number) {
    if (to < 0 || to >= files.length) return;
    const updated = [...files];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setFiles(updated);
  }

  function updateField(field: string, value: string) {
    setForm({ ...form, [field]: value });
  }

  async function handleFipeQuery() {
    setFipeError('');
    setFipeResult(null);

    if (!form.brand || !form.model || !form.year) {
      setFipeError('Preencha marca, modelo e ano para consultar.');
      return;
    }

    setFipeLoading(true);
    try {
      const result = await fetchFipePrice({
        brand: form.brand,
        model: form.model,
        year: Number(form.year),
        version: form.version || undefined,
        transmission: form.transmission || undefined,
        fuel: form.fuel || undefined,
      });
      setFipeResult(result);
    } catch (e) {
      setFipeError('Não encontramos esse veículo na tabela FIPE.');
      console.error(e);
    } finally {
      setFipeLoading(false);
    }
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
        has_history_report: form.has_history_report,
        is_inspected: form.is_inspected,
      };

      const vehicle = await createVehicle(payload);

      for (const file of files) {
        await uploadPhoto(vehicle.id, file);
      }

      setCreatedId(vehicle.id);
      setSaving(false);
    } catch (e) {
      setError('Não foi possível cadastrar o anúncio. Tente novamente.');
      console.error(e);
      setSaving(false);
    }
  }

  const inputClass =
    'border border-brand-200 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-brand-400';
  const labelClass = 'block text-xs font-medium uppercase tracking-wide text-stone-500 mb-1.5';

  if (createdId) {
    return (
      <main className="min-h-screen bg-brand-50">
        <Header />

        <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-up">
          <svg viewBox="0 -64 640 640" className="h-16 w-auto mx-auto fill-brand-600 mb-2" aria-hidden="true">
            <path d="M544 192h-16L419.22 56.02A64.025 64.025 0 0 0 369.24 32H155.33c-26.17 0-49.7 15.93-59.42 40.23L48 194.26C20.44 201.4 0 226.21 0 256v112c0 8.84 7.16 16 16 16h48c0 53.02 42.98 96 96 96s96-42.98 96-96h128c0 53.02 42.98 96 96 96s96-42.98 96-96h48c8.84 0 16-7.16 16-16v-80c0-53.02-42.98-96-96-96zM160 432c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm72-240H116.93l38.4-96H232v96zm48 0V96h89.24l76.8 96H280zm200 240c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z" />
          </svg>

          <div className="w-32 mx-auto border-t-2 border-dashed border-brand-200 mb-6" />

          <h1 className="text-2xl font-bold text-stone-900">Anúncio publicado!</h1>
          <p className="text-stone-500 mt-2">
            Seu veículo já está no ar e aparecendo para quem está procurando em Ribeirão Preto e região.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link
              href={`/veiculo/${createdId}`}
              className="bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg shadow-sm hover:bg-brand-700 hover:shadow-md transition-all"
            >
              Ver o anúncio
            </Link>
            <Link
              href="/meus-anuncios"
              className="border border-brand-500 text-brand-700 font-medium px-6 py-3 rounded-lg hover:bg-brand-50 transition"
            >
              Ver meus anúncios
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-900">Anunciar veículo</h1>
        <p className="text-stone-500 mt-1">
          Quanto mais completo o anúncio, mais confiança ele passa para quem está comprando.
        </p>

        <div className="bg-white rounded-xl border border-brand-200 shadow-sm p-6 mt-6 space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-stone-900 mb-3">Fotos</h2>
            <label className="block border-2 border-dashed border-brand-200 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 transition">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => setFiles([...files, ...Array.from(e.target.files || [])])}
              />
              <svg viewBox="0 -64 640 640" className="h-10 w-auto mx-auto fill-brand-200 mb-2" aria-hidden="true">
                <path d="M544 192h-16L419.22 56.02A64.025 64.025 0 0 0 369.24 32H155.33c-26.17 0-49.7 15.93-59.42 40.23L48 194.26C20.44 201.4 0 226.21 0 256v112c0 8.84 7.16 16 16 16h48c0 53.02 42.98 96 96 96s96-42.98 96-96h128c0 53.02 42.98 96 96 96s96-42.98 96-96h48c8.84 0 16-7.16 16-16v-80c0-53.02-42.98-96-96-96zM160 432c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm72-240H116.93l38.4-96H232v96zm48 0V96h89.24l76.8 96H280zm200 240c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z" />
              </svg>
              <p className="text-sm font-medium text-stone-700">
                {files.length > 0 ? 'Adicionar mais fotos' : 'Clique para escolher as fotos'}
              </p>
              <p className="text-xs text-stone-400 mt-1">JPG, PNG ou WEBP · até 5 MB cada</p>
            </label>

            {previews.length > 0 && (
              <>
                <p className="text-xs text-stone-400 mt-3">
                  Arraste para reordenar. A primeira foto é a capa do anúncio.
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  {previews.map((src, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={() => setDragIndex(i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragIndex === null || dragIndex === i) return;
                        moveFile(dragIndex, i);
                        setDragIndex(null);
                      }}
                      onDragEnd={() => setDragIndex(null)}
                      className={`relative shrink-0 cursor-grab active:cursor-grabbing transition ${
                        dragIndex === i ? 'opacity-40' : ''
                      }`}
                    >
                      <img
                        src={src}
                        alt=""
                        className="h-24 w-32 object-cover rounded-lg border border-brand-200 pointer-events-none"
                      />

                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-brand-600 text-white text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded pointer-events-none">
                          Capa
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setFiles(files.filter((_, index) => index !== i))}
                        className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-stone-900/80 text-white text-base leading-none shadow hover:bg-red-600 transition"
                        aria-label="Remover foto"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-sm font-semibold text-stone-900 mb-4">Dados do veículo</h2>

            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Marca *</label>
                <Combobox
                  placeholder="Selecione a marca"
                  value={form.brand}
                  options={CAR_BRANDS}
                  onChange={(v) => setForm({ ...form, brand: v, model: '', version: '' })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Modelo *</label>
                <Combobox
                  placeholder="Selecione o modelo"
                  value={form.model}
                  options={modelOptions}
                  disabled={!form.brand}
                  onChange={(v) => setForm({ ...form, model: v, version: '' })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Versão</label>
                <Combobox
                  placeholder="Selecione a versão"
                  value={form.version}
                  options={versionOptions}
                  disabled={!form.model}
                  onChange={(v) => updateField('version', v)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Ano *</label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="2019"
                  value={form.year}
                  onChange={(e) => updateField('year', e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Cor</label>
                <input
                  className={inputClass}
                  placeholder="Prata"
                  value={form.color}
                  onChange={(e) => updateField('color', e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Quilometragem *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="55.000"
                  value={mileageInput}
                  onChange={(e) => {
                    const digits = onlyDigits(e.target.value);
                    setMileageInput(formatThousands(digits));
                    setForm({ ...form, mileage: digits });
                  }}
                />
              </div>

              <div className="sm:col-span-3">
                <label className={labelClass}>Câmbio</label>
                <select
                  className={inputClass}
                  value={form.transmission}
                  onChange={(e) => updateField('transmission', e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="manual">Manual</option>
                  <option value="automatico">Automático</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className={labelClass}>Combustível</label>
                <select
                  className={inputClass}
                  value={form.fuel}
                  onChange={(e) => updateField('fuel', e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="flex">Flex</option>
                  <option value="gasolina">Gasolina</option>
                  <option value="alcool">Álcool</option>
                  <option value="diesel">Diesel</option>
                  <option value="hibrido">Híbrido</option>
                  <option value="eletrico">Elétrico</option>
                </select>
              </div>
            </div>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-sm font-semibold text-stone-900 mb-1">Procedência</h2>
            <p className="text-xs text-stone-400 mb-4">
              Informado pelo anunciante. Aparece como declaração no anúncio.
            </p>

            <div className="flex flex-wrap gap-8">
              <button
                type="button"
                role="switch"
                aria-checked={form.has_history_report}
                onClick={() => setForm({ ...form, has_history_report: !form.has_history_report })}
                className="flex items-center gap-2.5 text-sm text-stone-700"
              >
                <span
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    form.has_history_report ? 'bg-brand-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      form.has_history_report ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </span>
                Possui histórico veicular
              </button>

              <button
                type="button"
                role="switch"
                aria-checked={form.is_inspected}
                onClick={() => setForm({ ...form, is_inspected: !form.is_inspected })}
                className="flex items-center gap-2.5 text-sm text-stone-700"
              >
                <span
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    form.is_inspected ? 'bg-brand-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      form.is_inspected ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </span>
                Vistoriado
              </button>
            </div>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-sm font-semibold text-stone-900 mb-4">Preço</h2>

            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-48">
                <label className={labelClass}>Preço pedido *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="R$ 95.000"
                  value={priceInput}
                  onChange={(e) => {
                    const digits = onlyDigits(e.target.value);
                    setPriceInput(formatCurrency(digits));
                    setForm({ ...form, price: digits });
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleFipeQuery}
                disabled={fipeLoading}
                className="border border-brand-500 text-brand-700 font-medium px-5 py-2.5 rounded-lg hover:bg-brand-50 transition disabled:opacity-50"
              >
                {fipeLoading ? 'Consultando...' : 'Consultar FIPE'}
              </button>
            </div>

            {fipeError && <p className="text-sm text-red-600 mt-3">{fipeError}</p>}

            {fipeResult && (
              <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50/60 p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">Tabela FIPE</p>
                <p className="text-2xl font-bold text-stone-900 mt-1">
                  {fipeResult.price.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    maximumFractionDigits: 0,
                  })}
                </p>

                {fipeResult.exact ? (
                  <p className="text-sm text-stone-600 mt-1">{fipeResult.matched_model}</p>
                ) : (
                  <p className="text-sm text-stone-600 mt-1">
                    Média das versões de {form.model} {form.year}
                  </p>
                )}

                {fipeResult.fallback && (
                  <p className="text-xs text-brand-700 mt-2">
                    Não encontramos a versão informada na FIPE. O valor acima considera todas as
                    versões do modelo.
                  </p>
                )}

                {fipeResult.reference_month && (
                  <p className="text-xs text-stone-400 mt-1">
                    Referência de {fipeResult.reference_month}
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="border-t border-stone-100 pt-6">
            <label className={labelClass}>Descrição</label>
            <textarea
              className={`${inputClass} h-32`}
              placeholder="Conte o que o comprador precisa saber: revisões, único dono, itens de série, detalhes de conservação."
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </section>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="border-t border-stone-100 pt-6">
            <button
              className="bg-brand-600 text-white font-semibold px-8 py-3 rounded-lg shadow-sm hover:bg-brand-700 hover:shadow-md transition-all disabled:opacity-50"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Publicando...' : 'Publicar anúncio'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
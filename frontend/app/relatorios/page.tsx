'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Header from '@/components/Header';
import { getReports, type ReportData } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const PERIODS = [
  { days: 7, label: '7 dias' },
  { days: 30, label: '30 dias' },
  { days: 90, label: '90 dias' },
];

function formatDay(day: string): string {
  const [, month, dayPart] = day.split('-');
  return `${dayPart}/${month}`;
}

function variation(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function MetricCard({
  label,
  value,
  previous,
  hint,
  icon,
}: {
  label: string;
  value: number;
  previous: number;
  hint?: string;
  icon: React.ReactNode;
}) {
  const change = variation(value, previous);

  return (
    <div className="bg-white rounded-xl border border-brand-200 p-5">
            <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
        <span className="shrink-0 text-brand-600">{icon}</span>
      </div>

      <p className="text-3xl font-bold text-stone-900 mt-3">{value.toLocaleString('pt-BR')}</p>

      {change !== null && (
        <p
          className={`text-sm font-medium mt-1 ${
            change > 0 ? 'text-money-700' : change < 0 ? 'text-red-600' : 'text-stone-500'
          }`}
        >
          {change > 0 ? '↑' : change < 0 ? '↓' : '·'} {Math.abs(change)}% vs período anterior
        </p>
      )}

      {hint && <p className="text-xs text-stone-400 mt-2">{hint}</p>}
    </div>
  );
}

export default function RelatoriosPage() {
  const router = useRouter();
  const { token, dealership, loading: authLoading } = useAuth();

  const [data, setData] = useState<ReportData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push('/entrar');
      return;
    }

    setLoading(true);
    getReports(token, days)
      .then(setData)
      .catch(() => setError('Não foi possível carregar os relatórios'))
      .finally(() => setLoading(false));
  }, [token, authLoading, days, router]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-brand-50">
        <Header />
        <p className="max-w-6xl mx-auto px-4 py-8 text-stone-500">Carregando...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-brand-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/meus-anuncios" className="text-brand-700 font-medium hover:underline">
            Voltar para meus anúncios
          </Link>
        </div>
      </main>
    );
  }

  const chartData = data.daily.map((d) => ({
    day: formatDay(d.day),
    Visualizações: d.views,
    Contatos: d.clicks,
  }));

  const topVehicles = data.vehicles
    .filter((v) => v.views > 0)
    .slice(0, 5)
    .map((v) => ({
      name: `${v.brand} ${v.model} ${v.year}`,
      Visualizações: v.views,
      Contatos: v.clicks,
    }));

  const conversionRate =
    data.current.vehicle_views > 0
      ? ((data.current.vehicle_clicks / data.current.vehicle_views) * 100).toFixed(1)
      : '0';
    
  const hasData =
    data.current.vehicle_views > 0 ||
    data.current.whatsapp_clicks > 0 ||
    data.current.dealership_views > 0;

  return (
    <main className="min-h-screen bg-brand-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Relatórios</h1>
            <p className="text-stone-500 mt-1">{dealership?.name}</p>
          </div>

          <div className="flex gap-1 bg-white rounded-lg border border-brand-200 p-1">
            {PERIODS.map((p) => (
              <button
                key={p.days}
                onClick={() => setDays(p.days)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                  days === p.days
                    ? 'bg-brand-600 text-white'
                    : 'text-stone-600 hover:bg-brand-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {!hasData && (
          <div className="bg-white rounded-xl border border-brand-200 p-8 mt-6 text-center">
            <svg viewBox="0 -64 640 640" className="h-16 w-auto mx-auto fill-brand-200 mb-3" aria-hidden="true">
              <path d="M544 192h-16L419.22 56.02A64.025 64.025 0 0 0 369.24 32H155.33c-26.17 0-49.7 15.93-59.42 40.23L48 194.26C20.44 201.4 0 226.21 0 256v112c0 8.84 7.16 16 16 16h48c0 53.02 42.98 96 96 96s96-42.98 96-96h128c0 53.02 42.98 96 96 96s96-42.98 96-96h48c8.84 0 16-7.16 16-16v-80c0-53.02-42.98-96-96-96zM160 432c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm72-240H116.93l38.4-96H232v96zm48 0V96h89.24l76.8 96H280zm200 240c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z" />
            </svg>
            <h2 className="text-lg font-semibold text-stone-900">
              Ainda não há movimento nos seus anúncios
            </h2>
            <p className="text-stone-500 mt-2 max-w-md mx-auto">
              Assim que as pessoas começarem a visitar seus carros, os números aparecem aqui
            </p>
          </div>
        )}

<div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <MetricCard
            label="Visualizações"
            value={data.current.vehicle_views}
            previous={data.previous.vehicle_views}
            hint="Quantas vezes seus anúncios foram vistos"
            icon={
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            }
          />

          <MetricCard
            label="Contatos"
            value={data.current.whatsapp_clicks}
            previous={data.previous.whatsapp_clicks}
            hint="Cliques no botão do WhatsApp"
            icon={
              <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden="true">
                <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23a8.2 8.2 0 0 1 8.22 8.24c0 4.54-3.7 8.23-8.23 8.23z" />
              </svg>
            }
          />

          <MetricCard
            label="Visitas à loja"
            value={data.current.dealership_views}
            previous={data.previous.dealership_views}
            hint="Acessos à página da sua revenda"
            icon={
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l1-5h16l1 5" />
                <path d="M4 9v11h16V9" />
                <path d="M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0" />
                <path d="M9 20v-6h6v6" />
              </svg>
            }
          />

          <div className="bg-white rounded-xl border border-brand-200 p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                Taxa de contato
              </p>
              <span className="h-9 w-9 shrink-0 rounded-lg bg-money-600/10 text-money-700 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 17l6-6 4 4 8-8" />
                  <path d="M14 7h7v7" />
                </svg>
              </span>
            </div>

            <p className="text-3xl font-bold text-stone-900 mt-3">{conversionRate}%</p>
            <p className="text-xs text-stone-400 mt-2">
              Contatos a cada 100 visualizações
            </p>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="bg-white rounded-xl border border-brand-200 p-6 mt-6">
            <h2 className="font-semibold text-stone-900">Evolução no período</h2>
            <p className="text-sm text-stone-500 mt-1">
              Visualizações e contatos por dia nos últimos {days} dias
            </p>

            <div className="h-72 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                  <XAxis dataKey="day" stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #fde68a',
                      fontSize: '14px',
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="Visualizações"
                    stroke="#d97706"
                    strokeWidth={2}
                    fill="url(#viewsGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Contatos"
                    stroke="#16a34a"
                    strokeWidth={2}
                    fill="url(#clicksGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {topVehicles.length > 0 && (
          <div className="bg-white rounded-xl border border-brand-200 p-6 mt-6">
            <h2 className="font-semibold text-stone-900">Top 5 anúncios</h2>
            <p className="text-sm text-stone-500 mt-1">
              Os carros mais vistos no período
            </p>

            <div className="h-72 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topVehicles}
                  layout="vertical"
                  margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" horizontal={false} />
                  <XAxis type="number" stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#a8a29e"
                    fontSize={12}
                    width={140}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#fffbeb' }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #fde68a',
                      fontSize: '14px',
                    }}
                  />
                  <Bar dataKey="Visualizações" fill="#d97706" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Contatos" fill="#16a34a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {data.vehicles.length > 0 && (
          <div className="bg-white rounded-xl border border-brand-200 mt-6 overflow-hidden">
            <div className="p-6 pb-4">
              <h2 className="font-semibold text-stone-900">Desempenho por anúncio</h2>
              <p className="text-sm text-stone-500 mt-1">
                {data.active_vehicles} anúncio(s) ativo(s) na plataforma
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-brand-50 text-stone-500">
                  <tr>
                    <th className="text-left font-medium px-6 py-3">Veículo</th>
                    <th className="text-right font-medium px-4 py-3">Visualizações</th>
                    <th className="text-right font-medium px-4 py-3">Contatos</th>
                    <th className="text-right font-medium px-6 py-3">Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {data.vehicles.map((v) => (
                    <tr key={v.id} className="border-t border-stone-100">
                      <td className="px-6 py-3">
                        <Link
                          href={`/meus-anuncios/${v.id}`}
                          className="font-medium text-stone-900 hover:text-brand-700 transition"
                        >
                          {v.brand} {v.model} {v.year}
                        </Link>
                        {!v.active && (
                          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">
                            Removido
                          </span>
                        )}
                      </td>
                      <td className="text-right px-4 py-3 text-stone-700">{v.views}</td>
                      <td className="text-right px-4 py-3 text-stone-700">{v.clicks}</td>
                      <td className="text-right px-6 py-3 text-stone-700">
                        {v.views > 0 ? `${((v.clicks / v.views) * 100).toFixed(0)}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
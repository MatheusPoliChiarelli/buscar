import type { Metadata } from 'next';
import VehicleDetail from './VehicleDetail';
import VehicleJsonLd from '@/components/VehicleJsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buscar-omega.vercel.app';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  version: string | null;
  year: number;
  mileage: number;
  price: number;
  transmission: string | null;
  fuel: string | null;
  color: string | null;
  description: string | null;
  photos: { url: string }[];
  dealership: { name: string; city: string; address?: string | null };
};

async function getVehicle(id: string): Promise<Vehicle | null> {
  try {
    const response = await fetch(`${API_URL}/vehicles/${id}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getVehicle(id);


  if (!vehicle) {
    return { title: 'Anúncio não encontrado' };
  }

  const versionPart = vehicle.version && !vehicle.version.startsWith(vehicle.model)
    ? ` ${vehicle.version}`
    : vehicle.version
    ? ` ${vehicle.version.replace(vehicle.model, '').trim()}`
    : '';
  const name = `${vehicle.brand} ${vehicle.model}${versionPart} ${vehicle.year}`;
  const title = `${name} por ${formatPrice(vehicle.price)}`;
  const description = `${name} com ${vehicle.mileage.toLocaleString('pt-BR')} km à venda em ${vehicle.dealership.city}. Anunciado por ${vehicle.dealership.name} no BusCAR.`;
  const image = vehicle.photos[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title: `${title} — BusCAR`,
      description,
      type: 'website',
      images: image ? [{ url: image, width: 1200, height: 630, alt: name }] : undefined,
    },
  };
}

export default async function VehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await getVehicle(id);

  return (
    <>
      {vehicle && <VehicleJsonLd vehicle={vehicle} siteUrl={SITE_URL} />}
      <VehicleDetail id={id} />
    </>
  );
}
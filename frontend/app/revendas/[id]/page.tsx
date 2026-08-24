import type { Metadata } from 'next';
import DealershipDetail from './DealershipDetail';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Dealership = {
  name: string;
  city: string;
  neighborhood: string | null;
  logo_url: string | null;
};

async function getDealership(id: string): Promise<Dealership | null> {
  try {
    const response = await fetch(`${API_URL}/dealerships/${id}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const dealership = await getDealership(id);

  if (!dealership) {
    return { title: 'Revenda não encontrada' };
  }

  const description = `Veja os carros à venda na ${dealership.name}${
    dealership.neighborhood ? `, no bairro ${dealership.neighborhood}` : ''
  }, em ${dealership.city}. Anúncios com preço comparado à Tabela FIPE no BusCAR.`;

  return {
    title: dealership.name,
    description,
    openGraph: {
      title: `${dealership.name} — BusCAR`,
      description,
      type: 'website',
      images: dealership.logo_url
        ? [{ url: dealership.logo_url, alt: dealership.name }]
        : undefined,
    },
  };
}

export default async function RevendaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DealershipDetail id={id} />;
}
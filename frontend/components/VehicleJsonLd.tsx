type Props = {
  vehicle: {
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
  siteUrl: string;
};

const FUEL_MAP: Record<string, string> = {
  gasolina: 'Gasoline',
  alcool: 'Ethanol',
  flex: 'Flex',
  diesel: 'Diesel',
  hibrido: 'Hybrid',
  eletrico: 'Electric',
};

export default function VehicleJsonLd({ vehicle, siteUrl }: Props) {
  const versionPart = vehicle.version && !vehicle.version.startsWith(vehicle.model)
    ? ` ${vehicle.version}`
    : vehicle.version
    ? ` ${vehicle.version.replace(vehicle.model, '').trim()}`
    : '';
  const name = `${vehicle.brand} ${vehicle.model}${versionPart} ${vehicle.year}`;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name,
    brand: {
      '@type': 'Brand',
      name: vehicle.brand,
    },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    productionDate: String(vehicle.year),
    description: vehicle.description || name,
    image: vehicle.photos.map((p) => p.url),
    color: vehicle.color || undefined,
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileage,
      unitCode: 'KMT',
    },
    vehicleTransmission: vehicle.transmission === 'automatico' ? 'Automatic' : 'Manual',
    fuelType: vehicle.fuel ? FUEL_MAP[vehicle.fuel.toLowerCase()] : undefined,
    offers: {
      '@type': 'Offer',
      price: vehicle.price,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/UsedCondition',
      url: `${siteUrl}/veiculo/${vehicle.id}`,
      seller: {
        '@type': 'AutoDealer',
        name: vehicle.dealership.name,
        address: {
          '@type': 'PostalAddress',
          addressLocality: vehicle.dealership.city,
          addressRegion: 'SP',
          addressCountry: 'BR',
          streetAddress: vehicle.dealership.address || undefined,
        },
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Photo = {
  id: number;
  url: string;
  position: number;
};

export type Dealership = {
  id: number;
  name: string;
  phone: string | null;
  city: string;
  state?: string;
  address?: string | null;
  neighborhood?: string | null;
  zip_code?: string | null;
  opening_hours?: string | null;
  logo_url?: string | null;
  address_number?: string | null;
};


export async function getMe(token: string): Promise<Dealership> {
  const response = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("Erro ao carregar seus dados");
  }
  return response.json();
}

export async function updateMe(
  data: Partial<Dealership>,
  token: string
): Promise<Dealership> {
  const response = await fetch(`${API_URL}/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Não foi possível salvar seus dados");
  }
  return response.json();
}
export type Vehicle = {
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
  created_at: string;
  dealership: Dealership;
  photos: Photo[];
  fipe_price: number | null;
  fipe_reference: string | null;
  has_history_report: boolean;
  is_inspected: boolean;
  active?: boolean;
};

export type VehicleFilters = {
  brand?: string;
  model?: string;
  version?: string;
  min_year?: number;
  max_year?: number;
  min_price?: number;
  max_price?: number;
  max_mileage?: number;
  transmission?: string;
  city?: string;
  has_history_report?: boolean;
  is_inspected?: boolean;
};

export function photoUrl(path: string): string {
  return `${API_URL}${path}`;
}

export async function listVehicles(filters: VehicleFilters = {}): Promise<Vehicle[]> {
  const params = new URLSearchParams();

Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === false) {
      return;
    }
    params.append(key, String(value));
  });

  const query = params.toString();
  const url = query ? `${API_URL}/vehicles?${query}` : `${API_URL}/vehicles`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao buscar veículos");
  }
  return response.json();
}

export async function getVehicle(id: number): Promise<Vehicle> {
  const response = await fetch(`${API_URL}/vehicles/${id}`);
  if (!response.ok) {
    throw new Error("Veículo não encontrado");
  }
  return response.json();
}


export type VehicleInput = {
  brand: string;
  model: string;
  version?: string;
  year: number;
  mileage: number;
  price: number;
  transmission?: string;
  fuel?: string;
  color?: string;
  description?: string;
  has_history_report?: boolean;
  is_inspected?: boolean;
  
};

export async function createVehicle(data: VehicleInput, token: string): Promise<Vehicle> {
  const response = await fetch(`${API_URL}/vehicles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Erro ao cadastrar veículo");
  }
  return response.json();
}
export async function uploadPhoto(vehicleId: number, file: File, token: string): Promise<Photo> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/vehicles/${vehicleId}/photos`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Erro ao enviar foto");
  }
  return response.json();
}

export type FipeBrand = {
  code: string;
  name: string;
};

export type FipeModelGroup = {
  model: string;
  versions: string[];
};

export async function listFipeBrands(): Promise<FipeBrand[]> {
  const response = await fetch(`${API_URL}/fipe/brands`);
  if (!response.ok) {
    throw new Error("Erro ao carregar marcas");
  }
  return response.json();
}

export async function listFipeModels(brandId: string, year: number, fuel?: string): Promise<FipeModelGroup[]> {
  const params = new URLSearchParams({ year: String(year) });
  if (fuel) {
    params.append("fuel", fuel);
  }

  const response = await fetch(`${API_URL}/fipe/brands/${brandId}/models?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Erro ao carregar modelos");
  }
  return response.json();
}


export type VehicleFacet = {
  brand: string;
  models: { model: string; versions: string[] }[];
};

export async function listFacets(): Promise<VehicleFacet[]> {
  const response = await fetch(`${API_URL}/vehicles/facets`);
  if (!response.ok) {
    throw new Error("Erro ao carregar opções");
  }
  return response.json();
}

export async function listModelsByBrand(brand: string): Promise<FipeModelGroup[]> {
  const response = await fetch(`${API_URL}/fipe/models?brand=${encodeURIComponent(brand)}`);
  if (!response.ok) {
    throw new Error("Erro ao carregar modelos");
  }
  return response.json();
}

export type FipePriceResult = {
  price: number;
  exact: boolean;
  matched_model: string;
  reference_month: string | null;
  fallback: boolean;
};


export async function fetchFipePrice(input: {
  brand: string;
  model: string;
  year: number;
  version?: string;
  transmission?: string;
  fuel?: string;
}): Promise<FipePriceResult> {
  const params = new URLSearchParams({
    brand: input.brand,
    model: input.model,
    year: String(input.year),
  });
  if (input.version) params.append("version", input.version);
  if (input.transmission) params.append("transmission", input.transmission);
  if (input.fuel) params.append("fuel", input.fuel);

  const response = await fetch(`${API_URL}/fipe/price?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Não encontramos esse veículo na tabela FIPE.");
  }
  return response.json();
}


export type AuthResponse = {
  access_token: string;
  token_type: string;
  dealership: Dealership;
};

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail || "Não foi possível entrar.");
  }
  return response.json();
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city: string;
  address?: string;
  address_number?: string;
  neighborhood?: string;
  zip_code?: string;
  opening_hours?: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail || "Não foi possível criar a conta.");
  }
  return response.json();
}

export async function listMyVehicles(token: string): Promise<Vehicle[]> {
  const response = await fetch(`${API_URL}/my-vehicles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("Erro ao carregar seus anúncios");
  }
  return response.json();
}

export async function updateVehicle(
  id: number,
  data: Partial<VehicleInput>,
  token: string
): Promise<Vehicle> {
  const response = await fetch(`${API_URL}/vehicles/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Erro ao atualizar o anúncio");
  }
  return response.json();
}

export async function deleteVehicle(id: number, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/vehicles/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("Erro ao remover o anúncio");
  }
}

export async function deletePhoto(vehicleId: number, photoId: number, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/vehicles/${vehicleId}/photos/${photoId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("Erro ao remover a foto");
  }
}

export async function getDealership(id: number): Promise<Dealership> {
  const response = await fetch(`${API_URL}/dealerships/${id}`);
  if (!response.ok) {
    throw new Error("Revenda não encontrada");
  }
  return response.json();
}

export async function listDealershipVehicles(id: number): Promise<Vehicle[]> {
  const response = await fetch(`${API_URL}/dealerships/${id}/vehicles`);
  if (!response.ok) {
    throw new Error("Erro ao carregar os anúncios");
  }
  return response.json();
}

export type DealershipWithCount = Dealership & { vehicle_count: number };

export async function listDealerships(): Promise<DealershipWithCount[]> {
  const response = await fetch(`${API_URL}/dealerships`);
  if (!response.ok) {
    throw new Error("Erro ao carregar as revendas");
  }
  return response.json();
}

export async function uploadLogo(file: File, token: string): Promise<Dealership> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/me/logo`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Não foi possível enviar a logo");
  }
  return response.json();
}
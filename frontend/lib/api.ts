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
};

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
};

export type VehicleFilters = {
  brand?: string;
  model?: string;
  min_year?: number;
  max_year?: number;
  min_price?: number;
  max_price?: number;
  max_mileage?: number;
  transmission?: string;
  city?: string;
};

export function photoUrl(path: string): string {
  return `${API_URL}${path}`;
}

export async function listVehicles(filters: VehicleFilters = {}): Promise<Vehicle[]> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      params.append(key, String(value));
    }
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
  dealership_id: number;
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
};

export async function createVehicle(data: VehicleInput): Promise<Vehicle> {
  const response = await fetch(`${API_URL}/vehicles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Erro ao cadastrar veículo");
  }
  return response.json();
}

export async function uploadPhoto(vehicleId: number, file: File): Promise<Photo> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/vehicles/${vehicleId}/photos`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Erro ao enviar foto");
  }
  return response.json();
}
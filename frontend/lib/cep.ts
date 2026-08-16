export type CepResult = {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export async function lookupCep(cep: string): Promise<CepResult | null> {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return null;

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!response.ok) return null;

  const data = await response.json();
  if (data.erro) return null;

  return {
    street: data.logradouro || '',
    neighborhood: data.bairro || '',
    city: data.localidade || '',
    state: data.uf || '',
  };
}



export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
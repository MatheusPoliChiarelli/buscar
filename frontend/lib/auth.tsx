'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Dealership } from '@/lib/api';

type AuthState = {
  token: string | null;
  dealership: Dealership | null;
  signIn: (token: string, dealership: Dealership) => void;
  signOut: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [dealership, setDealership] = useState<Dealership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('buscar-token');
    const storedDealership = localStorage.getItem('buscar-dealership');

    if (storedToken && storedDealership) {
      setToken(storedToken);
      setDealership(JSON.parse(storedDealership));
    }
    setLoading(false);
  }, []);

  function signIn(newToken: string, newDealership: Dealership) {
    localStorage.setItem('buscar-token', newToken);
    localStorage.setItem('buscar-dealership', JSON.stringify(newDealership));
    setToken(newToken);
    setDealership(newDealership);
  }

  function signOut() {
    localStorage.removeItem('buscar-token');
    localStorage.removeItem('buscar-dealership');
    setToken(null);
    setDealership(null);
  }

  return (
    <AuthContext.Provider value={{ token, dealership, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa estar dentro de AuthProvider');
  }
  return context;
}
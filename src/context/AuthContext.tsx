import { createContext, useContext, useMemo, useState } from 'react';
import { postJSON } from '../api/client';

export type UserRole = 'ADMIN' | 'CLIENT';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  companyName?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  isAdmin: boolean;
  isClient: boolean;
  isActive: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  /**
   * Mémo des helpers de role/statut pour le rendu conditionnel
   */
  const value = useMemo<AuthContextValue>(() => {
    const login = async (email: string, password: string) => {
      const resp = await postJSON<{ token: string; user: AuthUser }>('/auth/login', { email, password });
      localStorage.setItem('token', resp.token);
      setUser(resp.user);
    };
    const logout = () => {
      localStorage.removeItem('token');
      setUser(null);
    };
    return {
      user,
      setUser,
      isAdmin: user?.role === 'ADMIN',
      isClient: user?.role === 'CLIENT',
      isActive: user?.status === 'ACTIVE',
      login,
      logout,
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook d’accès au contexte d’authentification
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

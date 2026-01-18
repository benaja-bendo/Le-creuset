import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { postJSON, getJSON, setToken, removeToken, getToken } from '../api/client';

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
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurer la session au chargement
  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken();
      if (token) {
        try {
          const u = await getJSON<AuthUser>('/auth/me');
          setUser(u);
        } catch (err) {
          console.error('Session restoration failed', err);
          removeToken();
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const login = async (email: string, password: string) => {
      const resp = await postJSON<{ token: string; user: AuthUser }>('/auth/login', { email, password });
      setToken(resp.token);
      setUser(resp.user);
    };
    const logout = () => {
      removeToken();
      setUser(null);
    };
    return {
      user,
      setUser,
      isAdmin: user?.role === 'ADMIN',
      isClient: user?.role === 'CLIENT',
      isActive: user?.status === 'ACTIVE',
      loading,
      login,
      logout,
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

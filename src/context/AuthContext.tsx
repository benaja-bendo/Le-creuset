import { createContext, useContext, useMemo, useState } from 'react';

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
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>({
    id: 'demo-user',
    email: 'client@example.com',
    role: 'CLIENT',
    status: 'ACTIVE',
    companyName: 'Demo SARL',
  });

  /**
   * Mémo des helpers de role/statut pour le rendu conditionnel
   */
  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      setUser,
      isAdmin: user?.role === 'ADMIN',
      isClient: user?.role === 'CLIENT',
      isActive: user?.status === 'ACTIVE',
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

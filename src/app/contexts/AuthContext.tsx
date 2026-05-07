import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string, phone: string) => Promise<boolean>;
  requestPasswordReset: (identifier: string) => Promise<boolean>;
  verifyPasswordReset: (identifier: string, otp: string) => Promise<boolean>;
  confirmPasswordReset: (identifier: string, otp: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem('musicstore_user');
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);

  useEffect(() => {
    if (user) {
      window.localStorage.setItem('musicstore_user', JSON.stringify(user));
    } else {
      window.localStorage.removeItem('musicstore_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        return false;
      }

      const userData = await response.json();
      setUser(userData);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (email: string, password: string, name: string, phone: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name, phone })
      });

      if (!response.ok) {
        return false;
      }

      const userData = await response.json();
      setUser(userData);
      return true;
    } catch {
      return false;
    }
  };

  const requestPasswordReset = async (identifier: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier })
      });

      return response.ok;
    } catch {
      return false;
    }
  };

  const verifyPasswordReset = async (identifier: string, otp: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/password-reset/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, otp })
      });

      return response.ok;
    } catch {
      return false;
    }
  };

  const confirmPasswordReset = async (identifier: string, otp: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, otp, newPassword })
      });

      return response.ok;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      requestPasswordReset,
      verifyPasswordReset,
      confirmPasswordReset
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

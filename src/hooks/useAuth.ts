import { useState, useEffect, createContext, useContext } from 'react';
import { auth as authApi, type UserProfile } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const userData = await authApi.me();
      setUser(userData);
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('token_type', 'bearer');
    await fetchUser();
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };
};

export { AuthContext };

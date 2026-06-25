import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setCachedAccessToken } from '../services/api';

export interface IUserContext {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Faculty' | 'HOD' | 'Admin' | 'Visitor';
  department?: string;
  profileImage?: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: IUserContext | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUserContext | null>(null);
  const [loading, setLoading] = useState(true);

  // Checks and restores dynamic session context during page refresh or boot
  const refreshSession = async () => {
    try {
      // First try to check profile via /me endpoint
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
    } catch (error) {
      // Clear values if credentials fail validation checks
      setUser(null);
      setCachedAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if we can perform silent token exchange on initial load
    const restoreSession = async () => {
      try {
        // Exchange refresh token cookie for access token
        const res = await api.post('/auth/refresh');
        const token = res.data.data.accessToken;
        setCachedAccessToken(token);
        await refreshSession();
      } catch (err) {
        // No refresh token available, session remains empty
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user: loggedUser } = response.data.data;
      
      setCachedAccessToken(accessToken);
      setUser(loggedUser);
    } catch (error) {
      setUser(null);
      setCachedAccessToken(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Proceed with local state cleanup even if network call fails
    } finally {
      setCachedAccessToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

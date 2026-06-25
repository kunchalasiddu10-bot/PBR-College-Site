import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setCachedAccessToken, getCachedAccessToken } from '../services/api';

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

const USER_STORAGE_KEY = 'cv_user';

// Helpers for persisting user object
const saveUserToStorage = (user: IUserContext) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const loadUserFromStorage = (): IUserContext | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const clearUserFromStorage = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUserContext | null>(null);
  const [loading, setLoading] = useState(true);

  // Checks and restores dynamic session context via /me endpoint
  const refreshSession = async () => {
    try {
      const response = await api.get('/auth/me');
      const freshUser = response.data.data.user;
      setUser(freshUser);
      saveUserToStorage(freshUser);
    } catch (error) {
      // Clear everything if the server rejects the session
      setUser(null);
      setCachedAccessToken(null);
      clearUserFromStorage();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      // 1. Check if we have a stored token + user (survives page refresh)
      const storedToken = getCachedAccessToken();
      const storedUser = loadUserFromStorage();

      if (storedToken && storedUser) {
        // Optimistically restore from storage immediately (no flicker)
        setCachedAccessToken(storedToken);
        setUser(storedUser);
        setLoading(false);

        // Silently validate with the server in background
        try {
          const response = await api.get('/auth/me');
          const freshUser = response.data.data.user;
          setUser(freshUser);
          saveUserToStorage(freshUser);
        } catch {
          // Token expired — try cookie-based refresh as fallback
          try {
            const res = await api.post('/auth/refresh');
            const newToken = res.data.data.accessToken;
            setCachedAccessToken(newToken);
            await refreshSession();
          } catch {
            // Both paths failed — clear session
            setCachedAccessToken(null);
            setUser(null);
            clearUserFromStorage();
          }
        }
        return;
      }

      // 2. No stored token — try cookie-based silent refresh (for first login or cookie sessions)
      try {
        const res = await api.post('/auth/refresh');
        const token = res.data.data.accessToken;
        setCachedAccessToken(token);
        await refreshSession();
      } catch {
        // No valid session — show login
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
      saveUserToStorage(loggedUser);
    } catch (error) {
      setUser(null);
      setCachedAccessToken(null);
      clearUserFromStorage();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch {
      // Proceed with local cleanup even if network call fails
    } finally {
      setCachedAccessToken(null);
      setUser(null);
      clearUserFromStorage();
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

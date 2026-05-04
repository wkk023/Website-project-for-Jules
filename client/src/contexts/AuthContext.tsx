import React, { createContext, useContext, useState, useEffect } from 'react';

interface FireStationUser {
  id: number;
  stationCode: string;
  stationName: string;
  token?: string;
}

export const AUTH_TOKEN_STORAGE_KEY = 'fireStationToken';

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

interface AuthContextType {
  user: FireStationUser | null;
  isLoading: boolean;
  login: (user: FireStationUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FireStationUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage then sessionStorage for stored user
    const storedUser = localStorage.getItem('fireStationUser') || sessionStorage.getItem('fireStationUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('fireStationUser');
        sessionStorage.removeItem('fireStationUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: FireStationUser) => {
    setUser(userData);
    try {
      localStorage.setItem('fireStationUser', JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, userData.token);
      }
    } catch (e) {
      // Fallback to sessionStorage if localStorage is blocked (e.g. in iframe)
      sessionStorage.setItem('fireStationUser', JSON.stringify(userData));
      if (userData.token) {
        sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, userData.token);
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fireStationUser');
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem('fireStationUser');
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useFireStationAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useFireStationAuth must be used within AuthProvider');
  }
  return context;
}

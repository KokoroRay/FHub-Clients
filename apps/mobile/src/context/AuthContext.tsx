import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, CampusCode } from '../types';
import { authApi } from '../services/api/authApi';
import { mockCurrentUser } from '../services/mockData';

interface AuthContextType {
  currentUser: User | null;
  currentCampus: CampusCode;
  setCurrentCampus: (campus: CampusCode) => void;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(mockCurrentUser);
  const [currentCampus, setCurrentCampus] = useState<CampusCode>('HL');
  const [token, setToken] = useState<string | null>('mock-init-token');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore stored session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('fhub_token');
        const storedUser = await AsyncStorage.getItem('fhub_user');
        const storedCampus = await AsyncStorage.getItem('fhub_campus');

        if (storedToken && storedUser) {
          setToken(storedToken);
          const parsedUser: User = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          if (parsedUser.campus) {
            setCurrentCampus(parsedUser.campus);
          }
        }
        if (storedCampus) {
          setCurrentCampus(storedCampus as CampusCode);
        }
      } catch (err) {
        console.warn('[AuthProvider] Load session error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const handleSetCampus = async (campus: CampusCode) => {
    setCurrentCampus(campus);
    try {
      await AsyncStorage.setItem('fhub_campus', campus);
    } catch (e) {
      console.warn(e);
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, pass);
      setToken(res.token);
      setCurrentUser(res.user);
      if (res.user.campus) {
        setCurrentCampus(res.user.campus);
      }

      await AsyncStorage.setItem('fhub_token', res.token);
      if (res.refreshToken) {
        await AsyncStorage.setItem('fhub_refresh_token', res.refreshToken);
      }
      await AsyncStorage.setItem('fhub_user', JSON.stringify(res.user));
      return true;
    } catch (e) {
      console.error('[AuthProvider.login] error:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      await AsyncStorage.multiRemove(['fhub_token', 'fhub_refresh_token', 'fhub_user']);
      setToken(null);
      setCurrentUser(null);
    } catch (e) {
      console.warn('[AuthProvider.logout] error:', e);
    }
  };

  const isAuthenticated = !!currentUser && !!token;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentCampus,
        setCurrentCampus: handleSetCampus,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

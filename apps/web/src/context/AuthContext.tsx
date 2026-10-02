import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, CampusCode } from '../types';

interface AuthContextType {
  currentUser: User | null;
  currentCampus: CampusCode;
  setCurrentCampus: (campus: CampusCode) => void;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  login: (user: User, token?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getInitialUser = (): User | null => {
  const token = localStorage.getItem('fhub_token') || sessionStorage.getItem('fhub_token');
  const storedUser = localStorage.getItem('fhub_user') || sessionStorage.getItem('fhub_user');
  if (token && storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(getInitialUser);
  const [currentCampus, setCurrentCampus] = useState<CampusCode>(currentUser?.campus || 'HL');

  // Synchronize across browser tabs/storage events
  useEffect(() => {
    const handleStorageChange = () => {
      const user = getInitialUser();
      setCurrentUser(user);
      if (user?.campus) {
        setCurrentCampus(user.campus);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const currentRole: UserRole = currentUser?.role || 'Guest';

  const switchRole = (role: UserRole) => {
    if (role === 'Guest') {
      logout();
      return;
    }

    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      role,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('fhub_user', JSON.stringify(updatedUser));
  };

  const login = (user: User, token?: string) => {
    if (token) {
      localStorage.setItem('fhub_token', token);
    }
    localStorage.setItem('fhub_user', JSON.stringify(user));
    setCurrentUser(user);
    if (user.campus) {
      setCurrentCampus(user.campus);
    }
  };

  const logout = () => {
    localStorage.removeItem('fhub_token');
    localStorage.removeItem('fhub_user');
    sessionStorage.removeItem('fhub_token');
    sessionStorage.removeItem('fhub_user');
    setCurrentUser(null);
  };

  const isAuthenticated = !!(currentUser && (localStorage.getItem('fhub_token') || sessionStorage.getItem('fhub_token')));

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentCampus,
        setCurrentCampus,
        currentRole,
        switchRole,
        login,
        logout,
        isAuthenticated,
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

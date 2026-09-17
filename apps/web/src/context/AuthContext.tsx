import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, CampusCode } from '../types';
import { mockCurrentUser, mockCampuses } from '../services/mockData';

interface AuthContextType {
  currentUser: User | null;
  currentCampus: CampusCode;
  setCurrentCampus: (campus: CampusCode) => void;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(mockCurrentUser);
  const [currentCampus, setCurrentCampus] = useState<CampusCode>('HL');

  const currentRole: UserRole = currentUser?.role || 'Guest';

  const switchRole = (role: UserRole) => {
    if (role === 'Guest') {
      setCurrentUser(null);
      return;
    }

    if (!currentUser) {
      setCurrentUser({
        ...mockCurrentUser,
        role,
      });
      return;
    }

    setCurrentUser({
      ...currentUser,
      role,
    });
  };

  const login = (user: User) => {
    setCurrentUser(user);
    setCurrentCampus(user.campus);
  };

  const logout = () => {
    setCurrentUser(null);
  };

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
        isAuthenticated: !!currentUser,
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

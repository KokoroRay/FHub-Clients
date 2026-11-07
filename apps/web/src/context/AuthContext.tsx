import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, CampusCode } from '../types';
import { authApi } from '../services/api/adminApi';
import { profileApi, studentReputationApi } from '../services/api/studentApi';
import { resolveUserMajorName } from '../utils/taxonomyUtils';
import { extractStudentIdFromEmail } from '../utils/fptEmailValidator';
import {
  isOperatorAccount,
  isOperatorSessionExpired,
  isTokenExpired,
  recordLoginSession,
  clearAllAuthTokens,
  triggerAutoLogout,
} from '../utils/tokenManager';

interface AuthContextType {
  currentUser: User | null;
  currentCampus: CampusCode;
  setCurrentCampus: (campus: CampusCode) => void;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  login: (user: User, token?: string, refreshToken?: string, rememberMe?: boolean) => void;
  logout: () => Promise<void>;
  updateUser: (fields: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getInitialUser = (): User | null => {
  // Check if operator session has exceeded the 1-day (24 hours) maximum lifespan
  if (isOperatorSessionExpired()) {
    clearAllAuthTokens();
    return null;
  }

  const token = localStorage.getItem('fhub_token') || sessionStorage.getItem('fhub_token');
  const storedUser = localStorage.getItem('fhub_user') || sessionStorage.getItem('fhub_user');
  if (token && storedUser) {
    // If token is expired and there is no refresh token available, auto-clean
    const refreshToken = localStorage.getItem('fhub_refresh_token') || sessionStorage.getItem('fhub_refresh_token');
    if (!refreshToken && isTokenExpired(token, 0)) {
      clearAllAuthTokens();
      return null;
    }
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
  const [currentCampus, setCurrentCampus] = useState<CampusCode>('ALL');

  // Synchronize across browser tabs/storage events
  useEffect(() => {
    const handleStorageChange = () => {
      const user = getInitialUser();
      setCurrentUser(user);
    };
    window.addEventListener('storage', handleStorageChange);

    // Listen to centralized auto-logout events
    const handleAutoLogout = () => {
      setCurrentUser(null);
    };
    window.addEventListener('fhub:auth:logout', handleAutoLogout);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('fhub:auth:logout', handleAutoLogout);
    };
  }, []);

  // Proactive Session Health & Token Expiration Monitor
  useEffect(() => {
    if (!currentUser) return;

    const checkSessionHealth = async () => {
      // 1. Strictly enforce operator 1-day (24 hours) maximum lifespan
      if (isOperatorSessionExpired()) {
        triggerAutoLogout('OPERATOR_EXPIRED_1_DAY');
        return;
      }

      // 2. Check tokens presence
      const token = localStorage.getItem('fhub_token') || sessionStorage.getItem('fhub_token');
      const refreshToken = localStorage.getItem('fhub_refresh_token') || sessionStorage.getItem('fhub_refresh_token');

      if (!token && !refreshToken) {
        triggerAutoLogout('TOKEN_EXPIRED');
        return;
      }

      // 3. For regular users: if access token expires within 2 minutes and refresh token exists, proactively refresh
      if (token && refreshToken && isTokenExpired(token, 120)) {
        try {
          const res = await authApi.refreshToken(refreshToken);
          if (res.accessToken) {
            const storage = localStorage.getItem('fhub_token') ? localStorage : sessionStorage;
            storage.setItem('fhub_token', res.accessToken);
            if (res.refreshToken) {
              storage.setItem('fhub_refresh_token', res.refreshToken);
            }
          }
        } catch (err: any) {
          console.warn('Background proactive token refresh failed:', err);
          if (err?.response?.status === 401 || isTokenExpired(token, 0)) {
            triggerAutoLogout('TOKEN_EXPIRED');
          }
        }
      }
    };

    // Periodic check every 30 seconds
    const intervalId = setInterval(checkSessionHealth, 30000);

    // Check when user returns to tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkSessionHealth();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [currentUser]);

  const currentRole: UserRole = currentUser?.role || 'Guest';

  const logout = async () => {
    const refreshToken = localStorage.getItem('fhub_refresh_token') || sessionStorage.getItem('fhub_refresh_token');
    try {
      if (refreshToken) {
        await authApi.logout(undefined, refreshToken);
      }
    } catch (err) {
      console.warn('Backend session revocation on logout failed or offline:', err);
    } finally {
      clearAllAuthTokens();
      setCurrentUser(null);
    }
  };

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
    if (localStorage.getItem('fhub_user')) {
      localStorage.setItem('fhub_user', JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem('fhub_user', JSON.stringify(updatedUser));
    }
  };

  const login = (user: User, token?: string, refreshToken?: string, rememberMe: boolean = true) => {
    // For regular users (Student), enforce persistent localStorage so login session is unlimited
    const isOp = isOperatorAccount(user, token);
    const effectiveRememberMe = !isOp || rememberMe;

    const targetStorage = effectiveRememberMe ? localStorage : sessionStorage;
    const oppositeStorage = effectiveRememberMe ? sessionStorage : localStorage;

    // Purge opposite storage to eliminate persistence conflicts (R04)
    localStorage.removeItem('fhub_chat_suggestions_dismissed');
    sessionStorage.removeItem('fhub_chat_suggestions_dismissed');
    oppositeStorage.removeItem('fhub_token');
    oppositeStorage.removeItem('fhub_refresh_token');
    oppositeStorage.removeItem('fhub_user');

    if (token) {
      targetStorage.setItem('fhub_token', token);
    }
    if (refreshToken) {
      targetStorage.setItem('fhub_refresh_token', refreshToken);
    }
    targetStorage.setItem('fhub_user', JSON.stringify(user));

    // Record login timestamp and operator security flag
    recordLoginSession(user, token, effectiveRememberMe);

    setCurrentUser(user);
    setCurrentCampus('ALL');
  };

  const updateUser = (fields: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...fields };
    if (localStorage.getItem('fhub_user')) {
      localStorage.setItem('fhub_user', JSON.stringify(updated));
    }
    if (sessionStorage.getItem('fhub_user')) {
      sessionStorage.setItem('fhub_user', JSON.stringify(updated));
    }
    setCurrentUser(updated);
  };

  // Auto-fetch fresh profile (avatarUrl, fullName, campus) from profile-service when user is authenticated
  useEffect(() => {
    if (!currentUser?.id) return;
    const cleanId = String(currentUser.id).replace(/\D/g, '');
    if (!cleanId) return;

    profileApi.getProfile(cleanId)
      .then((profile: any) => {
        if (!profile) return;
        const avatar = profile.avatarUrl || profile.avatar_url || profile.avatar || '';
        const fullName = profile.displayName || profile.fullName || profile.full_name || '';
        const campus = profile.campusCode || profile.campus || '';

        const updates: Partial<User> = {};
        if (avatar && avatar !== currentUser.avatarUrl) updates.avatarUrl = avatar;
        if (fullName && fullName !== currentUser.fullName) updates.fullName = fullName;
        if (campus && campus !== currentUser.campus) updates.campus = campus as any;
        const resolvedMajor = resolveUserMajorName(profile);
        if (resolvedMajor && resolvedMajor !== currentUser.major) updates.major = resolvedMajor;
        const studentCode = profile.studentCode || (profile as any)?.studentId || extractStudentIdFromEmail(profile.email || currentUser.email);
        if (studentCode && studentCode !== currentUser.studentId) updates.studentId = studentCode;

        if (Object.keys(updates).length > 0) {
          updateUser(updates);
        }
      })
      .catch(() => {});

    studentReputationApi.getAccount(cleanId)
      .then((acc: any) => {
        if (!acc) return;
        const karma = acc.reputation_score ?? acc.reputationScore ?? acc.ReputationScore;
        if (typeof karma === 'number' && karma !== currentUser.karma) {
          updateUser({ karma });
        }
      })
      .catch(() => {});
  }, [currentUser?.id]);

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
        updateUser,
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

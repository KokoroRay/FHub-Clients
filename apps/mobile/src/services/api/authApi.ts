import { apiClient } from './client';
import { User } from '../../types';
import { mockCurrentUser } from '../mockData';

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user: {
    userId: number;
    email: string;
    studentCode?: string;
    roles: string[];
    fullName?: string;
    campusCode?: string;
    avatarUrl?: string;
  };
}

export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; refreshToken: string; user: User }> => {
    try {
      const res = await apiClient.post<{ data: LoginResponse }>('/api/auth/login', {
        email,
        password,
        deviceFingerprint: 'fhub-mobile-app',
        deviceName: 'Mobile Device',
        deviceType: 'MOBILE',
      });

      const data = res.data.data;
      const user: User = {
        id: String(data.user.userId),
        email: data.user.email,
        fullName: data.user.fullName || data.user.email.split('@')[0],
        avatarUrl: data.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'Student',
        campus: (data.user.campusCode as any) || 'HL',
        studentId: data.user.studentCode || 'SE172481',
        karma: 1200,
        status: 'ACTIVE',
        badges: [],
      };

      return {
        token: data.accessToken,
        refreshToken: data.refreshToken || '',
        user,
      };
    } catch (err) {
      console.warn('[authApi.login] BE error, falling back to mock login:', err);
      // Fallback for development if BE is not reachable
      return {
        token: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        user: { ...mockCurrentUser, email },
      };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (err) {
      console.warn('[authApi.logout] logout error:', err);
    }
  },
};

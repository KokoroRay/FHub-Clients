import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config, resolveApiUrl } from '../../constants/config';

export const apiClient = axios.create({
  timeout: Config.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: dynamic URL resolution & auth token injection
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 1. Resolve multi-service URL if relative path
    if (config.url && config.url.startsWith('/api')) {
      config.url = resolveApiUrl(config.url);
    }

    // 2. Attach JWT Access Token from AsyncStorage
    try {
      const token = await AsyncStorage.getItem('fhub_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 3. Attach User ID headers expected by backend microservices
      const storedUser = await AsyncStorage.getItem('fhub_user');
      let userId = '1';
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.id) userId = String(u.id).replace(/\D/g, '') || '1';
        } catch {
          // ignore parse error
        }
      }

      if (config.headers) {
        if (!config.headers['X-Governance-Account-Id']) {
          config.headers['X-Governance-Account-Id'] = userId;
        }
        if (!config.headers['X-User-Id']) {
          config.headers['X-User-Id'] = userId;
        }
      }
    } catch (e) {
      console.warn('[ApiClient Request] AsyncStorage read error:', e);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: Silent refresh token on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; title?: string }>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    if (error.response?.status === 401 && originalRequest) {
      const requestUrl = originalRequest.url || '';
      const isAuthEndpoint =
        requestUrl.includes('/api/auth/login') ||
        requestUrl.includes('/api/auth/refresh');

      if (isAuthEndpoint || originalRequest._retry) {
        await AsyncStorage.multiRemove(['fhub_token', 'fhub_refresh_token', 'fhub_user']);
        return Promise.reject(error);
      }

      const refreshToken = await AsyncStorage.getItem('fhub_refresh_token');
      if (!refreshToken) {
        await AsyncStorage.multiRemove(['fhub_token', 'fhub_refresh_token', 'fhub_user']);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshUrl = resolveApiUrl('/api/auth/refresh');
        const refreshResponse = await axios.post(
          refreshUrl,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        const newRefreshToken = refreshResponse.data?.data?.refreshToken;

        if (newAccessToken) {
          await AsyncStorage.setItem('fhub_token', newAccessToken);
          if (newRefreshToken) {
            await AsyncStorage.setItem('fhub_refresh_token', newRefreshToken);
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh response missing access token');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await AsyncStorage.multiRemove(['fhub_token', 'fhub_refresh_token', 'fhub_user']);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

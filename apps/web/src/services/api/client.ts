import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base API URL: uses Vite proxy in development or relative path / custom env URL
const rawBaseUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBaseUrl === '/api' ? '' : rawBaseUrl.replace(/\/api$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor for attaching auth token and admin governance headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('fhub_token') || sessionStorage.getItem('fhub_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Default admin governance and user headers expected by FHub backend services
    const storedUser = localStorage.getItem('fhub_user');
    let userId = '1';
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.id) userId = u.id.replace(/\D/g, '') || '1';
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

const clearAuthAndRedirect = () => {
  localStorage.removeItem('fhub_token');
  localStorage.removeItem('fhub_refresh_token');
  localStorage.removeItem('fhub_user');
  sessionStorage.removeItem('fhub_token');
  sessionStorage.removeItem('fhub_refresh_token');
  sessionStorage.removeItem('fhub_user');

  const currentPath = window.location.pathname;
  const isSubdomain = window.location.hostname.startsWith('ops.') || window.location.hostname.startsWith('admin.');
  if ((isSubdomain || currentPath.startsWith('/admin') || currentPath.startsWith('/ops')) && !currentPath.includes('/login')) {
    const redirectParam = encodeURIComponent(currentPath + window.location.search);
    const loginUrl = isSubdomain ? `/login?redirect=${redirectParam}` : `/admin/login?redirect=${redirectParam}`;
    window.location.href = loginUrl;
  }
};

function extractErrorMessage(error: AxiosError<{ message?: string; title?: string; errors?: Record<string, string[]> }>): Error {
  let message = 'An unexpected error occurred';
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') {
      message = data;
    } else if (data.message) {
      message = data.message;
    } else if (data.title) {
      message = data.title;
    } else if (data.errors) {
      const firstKey = Object.keys(data.errors)[0];
      if (firstKey && data.errors[firstKey].length > 0) {
        message = data.errors[firstKey][0];
      }
    }
  } else if (error.message) {
    message = error.message;
  }
  console.warn(`[API Client Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, message);
  return new Error(message);
}

// Response interceptor with silent token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; title?: string; errors?: Record<string, string[]> }>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    // Check if error is 401 Unauthorized
    if (error.response?.status === 401 && originalRequest) {
      const requestUrl = originalRequest.url || '';
      const isAuthEndpoint =
        requestUrl.includes('/api/auth/login') ||
        requestUrl.includes('/api/auth/refresh') ||
        requestUrl.includes('/api/auth/2fa/verify') ||
        requestUrl.includes('/api/identity/auth/login') ||
        requestUrl.includes('/api/identity/auth/refresh');

      // If already retried or this was an authentication endpoint, clear & redirect
      if (isAuthEndpoint || originalRequest._retry) {
        clearAuthAndRedirect();
        return Promise.reject(extractErrorMessage(error));
      }

      const refreshToken =
        localStorage.getItem('fhub_refresh_token') || sessionStorage.getItem('fhub_refresh_token');

      if (!refreshToken) {
        clearAuthAndRedirect();
        return Promise.reject(extractErrorMessage(error));
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
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          { refreshToken },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
          }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        const newRefreshToken = refreshResponse.data?.data?.refreshToken;

        if (newAccessToken) {
          localStorage.setItem('fhub_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('fhub_refresh_token', newRefreshToken);
          }
          if (sessionStorage.getItem('fhub_token')) {
            sessionStorage.setItem('fhub_token', newAccessToken);
            if (newRefreshToken) {
              sessionStorage.setItem('fhub_refresh_token', newRefreshToken);
            }
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
        clearAuthAndRedirect();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(extractErrorMessage(error));
  }
);

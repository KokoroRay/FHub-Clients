import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base API URL: uses Vite proxy in development or relative path / custom env URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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

// Response interceptor for normalizing responses and error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; title?: string; errors?: Record<string, string[]> }>) => {
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
    return Promise.reject(new Error(message));
  }
);

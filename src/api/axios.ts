import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ErrorResponse } from '@/types/auth';

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const getToken = (): string | null => {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          return parsed?.state?.token || null;
        }
      } catch {
        return null;
      }
      return null;
    };

    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    if (error.response?.status === 401) {
      const { useAuthStore } = await import('@/store/authStore');
      
      useAuthStore.getState().logout();
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    const errorResponse = error.response?.data;
    const message = errorResponse?.mensaje || errorResponse?.codigo || 'Error de conexión con el servidor';
    
    return Promise.reject(new Error(message));
  }
);

export default api;
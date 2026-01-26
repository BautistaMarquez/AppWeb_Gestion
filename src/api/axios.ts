import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ErrorResponse } from '@/types/auth';

// 1. Extraemos la URL de nuestra variable de entorno
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Petición (Salida)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener token de forma síncrona desde localStorage (donde Zustand persist lo guarda)
    // Esto evita dependencias circulares con el store
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

// Interceptor de Respuesta (Entrada)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    // Si el Back nos da 401 (No autorizado/Token expirado)
    if (error.response?.status === 401) {
      // Importación dinámica para evitar dependencia circular
      const { useAuthStore } = await import('@/store/authStore');
      useAuthStore.getState().logout();
      
      // Redirigir al login solo si no estamos ya en la página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Extraer mensaje del ErrorResponse del backend
    const errorResponse = error.response?.data;
    const message = errorResponse?.mensaje || errorResponse?.codigo || 'Error inesperado en el servidor';
    
    return Promise.reject(new Error(message));
  }
);

export default api;


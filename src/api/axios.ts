import axios from 'axios';

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
  (config) => {
    // Obtenemos el token del localStorage (más adelante lo moveremos a Zustand)
    const token = localStorage.getItem('token');
    
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
  (error) => {
    // Si el Back nos da 401 (No autorizado/Token expirado)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirección forzada
    }
    
    // Aquí podemos mapear el ErrorResponse que definimos en Java
    const message = error.response?.data?.message || 'Error inesperado en el servidor';
    return Promise.reject(new Error(message));
  }
);

export default api;


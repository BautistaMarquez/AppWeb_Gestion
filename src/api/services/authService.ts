import api from '../axios';

export const authService = {
  login: async (credenciales: any) => {
    const response = await api.post('/auth/login', credenciales);
    // Guardamos el token si la respuesta es exitosa
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  getProfile: async () => (await api.get('/auth/me')).data,

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};
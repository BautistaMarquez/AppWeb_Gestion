import api from '../axios';
import type { LoginRequestDTO, AuthResponseDTO, ChangePasswordRequestDTO } from '@/types/auth';

export const authService = {
  /**
   * Inicia sesión con las credenciales proporcionadas
   * @param credentials - Email y contraseña del usuario
   * @returns AuthResponseDTO con token, email y rol
   */
  login: async (credentials: LoginRequestDTO): Promise<AuthResponseDTO> => {
    const response = await api.post<AuthResponseDTO>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Cambia la contraseña del usuario autenticado
   * @param data - Contraseña actual y nueva contraseña
   * @returns Promise que se resuelve cuando la operación es exitosa
   */
  changePassword: async (data: ChangePasswordRequestDTO): Promise<void> => {
    await api.patch('/auth/change-password', data);
  },
};
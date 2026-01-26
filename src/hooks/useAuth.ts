import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/api/services/authService';
import type { LoginRequestDTO, ChangePasswordRequestDTO } from '@/types/auth';

/**
 * Hook personalizado para manejar operaciones de autenticación
 * Incluye integración con sonner para notificaciones
 */
export function useAuth() {
  const navigate = useNavigate();
  const { setLogin, logout: logoutStore } = useAuthStore();

  const login = async (credentials: LoginRequestDTO) => {
    try {
      const response = await authService.login(credentials);
      setLogin(response);
      
      toast.success('Inicio de sesión exitoso', {
        description: `Bienvenido, ${response.email}`,
      });
      
      navigate('/', { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al iniciar sesión. Por favor, intenta nuevamente.';
      
      toast.error('Error de autenticación', {
        description: errorMessage,
      });
      
      throw error;
    }
  };

  const changePassword = async (data: ChangePasswordRequestDTO) => {
    try {
      await authService.changePassword(data);
      
      toast.success('Contraseña actualizada', {
        description: 'Tu contraseña ha sido cambiada exitosamente.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al cambiar la contraseña. Por favor, intenta nuevamente.';
      
      toast.error('Error al cambiar contraseña', {
        description: errorMessage,
      });
      
      throw error;
    }
  };

  const logout = () => {
    logoutStore();
    toast.info('Sesión cerrada', {
      description: 'Has cerrado sesión correctamente.',
    });
    navigate('/login', { replace: true });
  };

  return {
    login,
    changePassword,
    logout,
  };
}

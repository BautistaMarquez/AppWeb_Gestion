import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { RolUsuario } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RolUsuario[];
}

/**
 * Componente que protege rutas basándose en autenticación y roles
 * 
 * @param children - Componente hijo a renderizar si el acceso está permitido
 * @param allowedRoles - Array opcional de roles permitidos. Si no se especifica, solo se requiere autenticación
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si se especificaron roles permitidos, verificar que el usuario tenga uno de ellos
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.includes(user.rol);
    
    if (!hasAllowedRole) {
      // Redirigir a página de "No Autorizado"
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}

import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHome from '@/components/DashboardHome';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { RolUsuario } from '@/types/auth';

// Página de "No Autorizado" - Componente simple
const UnauthorizedPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">403</h1>
        <h2 className="text-2xl font-semibold text-slate-700">Acceso Denegado</h2>
        <p className="text-slate-600">
          No tienes permisos para acceder a esta sección.
        </p>
        <a 
          href="/" 
          className="inline-block mt-4 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors"
        >
          Volver al Inicio
        </a>
      </div>
    </div>
  );
};

// Página de Login - Placeholder (será implementada después)
const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Iniciar Sesión</h1>
        <p className="text-slate-600">Página de login (pendiente de implementación)</p>
      </div>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <DashboardHome />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  // Ejemplo de rutas protegidas con roles específicos
  // {
  //   path: '/admin',
  //   element: (
  //     <ProtectedRoute allowedRoles={['ADMIN', 'TOTAL']}>
  //       <DashboardLayout>
  //         <AdminPanel />
  //       </DashboardLayout>
  //     </ProtectedRoute>
  //   ),
  // },
  // {
  //   path: '/supervisor',
  //   element: (
  //     <ProtectedRoute allowedRoles={['SUPERVISOR', 'SUPERVISOR_PLANTA', 'ADMIN', 'TOTAL']}>
  //       <DashboardLayout>
  //         <SupervisorPanel />
  //       </DashboardLayout>
  //     </ProtectedRoute>
  //   ),
  // },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

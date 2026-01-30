import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHome from '@/components/DashboardHome';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/Login';
import DashboardStats from '@/pages/DashboardStats';
import ModuleMenuPlaceholder from '@/pages/ModuleMenuPlaceholder';
import PersonalMenu from '@/pages/personal/PersonalMenu';
import UsuariosPage from '@/pages/personal/UsuariosPage';
import ConductoresPage from '@/pages/personal/ConductoresPage';
import EquiposPage from '@/pages/personal/EquiposPage';
import VehiculosPage from '@/pages/vehiculos/VehiculosPage';
import ProductosPage from '@/pages/productos/ProductosPage';

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
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['SUPERVISOR', 'ADMIN', 'TOTAL']}>
        <DashboardLayout>
          <DashboardStats />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/logistica',
    element: (
      <ProtectedRoute allowedRoles={['SUPERVISOR_PLANTA', 'ADMIN', 'TOTAL']}>
        <DashboardLayout>
          <ModuleMenuPlaceholder
            title="Gestión de Logística (Viajes)"
            description="Sub-menú del módulo (placeholder)."
            actions={[
              'Iniciar viaje: registro con validación de disponibilidad de Vehículo y Conductor.',
              'Control de flota en ruta: listado de viajes en estado EN_PROCESO.',
              'Finalización de viaje: cierre de auditoría con carga de stock de retorno.',
            ]}
          />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/productos',
    element: (
      <ProtectedRoute allowedRoles={['ADMINISTRATIVO', 'ADMIN', 'TOTAL']}>
        <DashboardLayout>
          <ProductosPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/personal',
    element: (
      <ProtectedRoute allowedRoles={['ADMINISTRATIVO', 'ADMIN', 'TOTAL']}>
        <DashboardLayout>
          <PersonalMenu />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/personal/usuarios',
    element: (
      <ProtectedRoute allowedRoles={['ADMINISTRATIVO', 'ADMIN', 'TOTAL']}>
        <DashboardLayout>
          <UsuariosPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/personal/conductores',
    element: (
      <ProtectedRoute allowedRoles={['ADMINISTRATIVO', 'ADMIN', 'TOTAL']}>
        <DashboardLayout>
          <ConductoresPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/personal/equipos',
    element: (
      <ProtectedRoute allowedRoles={['ADMINISTRATIVO', 'ADMIN', 'TOTAL']}>
        <DashboardLayout>
          <EquiposPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/vehiculos',
    element: (
      <ProtectedRoute allowedRoles={['ADMINISTRATIVO', 'ADMIN', 'TOTAL']}>
        <DashboardLayout>
          <VehiculosPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    // Link existente en el sidebar: lo enviamos al módulo Personal por ahora
    path: '/conductores',
    element: (
      <ProtectedRoute allowedRoles={['ADMINISTRATIVO', 'ADMIN', 'TOTAL']}>
        <DashboardLayout>
          <ModuleMenuPlaceholder
            title="Conductores"
            description="Acceso directo (placeholder) dentro de Gestión de Personal."
            actions={[
              'Registro y legajo de Conductores.',
              'Asignación a Equipos de Trabajo.',
              'Búsqueda y filtros (próximo paso).',
            ]}
          />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

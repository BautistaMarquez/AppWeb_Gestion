import api from '../axios';
import type { 
  Vehiculo, Producto, Conductor, ProductoPrecio 
} from '../../types/maestros';
import type { Usuario, UsuarioRequest } from '../../types/auth';

export const maestrosService = {
  // --- VEHÍCULOS ---
  getVehiculos: async (page = 0, size = 100) => {
    const response = await api.get<any>('/vehiculos', {
      params: { page, size }
    });
    return {
      content: response.data.content || [],
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 0,
      number: response.data.number || 0
    };
  },
  
  getVehiculosDisponibles: async () => 
    (await api.get<Vehiculo[]>('/vehiculos/disponibles')).data,
    
  createVehiculo: async (data: Partial<Vehiculo>) => 
    (await api.post<Vehiculo>('/vehiculos', data)).data,
    
  updateEstadoVehiculo: async (id: number, nuevoEstado: string) => 
    (await api.patch<Vehiculo>(`/vehiculos/${id}/estado`, { nuevoEstado })).data,

  deleteVehiculo: async (id: number) => 
    await api.delete(`/vehiculos/${id}`),

  // --- PRODUCTOS ---
  getProductos: async (page = 0, size = 100) => {
    const response = await api.get<any>('/productos', {
      params: { page, size }
    });
    return {
      content: response.data.content || [],
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 0,
      number: response.data.number || 0
    };
  },
  
  // Obtener TODOS los productos (activos e inactivos) para gestión administrativa
  getAllProductosForAdmin: async (page = 0, size = 100) => {
    const response = await api.get<any>('/productos/admin/all', {
      params: { page, size }
    });
    return {
      content: response.data.content || [],
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 0,
      number: response.data.number || 0
    };
  },
  
  createProducto: async (data: any) => 
    (await api.post<Producto>('/productos', data)).data,
    
  deleteProducto: async (id: number) => 
    await api.delete(`/productos/${id}`),
    
  reactivarProducto: async (id: number) =>
    await api.patch(`/productos/${id}/reactivar`),

  // --- PRECIOS (Sub-recurso de Productos) ---
  getPreciosPorProducto: async (productoId: number) => 
    (await api.get<ProductoPrecio[]>(`/precios/producto/${productoId}`)).data,
    
  createPrecio: async (productoId: number, data: { etiqueta: string; valor: number }) => 
    (await api.post<ProductoPrecio>(`/precios/producto/${productoId}`, data)).data,

  updatePrecio: async (precioId: number, data: { etiqueta: string; valor: number }) => 
    (await api.put<ProductoPrecio>(`/precios/${precioId}`, data)).data,

  deletePrecio: async (precioId: number) => 
    await api.delete(`/precios/${precioId}`),

  // --- CONDUCTORES ---
  getConductores: async (page = 0, size = 10) => {
    const response = await api.get<any>('/conductores', {
      params: { page, size }
    });
    // Spring Data Page response
    return {
      content: response.data.content || [],
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 0,
      number: response.data.number || 0
    };
  },
  
  getConductoresDisponibles: async () => 
    (await api.get<Conductor[]>('/conductores/disponibles')).data,

  getConductoresDisponiblesConEquipo: async () => 
    (await api.get<Conductor[]>('/conductores/disponibles/con-equipo')).data,
    
  createConductor: async (data: any) => 
    (await api.post<Conductor>('/conductores', data)).data,

  updateEstadoConductor: async (id: number, nuevoEstado: string) => 
    (await api.patch<Conductor>(`/conductores/${id}/estado`, { nuevoEstado })).data,

  updateLicenciaConductor: async (id: number, nuevaFechaVencimiento: string) =>
    (await api.patch<Conductor>(`/conductores/${id}/licencia`, { nuevaFechaVencimiento })).data,

  // --- EQUIPOS ---
  getEquipos: async (page = 0, size = 100) => {
    const response = await api.get<any>('/equipos', {
      params: { page, size }
    });
    // Spring Data Page response - devolvemos el array de contenido
    return response.data.content || [];
  },

  getEquipoDetalle: async (id: number) => 
    (await api.get<any>(`/equipos/${id}/detalle`)).data,

  createEquipo: async (data: { nombre: string; supervisorId: number }) => 
    (await api.post<any>('/equipos', data)).data,

  asignarSupervisor: async (equipoId: number, supervisorId: number) => 
    await api.patch(`/equipos/${equipoId}/supervisor/${supervisorId}`),

  asignarConductor: async (equipoId: number, conductorId: number) => 
    await api.patch(`/equipos/${equipoId}/conductores/${conductorId}`),

  desasignarConductor: async (equipoId: number, conductorId: number) =>
    await api.patch(`/equipos/${equipoId}/conductores/${conductorId}/desasignar`),

  // --- USUARIOS (Gestión de Personal) ---
  
  getUsuarios: async () => {
    const response = await api.get<any>('/usuarios');
    // Si el backend devuelve una Page de Spring Data, los datos están en .content
    return response.data.content || response.data;
  },

  getSupervisores: async () =>
    (await api.get<Usuario[]>('/usuarios/rol/supervisor/disponibles')).data,

  getUsuarioById: async (id: number) => (await api.get<Usuario>(`/usuarios/${id}`)).data,

  createUsuario: async (data: UsuarioRequest) => 
    (await api.post<Usuario>('/usuarios', data)).data,

  updateUsuario: async (id: number, data: Partial<UsuarioRequest>) => 
    (await api.put<Usuario>(`/usuarios/${id}`, data)).data,

  toggleEstadoUsuario: async (id: number, activo: boolean) => 
    (await api.patch<Usuario>(`/usuarios/${id}/estado`, { activo })).data,

  resetPassword: async (id: number, nuevaPassword: string) => 
    (await api.put<Usuario>(`/usuarios/${id}/reset-password`, { nuevaPassword })).data,

  desactivarUsuario: async (id: number) => 
    (await api.patch<Usuario>(`/usuarios/${id}/desactivar`)).data,
};
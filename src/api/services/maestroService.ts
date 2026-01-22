import api from '../axios';
import type { 
  Vehiculo, Producto, Conductor, Equipo, ProductoPrecio 
} from '../../types/maestros';

export const maestrosService = {
  // --- VEHÍCULOS ---
  getVehiculos: async () => (await api.get<Vehiculo[]>('/vehiculos')).data,
  
  getVehiculosDisponibles: async () => 
    (await api.get<Vehiculo[]>('/vehiculos/disponibles')).data,
    
  createVehiculo: async (data: Partial<Vehiculo>) => 
    (await api.post<Vehiculo>('/vehiculos', data)).data,
    
  updateVehiculo: async (id: number, data: Partial<Vehiculo>) => 
    (await api.put<Vehiculo>(`/vehiculos/${id}`, data)).data,

  // --- PRODUCTOS ---
  getProductos: async () => (await api.get<Producto[]>('/productos')).data,
  
  createProducto: async (data: { nombre: string }) => 
    (await api.post<Producto>('/productos', data)).data,
    
  deleteProducto: async (id: number) => 
    await api.delete(`/productos/${id}`),

  // --- PRECIOS (Sub-recurso de Productos) ---
  getPreciosPorProducto: async (productoId: number) => 
    (await api.get<ProductoPrecio[]>(`/productos-precios/producto/${productoId}`)).data,
    
  asignarPrecio: async (data: { productoId: number; etiqueta: string; valor: number }) => 
    (await api.post<ProductoPrecio>('/productos-precios', data)).data,

  // --- CONDUCTORES ---
  getConductores: async () => (await api.get<Conductor[]>('/conductores')).data,
  
  getConductoresDisponibles: async () => 
    (await api.get<Conductor[]>('/conductores/disponibles')).data,
    
  createConductor: async (data: any) => 
    (await api.post<Conductor>('/conductores', data)).data,

  // --- EQUIPOS ---
  getEquipos: async () => (await api.get<Equipo[]>('/equipos')).data,
};
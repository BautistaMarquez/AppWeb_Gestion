import api from '../axios';
import type { Viaje, CreateViajeRequest } from '../../types/logistica';

export const logisticaService = {
  // HU #1: Iniciar
  iniciarViaje: async (data: CreateViajeRequest) => 
    (await api.post<Viaje>('/viajes', data)).data,

  // HU #2: Finalizar (Snapshot de cierre)
  finalizarViaje: async (id: number, cierreData: { detalles: any[] }) => 
    (await api.patch<Viaje>(`/viajes/${id}/finalizar`, cierreData)).data,

  // Búsqueda y Filtrado (Mapeado a ViajeSpecification en el Back)
  searchViajes: async (filtros: {
    estado?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    vehiculoId?: number;
  }) => {
    const response = await api.get<Viaje[]>('/viajes/search', { params: filtros });
    return response.data;
  },

  getViajeById: async (id: number) => 
    (await api.get<Viaje>(`/viajes/${id}`)).data,

  // Dashboard y Estadísticas (Capa Gerencial)
  getDashboardStats: async () => 
    (await api.get('/dashboard/stats')).data,
};
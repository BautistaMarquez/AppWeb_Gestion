import api from '../axios';
import type { 
  ViajeResponseDTO, 
  CreateViajeRequest, 
  ViajeCierreRequest,
  ViajeSearchDTO,
  PagedResponse 
} from '../../types/logistica';

export const logisticaService = {
  // HU #1: Iniciar viaje
  iniciarViaje: async (data: CreateViajeRequest) => 
    (await api.post<ViajeResponseDTO>('/viajes', data)).data,

  // HU #2: Finalizar viaje (Snapshot de cierre)
  finalizarViaje: async (cierreData: ViajeCierreRequest) => 
    (await api.patch<ViajeResponseDTO>('/viajes/finalizar', cierreData)).data,

  // Listar viajes con paginación
  listarViajes: async (page = 0, size = 10) => {
    const response = await api.get<PagedResponse<ViajeResponseDTO>>('/viajes', {
      params: { page, size }
    });
    return response.data;
  },

  // Búsqueda y Filtrado con paginación
  buscarViajes: async (filtros: ViajeSearchDTO, page = 0, size = 10) => {
    const response = await api.get<PagedResponse<ViajeResponseDTO>>('/viajes/filter', { 
      params: { ...filtros, page, size } 
    });
    return response.data;
  },

  // Obtener viaje por ID
  getViajeById: async (id: number) => 
    (await api.get<ViajeResponseDTO>(`/viajes/${id}`)).data,

  // Dashboard y Estadísticas (Capa Gerencial)
  getDashboardStats: async () => 
    (await api.get('/dashboard/stats')).data,
};
import type { EstadoViaje } from './common';

// Detalle de respuesta del viaje (alineado con DetalleResponseDTO.java)
export interface ViajeDetalle {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidadInicial: number;
  cantidadFinal: number | null;
  precioAplicado: number;
  ventaRealizada: number;
}

// Respuesta completa del viaje (alineado con ViajeResponseDTO.java)
export interface ViajeResponseDTO {
  id: number;
  fechaInicio: string;
  fechaFin: string | null;
  estado: EstadoViaje;
  ventaTotal: number;
  vehiculoPatente: string;
  conductorNombre: string;
  supervisorNombre: string;
  detalles: ViajeDetalle[];
}

// DTO para crear un viaje (alineado con ViajeRequestDTO.java)
export interface CreateViajeRequest {
  vehiculoId: number;
  conductorId: number;
  supervisorId: number;
  detalles: {
    productoId: number;
    cantidadInicial: number;
    productoPrecioId: number;
  }[];
}

// DTO para cerrar un viaje (alineado con ViajeCierreRequestDTO.java)
export interface ViajeCierreRequest {
  viajeId: number;
  detallesFinales: {
    detalleId: number;
    cantidadFinal: number;
  }[];
}

// DTO para búsqueda de viajes (alineado con ViajeSearchDTO.java)
export interface ViajeSearchDTO {
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: EstadoViaje;
  patente?: string;
}

// Interfaz para paginación
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}
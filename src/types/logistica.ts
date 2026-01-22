import type { BaseResponse, EstadoViaje } from './common';

export interface ViajeDetalle extends BaseResponse {
  productoId: number;
  nombreProducto?: string; // Auxiliar para la UI
  cantidadInicial: number;
  cantidadFinal?: number;
  ventaRealizada?: number;
  precioAplicado: number;
}

export interface Viaje extends BaseResponse {
  fechaInicio: string;
  fechaFin?: string;
  estado: EstadoViaje;
  supervisorId: number;
  vehiculoId: number;
  conductorId: number;
  ventaTotal?: number;
  detalles: ViajeDetalle[];
  version: number;
}

// DTO para crear un viaje (Request)
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
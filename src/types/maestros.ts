import type { BaseResponse, EstadoVehiculo, EstadoConductor } from './common';

export interface Producto extends BaseResponse {
  nombre: string;
  activo: boolean;
}

export interface ProductoPrecio extends BaseResponse {
  productoId: number;
  etiqueta: string; // "Mayorista", "Minorista", etc.
  valor: number;
}

export interface Vehiculo extends BaseResponse {
  patente: string;
  modelo: string;
  estado: EstadoVehiculo;
  version: number; // Para Optimistic Locking (@Version en Java)
}

export interface Conductor extends BaseResponse {
  nombre: string;
  apellido: string;
  dni: number;
  estado: EstadoConductor;
  equipoId: number;
  licenciaVencimiento: string;
}
import type { BaseResponse, EstadoVehiculo, EstadoConductor } from './common';

export interface Producto extends BaseResponse {
  nombre: string;
  activo: boolean;
  precios?: ProductoPrecio[];
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
  dni: string;
  estado: EstadoConductor;
  licenciaVencimiento: string;
  nombreEquipo: string; // Flattening desde el backend
  equipoId?: number; // ID del equipo al que pertenece
  supervisorId?: number; // ID del supervisor del equipo
  supervisorNombre?: string; // Nombre del supervisor
}

export interface ConductorRequest {
  nombre: string;
  apellido: string;
  dni: string;
  licenciaVencimiento: string; // ISO date string
  equipoId?: number;
}

/**
 * Representa el Usuario (Supervisor) dentro de un Equipo
 * Basado en UsuarioResponseDTO.java
 */
export interface UsuarioResumen {
  mail: string;
  nombre: string;
  apellido: string;
  rol: string;
}

/**
 * Interfaz para Listados (Grillas)
 * Basado en EquipoResponseDTO.java
 */
export interface Equipo extends BaseResponse {
  nombre: string;
  supervisorNombreCompleto: string; // El back aplana esta relación para la UI
}

/**
 * Interfaz para la Vista de Detalle / Edición
 * Basado en EquipoDetalleResponseDTO.java
 */
export interface EquipoDetalle extends BaseResponse {
  nombre: string;
  supervisor: UsuarioResumen;
  conductores: Conductor[]; // Lista de conductores asignados
}

/**
 * DTO para Creación y Actualización
 * Basado en EquipoRequestDTO.java
 */
export interface EquipoRequest {
  nombre: string;
  supervisorId: number; // Solo enviamos el ID al backend
}
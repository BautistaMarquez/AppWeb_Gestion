// Reflejo de BaseEntity en Java
export interface BaseResponse {
  id: number;
  createdAt?: string; // Las fechas vienen como ISO string desde el JSON
  updatedAt?: string;
  createdBy?: string;
}

// Estados Críticos del Negocio
export const EstadoVehiculo = {
  DISPONIBLE: 'DISPONIBLE',
  EN_VIAJE: 'EN_VIAJE',
  MANTENIMIENTO: 'MANTENIMIENTO',
  ELIMINADO: 'ELIMINADO'
} as const;

export const EstadoConductor = {
  DISPONIBLE: 'DISPONIBLE',
  OCUPADO: 'OCUPADO',
  LICENCIA_VENCIDA: 'LICENCIA_VENCIDA',
  ELIMINADO: 'ELIMINADO'
} as const;

export const EstadoViaje = {
  EN_PROCESO: 'EN_PROCESO',
  FINALIZADO: 'FINALIZADO'
} as const;

export type EstadoVehiculo = typeof EstadoVehiculo[keyof typeof EstadoVehiculo];
export type EstadoConductor = typeof EstadoConductor[keyof typeof EstadoConductor];
export type EstadoViaje = typeof EstadoViaje[keyof typeof EstadoViaje];

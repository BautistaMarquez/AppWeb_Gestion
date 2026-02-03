export interface KpiStats {
  totalViajesFinalizados: number;
  viajesEnRuta: number;
  ventasTotales: number;
  efectividadCarga: number | null;
}

export interface VentaDiaria {
  fecha: string;
  totalVenta: number;
}

export interface ProductoPerformance {
  productoNombre: string;
  cantidadVendida: number;
  totalFacturado: number;
}

export interface DetalleAuditoria {
  fechaCierre: string;
  nombreConductor: string;
  vehiculoPatente: string;
  nombreEquipo: string;
  nombreProducto: string;
  cargaInicial: number;
  cargaFinal: number;
  unidadesVendidas: number;
  precioUnitarioSnapshot: number;
  subtotalVenta: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

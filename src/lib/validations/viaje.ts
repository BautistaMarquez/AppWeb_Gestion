import { z } from "zod";

// Schema para detalle de producto al iniciar viaje
export const detalleViajeSchema = z.object({
  productoId: z.number().positive("Debe seleccionar un producto válido"),
  cantidadInicial: z.number().positive("La cantidad inicial debe ser mayor a 0"),
  productoPrecioId: z.number().positive("Debe seleccionar un precio válido"),
});

// Schema para iniciar un viaje
export const iniciarViajeSchema = z.object({
  vehiculoId: z.number().positive("Debe seleccionar un vehículo válido"),
  conductorId: z.number().positive("Debe seleccionar un conductor válido"),
  supervisorId: z.number().positive("Debe seleccionar un supervisor válido"),
  
  detalles: z.array(detalleViajeSchema)
    .min(1, "Debe agregar al menos un producto al viaje")
    .refine(
      (detalles) => {
        // Verificar unicidad de la tupla (productoId, productoPrecioId)
        const combinaciones = detalles.map(d => `${d.productoId}-${d.productoPrecioId}`);
        return new Set(combinaciones).size === combinaciones.length;
      },
      { message: "No puede agregar la misma combinación de producto y precio más de una vez" }
    ),
});

// Schema para detalle de cierre
export const detalleCierreSchema = z.object({
  detalleId: z.number().positive(),
  cantidadFinal: z.number().min(0, "La cantidad final no puede ser negativa"),
});

// Schema para cierre de viaje
export const cierreViajeSchema = z.object({
  viajeId: z.number().positive(),
  
  detallesFinales: z.array(detalleCierreSchema)
    .min(1, "Debe informar el cierre de al menos un producto"),
});

// Tipos inferidos
export type IniciarViajeFormData = z.infer<typeof iniciarViajeSchema>;
export type CierreViajeFormData = z.infer<typeof cierreViajeSchema>;
export type DetalleViajeFormData = z.infer<typeof detalleViajeSchema>;
export type DetalleCierreFormData = z.infer<typeof detalleCierreSchema>;

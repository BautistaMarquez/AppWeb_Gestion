import * as z from "zod";

// Schema para un precio inicial
const precioInicialSchema = z.object({
  etiqueta: z
    .string()
    .min(2, "La etiqueta debe tener al menos 2 caracteres")
    .max(30, "La etiqueta es demasiado larga"),
  
  valor: z
    .number()
    .positive("El valor debe ser mayor a cero"),
});

// Schema para actualizar un precio existente
export const actualizarPrecioSchema = z.object({
  etiqueta: z
    .string()
    .min(2, "La etiqueta debe tener al menos 2 caracteres")
    .max(30, "La etiqueta es demasiado larga"),
  
  valor: z
    .number()
    .positive("El valor debe ser mayor a cero"),
});

// Schema para crear producto
export const productoSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  
  precios: z
    .array(precioInicialSchema)
    .min(1, "Debes agregar al menos un precio"),
});

// Schema para agregar precio a producto existente
export const agregarPrecioSchema = z.object({
  etiqueta: z
    .string()
    .min(2, "La etiqueta debe tener al menos 2 caracteres")
    .max(30, "La etiqueta es demasiado larga"),
  
  valor: z
    .number()
    .positive("El valor debe ser mayor a cero"),
});

// Tipos inferidos
export type ProductoFormValues = z.infer<typeof productoSchema>;
export type AgregarPrecioFormValues = z.infer<typeof agregarPrecioSchema>;
export type ActualizarPrecioFormValues = z.infer<typeof actualizarPrecioSchema>;
export type PrecioInicialValues = z.infer<typeof precioInicialSchema>;

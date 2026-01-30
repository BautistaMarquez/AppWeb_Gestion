import * as z from "zod";

// Esquema de validación para Vehículo
export const vehiculoSchema = z.object({
  patente: z
    .string()
    .min(6, "La patente debe tener al menos 6 caracteres")
    .max(10, "La patente es demasiado larga")
    .regex(/^[A-Z0-9]+$/, "La patente solo debe contener letras mayúsculas y números")
    .transform((val) => val.toUpperCase()),
  
  modelo: z
    .string()
    .min(2, "El modelo debe tener al menos 2 caracteres")
    .max(50, "El modelo es demasiado largo"),
});

// Tipo inferido del esquema
export type VehiculoFormValues = z.infer<typeof vehiculoSchema>;

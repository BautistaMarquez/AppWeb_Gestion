import * as z from "zod";

// Definimos el esquema de validación para Conductor
export const conductorSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre es demasiado largo"),
  
  apellido: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido es demasiado largo"),
  
  dni: z
    .string()
    .min(7, "El DNI debe tener al menos 7 caracteres")
    .max(15, "El DNI es demasiado largo")
    .regex(/^[0-9]+$/, "El DNI solo debe contener números"),
  
  licenciaVencimiento: z
    .string()
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate > today;
    }, "La fecha de vencimiento debe ser futura"),
  
  equipoId: z
    .number({ message: "Debes seleccionar un equipo" })
    .positive("Debes seleccionar un equipo válido"),
});

// Extraemos el tipo automáticamente del esquema
export type ConductorFormValues = z.infer<typeof conductorSchema>;

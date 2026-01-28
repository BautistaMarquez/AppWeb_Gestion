import * as z from "zod";

// Definimos el esquema de validación para Equipo
export const equipoSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre es demasiado largo")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "El nombre solo puede contener letras, números, espacios y guiones"),
  
  supervisorId: z
    .number({ message: "Debes seleccionar un supervisor" })
    .positive("Debes seleccionar un supervisor válido"),
});

// Extraemos el tipo automáticamente del esquema
export type EquipoFormValues = z.infer<typeof equipoSchema>;

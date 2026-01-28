import * as z from "zod";

// Definimos el esquema como una constante exportable
export const usuarioSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre es demasiado largo"),
  
  apellido: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido es demasiado largo"),
  
  mail: z
    .string()
    .email("Debes ingresar un correo electrónico válido"),
  
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  
  rol: z.enum(["ADMIN", "SUPERVISOR", "ADMINISTRATIVO", "SUPERVISOR_PLANTA", "TOTAL"]).refine(
    (value) => value !== undefined,
    { message: "Por favor, selecciona un rol de usuario" }
  ),
});

// Extraemos el tipo automáticamente del esquema para usarlo en TypeScript
export type UsuarioFormValues = z.infer<typeof usuarioSchema>;
// Tipos de Autenticación - Reflejo de los DTOs del Backend

export type RolUsuario = 
  | 'ADMIN' 
  | 'SUPERVISOR' 
  | 'ADMINISTRATIVO' 
  | 'SUPERVISOR_PLANTA' 
  | 'TOTAL';

// LoginRequestDTO
export interface LoginRequestDTO {
  email: string;
  password: string;
}

// AuthResponseDTO
export interface AuthResponseDTO {
  token: string;
  email: string;
  rol: RolUsuario;
}

// ChangePasswordRequestDTO
export interface ChangePasswordRequestDTO {
  oldPassword: string;
  newPassword: string;
}

// UsuarioResponseDTO (para cuando se necesite el perfil completo)
export interface UsuarioResponseDTO {
  mail: string;
  password: string; // Solo para referencia, no debería exponerse en producción
  nombre: string;
  apellido: string;
  rol: RolUsuario;
}

// ErrorResponse del backend
export interface ErrorResponse {
  codigo: string;
  mensaje: string;
  timestamp?: string;
  detalles?: string[];
}

// Tipo para el usuario en el store (simplificado basado en AuthResponseDTO)
export interface User {
  email: string;
  rol: RolUsuario;
}

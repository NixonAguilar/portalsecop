/** Contratos de autenticación y perfiles de usuario (tipado estricto). */

/** Roles soportados en la plataforma. */
export type UserRole = "admin" | "user";

/**
 * Perfil de usuario almacenado en la tabla `public.profiles`, vinculada 1:1
 * con `auth.users` por el `id`.
 */
export interface Profile {
  /** UUID; coincide con auth.users.id */
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/** Datos mínimos del usuario autenticado que expone la UI. */
export interface AuthUser {
  id: string;
  email: string | null;
}

/** Resultado de una operación de autenticación. */
export interface AuthResult {
  ok: boolean;
  /** Mensaje de error legible (si ok === false). */
  error?: string;
  /** true cuando el registro requiere confirmación por correo. */
  needsEmailConfirmation?: boolean;
}

/** Credenciales de email/contraseña. */
export interface Credentials {
  email: string;
  password: string;
  fullName?: string;
}

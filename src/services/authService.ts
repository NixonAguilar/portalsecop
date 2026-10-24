/**
 * Servicio de autenticación (SRP): única frontera entre la app y Supabase Auth
 * + la tabla `profiles`. La UI nunca llama a Supabase directamente, solo a este
 * servicio, lo que permite sustituir el proveedor sin tocar componentes (DIP).
 */

import type { AuthChangeEvent, Session, Subscription } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import type { AuthResult, Credentials, Profile, UserRole } from "@/types/auth";

/** Garantiza que el cliente exista; si no, error legible. */
function requireClient() {
  if (!supabase) {
    throw new Error(
      "La autenticación no está configurada. Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.",
    );
  }
  return supabase;
}

/** Traduce errores de Supabase a mensajes en español para la UI. */
function toFriendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("user already registered")) return "Ya existe una cuenta con este correo.";
  if (m.includes("password should be at least")) return "La contraseña es demasiado corta (mínimo 6 caracteres).";
  if (m.includes("email not confirmed")) return "Debes confirmar tu correo antes de iniciar sesión.";
  if (m.includes("unable to validate email")) return "El correo no es válido.";
  return message;
}

export const authService = {
  get isConfigured(): boolean {
    return supabase !== null;
  },

  /** Registro con email/contraseña. El perfil se crea por trigger en la BD. */
  async signUp({ email, password, fullName }: Credentials): Promise<AuthResult> {
    try {
      const client = requireClient();
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName ?? null } },
      });
      if (error) return { ok: false, error: toFriendlyError(error.message) };
      // Si no hay sesión activa tras el registro, requiere confirmación por correo.
      const needsEmailConfirmation = !data.session;
      return { ok: true, needsEmailConfirmation };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error desconocido" };
    }
  },

  /** Inicio de sesión con email/contraseña. */
  async signIn({ email, password }: Credentials): Promise<AuthResult> {
    try {
      const client = requireClient();
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: toFriendlyError(error.message) };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error desconocido" };
    }
  },

  /** Cierre de sesión. */
  async signOut(): Promise<void> {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  /** Sesión actual (o null). */
  async getSession(): Promise<Session | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Suscribe a cambios de autenticación. Devuelve la subscription para
   * limpiar en el unmount. No-op si Supabase no está configurado.
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): Subscription | null {
    if (!supabase) return null;
    const { data } = supabase.auth.onAuthStateChange(callback);
    return data.subscription;
  },

  /** Obtiene el perfil (rol incluido) del usuario indicado. */
  async getProfile(userId: string): Promise<Profile | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, created_at, updated_at")
      .eq("id", userId)
      .single();
    if (error) {
      // PGRST116 = no rows; el trigger pudo no haber corrido aún.
      if (error.code !== "PGRST116") {
        console.error("[authService] Error al cargar el perfil:", error.message);
      }
      return null;
    }
    return data as Profile;
  },

  /**
   * Lista todos los perfiles. Por políticas RLS, solo devuelve filas cuando el
   * usuario autenticado es admin; en caso contrario Supabase filtra el resultado.
   */
  async listProfiles(): Promise<Profile[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, created_at, updated_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[authService] Error al listar perfiles:", error.message);
      return [];
    }
    return (data ?? []) as Profile[];
  },

  /** Utilidad de dominio: ¿el perfil tiene rol admin? */
  isAdmin(profile: Profile | null): boolean {
    return profile?.role === ("admin" satisfies UserRole);
  },
};

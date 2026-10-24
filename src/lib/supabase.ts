import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { appConfig } from "@/config/env";

/**
 * Cliente único de Supabase.
 *
 * Es `null` si aún no se han configurado `VITE_SUPABASE_URL` /
 * `VITE_SUPABASE_ANON_KEY`. El resto de la app debe tolerar esa ausencia
 * (la búsqueda SECOP funciona sin autenticación); las funciones de usuario
 * quedan deshabilitadas con un mensaje claro hasta que existan credenciales.
 */
export const supabase: SupabaseClient | null = appConfig.supabase.configured
  ? createClient(appConfig.supabase.url, appConfig.supabase.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const isSupabaseConfigured = appConfig.supabase.configured;

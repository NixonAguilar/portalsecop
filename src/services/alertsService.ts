/**
 * Servicio de alertas (SRP): única frontera entre la app y la tabla
 * `public.alerts` de Supabase. La UI nunca consulta Supabase directamente.
 */

import { supabase } from "@/lib/supabase";
import type { SavedAlert } from "@/types/alerts";
import type { SearchFilters } from "@/types/secop";

export const alertsService = {
  get isConfigured(): boolean {
    return supabase !== null;
  },

  /** Lista las alertas del usuario autenticado (RLS filtra por user_id). */
  async list(): Promise<SavedAlert[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("alerts")
      .select("id, user_id, name, filters, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[alertsService] Error al listar alertas:", error.message);
      return [];
    }
    return (data ?? []) as SavedAlert[];
  },

  /** Crea una alerta para el usuario indicado. */
  async create(userId: string, name: string, filters: SearchFilters): Promise<SavedAlert> {
    if (!supabase) throw new Error("Supabase no está configurado.");
    const { data, error } = await supabase
      .from("alerts")
      .insert({ user_id: userId, name, filters })
      .select("id, user_id, name, filters, created_at")
      .single();
    if (error) throw new Error(error.message);
    return data as SavedAlert;
  },

  /** Elimina una alerta por id (RLS garantiza que sea del propio usuario). */
  async remove(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from("alerts").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};

import type { SearchFilters } from "@/types/secop";

/** Alerta / búsqueda guardada por un usuario (tabla public.alerts). */
export interface SavedAlert {
  id: string;
  user_id: string;
  name: string;
  /** Snapshot de los filtros de búsqueda. */
  filters: SearchFilters;
  created_at: string;
}

/** Datos para crear una alerta. */
export interface NewAlert {
  name: string;
  filters: SearchFilters;
}

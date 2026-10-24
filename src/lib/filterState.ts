import type { SearchFilters } from "@/types/secop";

/** Días hacia atrás que se preseleccionan por defecto en "fecha desde". */
export const DEFAULT_DATE_FROM_DAYS = 20;

/** Devuelve la fecha (ISO yyyy-mm-dd) de hace N días respecto a hoy. */
export function getDefaultDateFrom(days = DEFAULT_DATE_FROM_DAYS): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/** Estado base sin ningún filtro activo (fuente = Todos). */
export const EMPTY_FILTERS: SearchFilters = {
  source: "ALL",
  query: "",
  modalities: [],
  statuses: [],
  departments: [],
  minValue: null,
  maxValue: null,
  unspsc: "",
  dateFrom: "",
  dateTo: "",
};

/**
 * Filtros iniciales de la app: parten del estado vacío pero con la fecha
 * "desde" en los últimos 20 días para evitar consultas masivas y mejorar la
 * UX de la primera carga.
 */
export function createInitialFilters(): SearchFilters {
  return { ...EMPTY_FILTERS, dateFrom: getDefaultDateFrom() };
}

/** Cuenta cuántos filtros (sin contar la fuente ni el texto) están activos. */
export function countActiveFilters(f: SearchFilters): number {
  let n = 0;
  n += f.modalities.length;
  n += f.statuses.length;
  n += f.departments.length;
  if (f.minValue != null || f.maxValue != null) n += 1;
  if (f.unspsc) n += 1;
  if (f.dateFrom || f.dateTo) n += 1;
  return n;
}

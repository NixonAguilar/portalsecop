import type { SearchFilters } from "@/types/secop";

/** Estado inicial de filtros (sin ningún filtro activo, fuente = Todos). */
export const EMPTY_FILTERS: SearchFilters = {
  source: "ALL",
  query: "",
  modalities: [],
  statuses: [],
  department: "",
  minValue: null,
  maxValue: null,
  unspsc: "",
  dateFrom: "",
  dateTo: "",
};

/** Cuenta cuántos filtros (sin contar la fuente ni el texto) están activos. */
export function countActiveFilters(f: SearchFilters): number {
  let n = 0;
  n += f.modalities.length;
  n += f.statuses.length;
  if (f.department) n += 1;
  if (f.minValue != null || f.maxValue != null) n += 1;
  if (f.unspsc) n += 1;
  if (f.dateFrom || f.dateTo) n += 1;
  return n;
}

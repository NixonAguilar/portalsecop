import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchGlobalMetrics, searchProcesses } from "@/services/secopService";
import type { SearchFilters } from "@/types/secop";

/** Clave de caché estable a partir de los filtros + página. */
function queryKey(filters: SearchFilters, page: number, pageSize: number) {
  return ["processes", filters, page, pageSize] as const;
}

/**
 * Consulta reactiva de procesos con caché y paginación.
 * `keepPreviousData` evita parpadeos al cambiar de página.
 */
export function useProcesses(filters: SearchFilters, page: number, pageSize: number) {
  return useQuery({
    queryKey: queryKey(filters, page, pageSize),
    queryFn: () => searchProcesses(filters, page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 min
    retry: 1,
  });
}

/** Totales globales por fuente para la sección de métricas. */
export function useGlobalMetrics() {
  return useQuery({
    queryKey: ["global-metrics"],
    queryFn: fetchGlobalMetrics,
    staleTime: 1000 * 60 * 30, // 30 min
    retry: 1,
  });
}

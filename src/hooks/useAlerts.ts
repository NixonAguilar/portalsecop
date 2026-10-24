import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { alertsService } from "@/services/alertsService";
import type { SearchFilters } from "@/types/secop";

/**
 * Gestiona las alertas guardadas del usuario con caché e invalidación.
 * `userId` habilita las consultas solo cuando hay sesión.
 */
export function useAlerts(userId: string | undefined) {
  const qc = useQueryClient();
  const enabled = Boolean(userId) && alertsService.isConfigured;

  const query = useQuery({
    queryKey: ["alerts", userId],
    queryFn: () => alertsService.list(),
    enabled,
    staleTime: 1000 * 60,
  });

  const createMutation = useMutation({
    mutationFn: (vars: { name: string; filters: SearchFilters }) =>
      alertsService.create(userId as string, vars.name, vars.filters),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts", userId] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => alertsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts", userId] }),
  });

  return {
    alerts: query.data ?? [],
    isLoading: query.isLoading,
    createAlert: createMutation.mutateAsync,
    creating: createMutation.isPending,
    removeAlert: removeMutation.mutateAsync,
    removingId: removeMutation.isPending ? (removeMutation.variables as string) : null,
  };
}

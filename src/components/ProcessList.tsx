import { AlertTriangle, ChevronLeft, ChevronRight, SearchX } from "lucide-react";

import { ProcessCard } from "@/components/ProcessCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatInt } from "@/lib/format";
import type { SearchResult } from "@/types/secop";

interface ProcessListProps {
  data?: SearchResult;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error?: Error | null;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function CardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-5/6" />
      <div className="mt-auto space-y-2 pt-3">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function ProcessList({
  data,
  isLoading,
  isFetching,
  isError,
  error,
  page,
  pageSize,
  onPageChange,
}: ProcessListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 py-16 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <h3 className="text-lg font-semibold text-foreground">No se pudo consultar SECOP</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          {error?.message ?? "Ocurrió un error al conectar con Datos Abiertos."}
        </p>
      </div>
    );
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-secondary/40 py-16 text-center">
        <SearchX className="h-10 w-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">Sin resultados</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          No encontramos procesos con los filtros actuales. Prueba ampliar el rango de cuantía,
          cambiar de fuente o borrar algún filtro.
        </p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = page * pageSize + 1;
  const to = page * pageSize + items.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Mostrando <strong className="text-foreground">{formatInt(from)}</strong>–
          <strong className="text-foreground">{formatInt(to)}</strong> de{" "}
          <strong className="text-foreground">{formatInt(total)}</strong> procesos
        </span>
        {isFetching && <span className="animate-pulse text-accent">Actualizando…</span>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => (
          <ProcessCard key={p.key} process={p} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0 || isFetching}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          Página {page + 1} de {formatInt(totalPages)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page + 1 >= totalPages || isFetching}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

import { FilterDrawer, FilterPanel } from "@/components/FilterDrawer";
import { ProcessList } from "@/components/ProcessList";
import { PAGE_SIZE } from "@/config/filters";
import { useDebounce } from "@/hooks/useDebounce";
import { useProcesses } from "@/hooks/useProcesses";
import { countActiveFilters } from "@/lib/filterState";
import type { SearchFilters } from "@/types/secop";

interface SearchDashboardProps {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  onClear: () => void;
  page: number;
  onPageChange: (page: number) => void;
}

export function SearchDashboard({
  filters,
  onChange,
  onClear,
  page,
  onPageChange,
}: SearchDashboardProps) {
  // Se retardan los filtros para no saturar la API mientras el usuario escribe
  // o ajusta rangos; la página se aplica de inmediato.
  const debouncedFilters = useDebounce(filters, 450);
  const { data, isLoading, isFetching, isError, error } = useProcesses(
    debouncedFilters,
    page,
    PAGE_SIZE,
  );

  const activeCount = countActiveFilters(filters);

  const panelProps = { filters, onChange, onClear, activeCount };

  return (
    <section id="resultados" className="container scroll-mt-20 py-12">
      <div className="mb-6 flex flex-col gap-4 lg:hidden">
        <FilterDrawer {...panelProps} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar de filtros (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] rounded-xl border border-border bg-card p-4 shadow-sm">
            <FilterPanel {...panelProps} />
          </div>
        </aside>

        {/* Resultados */}
        <div>
          <ProcessList
            data={data}
            isLoading={isLoading}
            isFetching={isFetching}
            isError={isError}
            error={error as Error | null}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </section>
  );
}

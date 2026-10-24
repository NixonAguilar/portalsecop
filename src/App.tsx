import { useCallback, useState } from "react";

import { Hero } from "@/components/Hero";
import { Metrics } from "@/components/Metrics";
import { SearchDashboard } from "@/components/SearchDashboard";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { EMPTY_FILTERS } from "@/lib/filterState";
import type { SearchFilters, SourceSelection } from "@/types/secop";

export default function App() {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);

  // Cualquier cambio de filtro reinicia la paginación a la primera página.
  const patchFilters = useCallback((patch: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(0);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({
      ...EMPTY_FILTERS,
      // Conservar fuente y texto de búsqueda al limpiar facetas.
      source: prev.source,
      query: prev.query,
    }));
    setPage(0);
  }, []);

  // Aplica una alerta guardada (reemplaza todos los filtros de forma segura).
  const applyFilters = useCallback((next: SearchFilters) => {
    setFilters({ ...EMPTY_FILTERS, ...next });
    setPage(0);
    document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToResults = useCallback(() => {
    document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero
          query={filters.query}
          source={filters.source}
          onQueryChange={(query) => patchFilters({ query })}
          onSourceChange={(source: SourceSelection) => patchFilters({ source })}
          onSubmit={scrollToResults}
        />
        <Metrics />
        <SearchDashboard
          filters={filters}
          onChange={patchFilters}
          onClear={clearFilters}
          onApplyAlert={applyFilters}
          page={page}
          onPageChange={setPage}
        />
      </main>
      <Footer />
    </div>
  );
}

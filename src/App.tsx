import { useCallback, useState } from "react";

import { Hero } from "@/components/Hero";
import { Metrics } from "@/components/Metrics";
import { SearchDashboard } from "@/components/SearchDashboard";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { createInitialFilters, EMPTY_FILTERS } from "@/lib/filterState";
import type { SearchFilters, SourceSelection } from "@/types/secop";

export default function App() {
  const [filters, setFilters] = useState<SearchFilters>(() => createInitialFilters());
  const [page, setPage] = useState(0);

  // Cualquier cambio de filtro reinicia la paginación a la primera página.
  const patchFilters = useCallback((patch: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(0);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({
      // Restaura el estado base con la fecha "desde" por defecto (últimos 20 días),
      // conservando la fuente y el texto de búsqueda.
      ...createInitialFilters(),
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
        <Metrics onApplyFilters={applyFilters} />
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

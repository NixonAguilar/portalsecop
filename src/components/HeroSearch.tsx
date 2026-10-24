import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SOURCE_OPTIONS } from "@/config/filters";
import type { SourceSelection } from "@/types/secop";

interface HeroSearchProps {
  query: string;
  source: SourceSelection;
  onQueryChange: (q: string) => void;
  onSourceChange: (s: SourceSelection) => void;
  onSubmit: () => void;
}

/**
 * Barra de búsqueda universal del hero, con selector rápido de fuente.
 * El `onQueryChange` ya se despacha en vivo (debounce en el dashboard); el
 * botón/Enter hace scroll a resultados.
 */
export function HeroSearch({
  query,
  source,
  onQueryChange,
  onSourceChange,
  onSubmit,
}: HeroSearchProps) {
  const [local, setLocal] = useState(query);

  useEffect(() => {
    setLocal(query);
  }, [query]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onQueryChange(local);
        onSubmit();
      }}
      className="w-full"
      role="search"
    >
      {/* Selector de fuente */}
      <div className="mb-3 inline-flex rounded-lg border border-white/20 bg-white/10 p-1 backdrop-blur">
        {SOURCE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSourceChange(opt.value)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-semibold transition-colors",
              source === opt.value
                ? "bg-white text-primary shadow-sm"
                : "text-white/80 hover:text-white",
            )}
            aria-pressed={source === opt.value}
            title={opt.hint}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Input principal */}
      <div className="flex flex-col gap-2 rounded-xl bg-white p-2 shadow-2xl ring-1 ring-black/5 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3 px-3">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={local}
            onChange={(e) => {
              setLocal(e.target.value);
              onQueryChange(e.target.value);
            }}
            placeholder="Buscar por objeto, entidad o número de proceso…"
            aria-label="Buscar procesos de contratación"
            className="h-12 w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <Button type="submit" size="lg" variant="accent" className="shrink-0 sm:w-auto">
          <Search className="h-5 w-5" />
          Buscar
        </Button>
      </div>
    </form>
  );
}

import { FilterX, Lock, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEPARTMENTS, MODALITY_GROUPS, STATUS_GROUPS, VALUE_PRESETS } from "@/config/filters";
import { useAuth } from "@/hooks/useAuth";
import { useAuthUI } from "@/hooks/useAuthUI";
import { cn } from "@/lib/utils";
import type { FacetGroup } from "@/config/filters";
import type { SearchFilters } from "@/types/secop";

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  onClear: () => void;
  activeCount: number;
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function FacetCheckboxes({
  groups,
  selected,
  onToggle,
}: {
  groups: FacetGroup[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      {groups.map((g) => (
        <label
          key={g.id}
          className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground"
        >
          <Checkbox checked={selected.includes(g.id)} onCheckedChange={() => onToggle(g.id)} />
          <span className="leading-tight">{g.label}</span>
        </label>
      ))}
    </div>
  );
}

/** Multiselección de departamentos con búsqueda y chips de los seleccionados. */
function DepartmentMultiSelect({
  selected,
  onToggle,
  onClearAll,
}: {
  selected: string[];
  onToggle: (dep: string) => void;
  onClearAll: () => void;
}) {
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DEPARTMENTS;
    return DEPARTMENTS.filter((d) => d.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onToggle(d)}
              className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
            >
              {d}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Quitar todos
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar departamento…"
          className="h-9 pl-8 text-sm"
        />
      </div>

      <div className="max-h-48 space-y-2 overflow-y-auto pr-1 thin-scrollbar">
        {visible.length === 0 ? (
          <p className="py-2 text-center text-xs text-muted-foreground">Sin coincidencias</p>
        ) : (
          visible.map((d) => (
            <label
              key={d}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground"
            >
              <Checkbox checked={selected.includes(d)} onCheckedChange={() => onToggle(d)} />
              <span className="leading-tight">{d}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

/** Contenido del panel de filtros (compartido entre sidebar y drawer móvil). */
export function FilterPanel({ filters, onChange, onClear, activeCount }: FilterPanelProps) {
  const { user, isConfigured } = useAuth();
  const { openAuth } = useAuthUI();

  // Filtros avanzados bloqueados para usuarios anónimos (solo si hay auth).
  const locked = isConfigured && !user;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Filtros</h2>
          {activeCount > 0 && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
              {activeCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={activeCount === 0}
          className="h-8 gap-1.5 text-xs"
        >
          <FilterX className="h-3.5 w-3.5" />
          Limpiar
        </Button>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["modalidad", "estado", "cuantia", "ubicacion"]}
        className="min-h-0 flex-1 overflow-y-auto px-1 thin-scrollbar"
      >
        <AccordionItem value="modalidad">
          <AccordionTrigger>Modalidad de selección</AccordionTrigger>
          <AccordionContent>
            <FacetCheckboxes
              groups={MODALITY_GROUPS}
              selected={filters.modalities}
              onToggle={(id) => onChange({ modalities: toggle(filters.modalities, id) })}
            />
          </AccordionContent>
        </AccordionItem>

        {locked ? (
          <LockedAdvancedCTA onRegister={() => openAuth("register")} />
        ) : (
          <>
            <AccordionItem value="estado">
              <AccordionTrigger>Estado del proceso</AccordionTrigger>
              <AccordionContent>
                <FacetCheckboxes
                  groups={STATUS_GROUPS}
                  selected={filters.statuses}
                  onToggle={(id) => onChange({ statuses: toggle(filters.statuses, id) })}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cuantia">
              <AccordionTrigger>Rango de cuantía (COP)</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {VALUE_PRESETS.map((p) => {
                      const active = filters.minValue === p.min && filters.maxValue === p.max;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => onChange({ minValue: p.min, maxValue: p.max })}
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                            active
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-border text-muted-foreground hover:border-accent/40",
                          )}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="min" className="text-xs text-muted-foreground">
                        Mínimo
                      </Label>
                      <Input
                        id="min"
                        type="number"
                        min={0}
                        inputMode="numeric"
                        placeholder="0"
                        value={filters.minValue ?? ""}
                        onChange={(e) =>
                          onChange({ minValue: e.target.value ? Number(e.target.value) : null })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="max" className="text-xs text-muted-foreground">
                        Máximo
                      </Label>
                      <Input
                        id="max"
                        type="number"
                        min={0}
                        inputMode="numeric"
                        placeholder="Sin tope"
                        value={filters.maxValue ?? ""}
                        onChange={(e) =>
                          onChange({ maxValue: e.target.value ? Number(e.target.value) : null })
                        }
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ubicacion">
              <AccordionTrigger>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Ubicación territorial
                  {filters.departments.length > 0 && (
                    <span className="rounded-full bg-accent/15 px-1.5 text-[11px] font-bold text-accent">
                      {filters.departments.length}
                    </span>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <DepartmentMultiSelect
                  selected={filters.departments}
                  onToggle={(d) => onChange({ departments: toggle(filters.departments, d) })}
                  onClearAll={() => onChange({ departments: [] })}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="clasificacion">
              <AccordionTrigger>Clasificación UNSPSC</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  <Label htmlFor="unspsc" className="text-xs text-muted-foreground">
                    Código de producto/servicio o clase
                  </Label>
                  <Input
                    id="unspsc"
                    placeholder="Ej: 80111600"
                    value={filters.unspsc}
                    onChange={(e) => onChange({ unspsc: e.target.value })}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="fechas">
              <AccordionTrigger>Fecha de publicación</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="from" className="text-xs text-muted-foreground">
                      Desde
                    </Label>
                    <Input
                      id="from"
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => onChange({ dateFrom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="to" className="text-xs text-muted-foreground">
                      Hasta
                    </Label>
                    <Input
                      id="to"
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => onChange({ dateTo: e.target.value })}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </>
        )}
      </Accordion>
    </div>
  );
}

/** CTA sutil que reemplaza los filtros avanzados para usuarios anónimos. */
function LockedAdvancedCTA({ onRegister }: { onRegister: () => void }) {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-accent/40 bg-accent/5 p-4 text-center">
      <span className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-accent/10">
        <Lock className="h-4 w-4 text-accent" />
      </span>
      <p className="text-sm font-semibold text-foreground">Filtros avanzados</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Crea una cuenta gratis para filtrar por estado, cuantía, departamentos, UNSPSC y fechas, y
        guardar alertas.
      </p>
      <Button size="sm" variant="accent" className="mt-3 w-full" onClick={onRegister}>
        Crear cuenta gratis
      </Button>
    </div>
  );
}

/** Botón + Dialog que abre el panel de filtros en móvil. */
export function FilterDrawer(props: FilterPanelProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 lg:hidden">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {props.activeCount > 0 && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
              {props.activeCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent side="left" className="p-0">
        <DialogHeader className="border-b border-border">
          <DialogTitle>Filtrar procesos</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden p-4">
          <FilterPanel {...props} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

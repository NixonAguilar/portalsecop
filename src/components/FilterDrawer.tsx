import { FilterX, SlidersHorizontal } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEPARTMENTS,
  MODALITY_GROUPS,
  STATUS_GROUPS,
  VALUE_PRESETS,
} from "@/config/filters";
import { cn } from "@/lib/utils";
import type { FacetGroup } from "@/config/filters";
import type { SearchFilters } from "@/types/secop";

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  onClear: () => void;
  activeCount: number;
}

const ALL_DEPARTMENTS = "__all__";

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
      {groups.map((g) => {
        const checked = selected.includes(g.id);
        return (
          <label
            key={g.id}
            className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground"
          >
            <Checkbox checked={checked} onCheckedChange={() => onToggle(g.id)} />
            <span className="leading-tight">{g.label}</span>
          </label>
        );
      })}
    </div>
  );
}

/** Contenido del panel de filtros (compartido entre sidebar y drawer móvil). */
export function FilterPanel({ filters, onChange, onClear, activeCount }: FilterPanelProps) {
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
        defaultValue={["modalidad", "estado", "cuantia"]}
        className="flex-1 overflow-y-auto px-1 thin-scrollbar"
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
          <AccordionTrigger>Ubicación territorial</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Departamento</Label>
              <Select
                value={filters.department || ALL_DEPARTMENTS}
                onValueChange={(v) => onChange({ department: v === ALL_DEPARTMENTS ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los departamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_DEPARTMENTS}>Todos los departamentos</SelectItem>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
      </Accordion>
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

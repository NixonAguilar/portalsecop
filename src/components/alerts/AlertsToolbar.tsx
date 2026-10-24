import { Bell, BellPlus, Loader2, Search, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogModalContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlerts } from "@/hooks/useAlerts";
import { useAuth } from "@/hooks/useAuth";
import { countActiveFilters } from "@/lib/filterState";
import { formatDate } from "@/lib/format";
import type { SavedAlert } from "@/types/alerts";
import type { SearchFilters } from "@/types/secop";

interface AlertsToolbarProps {
  /** Filtros actuales, para guardar como alerta. */
  filters: SearchFilters;
  /** Aplica los filtros de una alerta seleccionada. */
  onApply: (filters: SearchFilters) => void;
}

/** Barra de acciones de alertas: guardar la búsqueda actual y ver "Mis alertas". */
export function AlertsToolbar({ filters, onApply }: AlertsToolbarProps) {
  const { user, isConfigured } = useAuth();
  const [saveOpen, setSaveOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const { alerts, isLoading, createAlert, creating, removeAlert, removingId } = useAlerts(user?.id);

  // Sin Supabase o sin sesión: invitación discreta (no se puede guardar aún).
  if (!isConfigured) return null;
  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        <Bell className="mr-1 inline h-3.5 w-3.5" />
        Inicia sesión para guardar búsquedas y crear alertas.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="accent" className="gap-1.5" onClick={() => setSaveOpen(true)}>
        <BellPlus className="h-4 w-4" />
        Guardar búsqueda
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setListOpen(true)}>
        <Bell className="h-4 w-4" />
        Mis alertas
        {alerts.length > 0 && (
          <span className="rounded-full bg-accent px-1.5 text-xs font-bold text-accent-foreground">
            {alerts.length}
          </span>
        )}
      </Button>

      <SaveAlertDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        filters={filters}
        saving={creating}
        onSave={async (name) => {
          await createAlert({ name, filters });
          setSaveOpen(false);
        }}
      />

      <MyAlertsDialog
        open={listOpen}
        onOpenChange={setListOpen}
        alerts={alerts}
        isLoading={isLoading}
        removingId={removingId}
        onApply={(f) => {
          onApply(f);
          setListOpen(false);
        }}
        onRemove={(id) => removeAlert(id)}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface SaveAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: SearchFilters;
  saving: boolean;
  onSave: (name: string) => Promise<void> | void;
}

function SaveAlertDialog({ open, onOpenChange, filters, saving, onSave }: SaveAlertDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const activeCount = countActiveFilters(filters);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Ponle un nombre a tu alerta.");
      return;
    }
    try {
      await onSave(name.trim());
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la alerta.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogModalContent>
        <DialogTitle>Guardar búsqueda como alerta</DialogTitle>
        <DialogDescription>
          Guarda los filtros actuales para volver a ellos con un clic.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="alert-name">Nombre de la alerta</Label>
            <Input
              id="alert-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Obras en Casanare > $500M"
              autoFocus
            />
          </div>

          <div className="rounded-md bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Resumen:</span> fuente{" "}
            <strong>{filters.source}</strong>
            {filters.query && <> · texto “{filters.query}”</>}
            {" · "}
            {activeCount} filtro{activeCount === 1 ? "" : "s"} activo{activeCount === 1 ? "" : "s"}.
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" variant="accent" className="w-full" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar alerta
          </Button>
        </form>
      </DialogModalContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */

interface MyAlertsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alerts: SavedAlert[];
  isLoading: boolean;
  removingId: string | null;
  onApply: (filters: SearchFilters) => void;
  onRemove: (id: string) => Promise<void> | void;
}

function MyAlertsDialog({
  open,
  onOpenChange,
  alerts,
  isLoading,
  removingId,
  onApply,
  onRemove,
}: MyAlertsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogModalContent className="max-w-lg">
        <DialogTitle>Mis alertas</DialogTitle>
        <DialogDescription>Aplica una búsqueda guardada o elimínala.</DialogDescription>

        <div className="max-h-80 space-y-2 overflow-y-auto thin-scrollbar">
          {isLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : alerts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aún no tienes alertas guardadas. Usa “Guardar búsqueda” para crear la primera.
            </p>
          ) : (
            alerts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-foreground">{a.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.filters?.source ?? "ALL"} · {formatDate(a.created_at)}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => onApply(a.filters)}>
                    <Search className="h-3.5 w-3.5" />
                    Aplicar
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-destructive hover:bg-destructive/10"
                    disabled={removingId === a.id}
                    onClick={() => void onRemove(a.id)}
                    aria-label={`Eliminar ${a.name}`}
                  >
                    {removingId === a.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogModalContent>
    </Dialog>
  );
}

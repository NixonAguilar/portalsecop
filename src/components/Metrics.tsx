import {
  ArrowRight,
  BellPlus,
  CircleDot,
  Database,
  Gavel,
  Layers,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";
import { MODALITY_GROUPS } from "@/config/filters";
import { useAuth } from "@/hooks/useAuth";
import { useAuthUI } from "@/hooks/useAuthUI";
import { useGlobalMetrics } from "@/hooks/useProcesses";
import { createInitialFilters } from "@/lib/filterState";
import { formatInt } from "@/lib/format";
import type { SearchFilters } from "@/types/secop";

interface MetricsProps {
  /** Aplica un conjunto de filtros (para las acciones rápidas). */
  onApplyFilters: (filters: SearchFilters) => void;
}

interface Metric {
  icon: ComponentType<{ className?: string }>;
  value: string;
  label: string;
  hint: string;
}

interface QuickAction {
  icon: ComponentType<{ className?: string }>;
  label: string;
  patch: Partial<SearchFilters>;
}

const QUICK_ACTIONS: QuickAction[] = [
  { icon: CircleDot, label: "Procesos abiertos", patch: { statuses: ["convocado"] } },
  { icon: Gavel, label: "Licitación pública", patch: { modalities: ["licitacion-publica"] } },
  { icon: TrendingUp, label: "Grandes cuantías", patch: { minValue: 500_000_000, maxValue: null } },
];

export function Metrics({ onApplyFilters }: MetricsProps) {
  const { data, isLoading } = useGlobalMetrics();
  const { user, isConfigured } = useAuth();
  const { openAuth } = useAuthUI();

  const total = data ? data.secopII + data.secopI : null;

  const metrics: Metric[] = [
    {
      icon: Database,
      value: isLoading || total === null ? "…" : formatInt(total),
      label: "Procesos indexados",
      hint: "Contratación pública nacional",
    },
    {
      icon: Layers,
      value: `${MODALITY_GROUPS.length}`,
      label: "Modalidades cubiertas",
      hint: "De Licitación a Mínima Cuantía",
    },
    {
      icon: RefreshCw,
      value: "Tiempo real",
      label: "Actualización",
      hint: "Directo desde Datos Abiertos",
    },
    {
      icon: ShieldCheck,
      value: "SECOP I + II",
      label: "Fuentes oficiales",
      hint: "API Socrata de datos.gov.co",
    },
  ];

  function applyQuick(patch: Partial<SearchFilters>) {
    onApplyFilters({ ...createInitialFilters(), ...patch });
  }

  function handleAlertCta() {
    if (isConfigured && !user) {
      openAuth("register");
    } else {
      document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="container py-10">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm"
            >
              <m.icon className="mb-3 h-7 w-7 text-accent" />
              <div className="text-2xl font-extrabold text-primary lg:text-3xl">{m.value}</div>
              <div className="mt-1 text-sm font-semibold text-foreground">{m.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{m.hint}</div>
            </div>
          ))}
        </div>

        {/* Acciones rápidas: hooks de retención */}
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-semibold text-foreground">Explora en un clic:</span>
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => applyQuick(a.patch)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:text-accent"
              >
                <a.icon className="h-3.5 w-3.5 text-accent" />
                {a.label}
              </button>
            ))}
          </div>

          <Button variant="accent" size="sm" className="shrink-0 gap-1.5" onClick={handleAlertCta}>
            {isConfigured && !user ? (
              <>
                <BellPlus className="h-4 w-4" />
                Regístrate y crea alertas
              </>
            ) : (
              <>
                Guardar una alerta
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}

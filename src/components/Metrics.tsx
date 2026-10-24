import { Database, Layers, RefreshCw, ShieldCheck } from "lucide-react";
import type { ComponentType } from "react";

import { useGlobalMetrics } from "@/hooks/useProcesses";
import { formatInt } from "@/lib/format";
import { MODALITY_GROUPS } from "@/config/filters";

interface Metric {
  icon: ComponentType<{ className?: string }>;
  value: string;
  label: string;
  hint: string;
}

export function Metrics() {
  const { data, isLoading } = useGlobalMetrics();

  const total = data ? data.secopII + data.secopI : null;

  const metrics: Metric[] = [
    {
      icon: Database,
      value: isLoading || total === null ? "…" : formatInt(total),
      label: "Procesos indexados",
      hint: "SECOP I + II combinados",
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
      value: "2 fuentes",
      label: "Oficiales",
      hint: "API Socrata de datos.gov.co",
    },
  ];

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
      </div>
    </section>
  );
}

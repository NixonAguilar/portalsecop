import { Building2, ExternalLink, Info } from "lucide-react";

import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCuantia, formatDate, relativeTime, titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { UnifiedProcess } from "@/types/secop";

interface ProcessDrawerProps {
  process: UnifiedProcess | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Row({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="border-b border-border py-2.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={cn("mt-0.5 text-sm text-foreground", mono && "font-mono")}>{value}</dd>
    </div>
  );
}

export function ProcessDrawer({ process, open, onOpenChange }: ProcessDrawerProps) {
  if (!process) return null;

  const sourceLabel = process.source === "SECOP_II" ? "SECOP II" : "SECOP I";
  const location = [process.city, process.department].filter(Boolean).map(titleCase).join(", ");
  const rel = relativeTime(process.publishedDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent side="right" className="max-w-lg p-0">
        <div className="flex h-full flex-col">
          <DialogHeader className="border-b border-border">
            <div className="flex items-center gap-2 pr-8">
              <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-accent">
                {sourceLabel}
              </span>
              <StatusBadge status={process.status} />
            </div>
            <DialogTitle className="mt-2 text-lg leading-snug">
              {titleCase(process.title)}
            </DialogTitle>
          </DialogHeader>

          {/* Cuerpo desplazable con el detalle completo */}
          <div className="flex-1 overflow-y-auto px-5 py-4 thin-scrollbar">
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-secondary/50 p-3">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {titleCase(process.entity)}
                </div>
                {process.entityNit && (
                  <div className="text-xs text-muted-foreground">NIT: {process.entityNit}</div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Cuantía
              </div>
              <div
                className={cn(
                  "text-2xl font-extrabold tabular-nums",
                  process.value && process.value > 0 ? "text-primary" : "text-muted-foreground",
                )}
              >
                {formatCuantia(process.value)}
              </div>
            </div>

            <dl>
              <Row label="Objeto del proceso" value={process.object} />
              <Row label="Modalidad" value={process.modality} />
              <Row label="Estado" value={process.status} />
              <Row label="Ubicación" value={location || undefined} />
              <Row label="Tipo de contrato" value={process.contractType} />
              <Row label="Clasificación UNSPSC / clase" value={process.unspsc} mono />
              <Row
                label="Fecha de publicación"
                value={
                  process.publishedDate
                    ? `${formatDate(process.publishedDate)}${rel ? ` · ${rel}` : ""}`
                    : undefined
                }
              />
              <Row
                label={process.source === "SECOP_I" ? "Fecha de firma" : "Fecha fase de selección"}
                value={process.deadlineDate ? formatDate(process.deadlineDate) : undefined}
              />
              <Row label="Referencia del proceso" value={process.reference} mono />
              <Row label="Número de constancia" value={process.constancia} mono />
            </dl>

            {process.source === "SECOP_I" && (
              <p className="mt-4 flex items-start gap-2 rounded-lg bg-accent/5 p-3 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                Si el portal oficial (contratos.gov.co) pide validación o no abre el detalle
                directamente, copia el <strong>N° de proceso o constancia</strong> y pégalo en su
                buscador.
              </p>
            )}
          </div>

          {/* Acciones fijas */}
          <div className="flex flex-col gap-2 border-t border-border p-4">
            {process.url && (
              <Button asChild variant="accent" className="w-full gap-1.5">
                <a href={process.url} target="_blank" rel="noopener noreferrer">
                  Abrir en SECOP Oficial
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            <CopyButton
              value={process.reference}
              label="Copiar número de proceso"
              className="h-10 justify-center rounded-md border border-border px-4 text-sm hover:bg-secondary"
            >
              Copiar N° de proceso
            </CopyButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

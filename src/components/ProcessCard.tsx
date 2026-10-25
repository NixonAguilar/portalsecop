import { Building2, Clock, ExternalLink, MapPin, PanelRightOpen, Tag } from "lucide-react";

import { Highlight } from "@/components/Highlight";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/ui/copy-button";
import { formatCuantia, formatDate, relativeTime, titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { UnifiedProcess } from "@/types/secop";

const SOURCE_STYLE: Record<UnifiedProcess["source"], string> = {
  SECOP_II: "bg-accent/10 text-accent",
  SECOP_I: "bg-slate-100 text-slate-600",
};
const SOURCE_LABEL: Record<UnifiedProcess["source"], string> = {
  SECOP_II: "SECOP II",
  SECOP_I: "SECOP I",
};

interface ProcessCardProps {
  process: UnifiedProcess;
  highlight: string;
  onOpen: (process: UnifiedProcess) => void;
}

export function ProcessCard({ process, highlight, onOpen }: ProcessCardProps) {
  const location = [process.city, process.department].filter(Boolean).map(titleCase).join(", ");
  const rel = relativeTime(process.publishedDate);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(process)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(process);
        }
      }}
      className={cn(
        "group flex h-full cursor-pointer flex-col rounded-xl border border-border bg-card p-5 shadow-sm",
        "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-teal-500/40 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
      )}
    >
      {/* Nivel 1 — Contexto y urgencia */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wide",
            SOURCE_STYLE[process.source],
          )}
        >
          {SOURCE_LABEL[process.source]}
        </span>
        <StatusBadge status={process.status} />
      </div>

      {/* Nivel 2 — Núcleo de decisión */}
      <div className="mb-1 flex items-start gap-1.5 text-sm font-medium text-accent">
        <Building2 className="mt-0.5 h-4 w-4 shrink-0" />
        <span className="line-clamp-1">{titleCase(process.entity)}</span>
      </div>

      <h3 className="mb-3 line-clamp-3 text-base font-semibold leading-snug text-foreground">
        <Highlight text={titleCase(process.title)} query={highlight} />
      </h3>

      {/* Nivel 3 — Valor económico */}
      <div className="mt-auto border-t border-border pt-3">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cuantía</dt>
        <dd
          className={cn(
            "text-lg font-bold tabular-nums",
            process.value && process.value > 0 ? "text-primary" : "text-muted-foreground",
          )}
        >
          {formatCuantia(process.value)}
        </dd>

        {/* Chips de metadatos */}
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-secondary-foreground">
            <Tag className="h-3 w-3 text-accent" />
            <span className="line-clamp-1 max-w-[180px]">{process.modality}</span>
          </span>
          {location && (
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-secondary-foreground">
              <MapPin className="h-3 w-3 text-accent" />
              {location}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-secondary-foreground">
            <span className="line-clamp-1 max-w-[150px] font-mono" title={process.reference}>
              {process.reference}
            </span>
            <CopyButton value={process.reference} label="Copiar referencia" />
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {rel ? <span className="font-medium text-foreground">{rel}</span> : formatDate(process.publishedDate)}
          {rel && <span className="text-muted-foreground">· {formatDate(process.publishedDate)}</span>}
        </span>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(process);
            }}
            className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-accent"
          >
            <PanelRightOpen className="h-3.5 w-3.5" />
            Ver expediente
          </button>
          {process.url && (
            <a
              href={process.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
            >
              SECOP
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

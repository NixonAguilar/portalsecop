import { Building2, CalendarClock, ExternalLink, MapPin, Tag } from "lucide-react";

import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { formatCOP, formatDate, titleCase } from "@/lib/format";
import type { UnifiedProcess } from "@/types/secop";

const SOURCE_LABEL: Record<UnifiedProcess["source"], string> = {
  SECOP_II: "SECOP II",
  SECOP_I: "SECOP I",
};

export function ProcessCard({ process }: { process: UnifiedProcess }) {
  const location = [process.city, process.department].filter(Boolean).map(titleCase).join(", ");

  return (
    <article className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-accent/40 hover:shadow-md animate-fade-in">
      {/* Encabezado: fuente + estado */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <Badge variant="outline" className="font-mono text-[11px] uppercase tracking-wide">
          {SOURCE_LABEL[process.source]}
        </Badge>
        <StatusBadge status={process.status} />
      </div>

      {/* Entidad */}
      <div className="mb-1 flex items-start gap-1.5 text-sm font-medium text-accent">
        <Building2 className="mt-0.5 h-4 w-4 shrink-0" />
        <span className="line-clamp-1">{titleCase(process.entity)}</span>
      </div>

      {/* Objeto */}
      <h3 className="mb-2 line-clamp-3 text-base font-semibold leading-snug text-foreground">
        {process.title}
      </h3>
      {process.object && process.object !== process.title && (
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{process.object}</p>
      )}

      {/* Metadatos */}
      <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-3 text-sm">
        <div className="col-span-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Cuantía
          </dt>
          <dd className="text-lg font-bold text-primary">{formatCOP(process.value)}</dd>
        </div>

        <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground">
          <Tag className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{process.modality}</span>
        </div>

        {location && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
          <span>{formatDate(process.publishedDate)}</span>
        </div>
      </dl>

      {/* Referencia + enlace */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="truncate font-mono text-xs text-muted-foreground" title={process.reference}>
          {process.reference}
        </span>
        {process.url ? (
          <a
            href={process.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-accent hover:underline"
          >
            Ver proceso
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">Sin enlace</span>
        )}
      </div>
    </article>
  );
}

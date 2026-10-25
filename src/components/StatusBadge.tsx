import { cn } from "@/lib/utils";

type Kind = "active" | "awarded" | "closed" | "cancelled" | "draft" | "neutral";

/** Clasifica el estado crudo en una categoría semántica. */
function classify(status: string): Kind {
  const s = status.toLowerCase();
  if (/(cancelad|suspendid|descartad|anormal|terminado sin|terminado anormal)/.test(s))
    return "cancelled";
  if (/(borrador)/.test(s)) return "draft";
  if (/(abierto|convocad|publicad|presentaci|manifestaci|expresión|evaluaci|aprobaci|lista corta)/.test(s))
    return "active";
  if (/(adjudicad|seleccionad|celebrad)/.test(s)) return "awarded";
  if (/(liquidad|finalizad)/.test(s)) return "closed";
  return "neutral";
}

const STYLES: Record<Kind, string> = {
  active: "bg-success/12 text-success",
  awarded: "bg-slate-500/12 text-slate-600",
  closed: "bg-slate-400/12 text-slate-500",
  cancelled: "bg-destructive/12 text-destructive",
  draft: "bg-warning/15 text-warning",
  neutral: "bg-secondary text-secondary-foreground",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const kind = classify(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STYLES[kind],
        className,
      )}
    >
      {kind === "active" && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
      )}
      {status}
    </span>
  );
}

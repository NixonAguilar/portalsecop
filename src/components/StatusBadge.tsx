import { Badge, type BadgeProps } from "@/components/ui/badge";

/** Mapea el estado crudo a una variante visual de badge. */
function variantFor(status: string): BadgeProps["variant"] {
  const s = status.toLowerCase();
  if (/(abierto|convocado|publicad|expresión|manifestaci)/.test(s)) return "success";
  if (/(evaluaci|aprobaci|aprobado|lista corta)/.test(s)) return "accent";
  if (/(adjudicad|seleccionad|celebrad)/.test(s)) return "default";
  if (/(cancelad|suspendid|descartad|anormal|terminado)/.test(s)) return "destructive";
  if (/(borrador)/.test(s)) return "secondary";
  if (/(liquidad|finalizad)/.test(s)) return "outline";
  return "secondary";
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={variantFor(status)} className="font-semibold">
      {status}
    </Badge>
  );
}

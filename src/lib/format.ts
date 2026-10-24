/** Utilidades de formateo para moneda (COP) y fechas en español de Colombia. */

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const compactCopFormatter = new Intl.NumberFormat("es-CO", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

/** Convierte un valor crudo (string | number | null) a número seguro. */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** Formatea un valor en pesos colombianos: $12.345.678 */
export function formatCOP(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "No disponible";
  return copFormatter.format(value);
}

/** Versión compacta: $1,2 mil M (útil en métricas). */
export function formatCOPCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return "$" + compactCopFormatter.format(value);
}

/** Formatea una fecha ISO de Socrata a dd/MM/yyyy. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** Formatea una fecha ISO a formato largo: 24 de octubre de 2026. */
export function formatDateLong(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Capitaliza la primera letra de cada palabra (soporta tildes y Ñ). */
export function titleCase(text: string | null | undefined): string {
  if (!text) return "";
  // Solo mayúscula tras inicio o separador; evita partir palabras con ñ/tildes.
  return text
    .toLowerCase()
    .replace(/(^|[\s\-/('"¿¡.])(\p{L})/gu, (_m, sep: string, ch: string) => sep + ch.toUpperCase());
}

/** Formatea un entero grande con separadores de miles. */
export function formatInt(value: number): string {
  return new Intl.NumberFormat("es-CO").format(value);
}

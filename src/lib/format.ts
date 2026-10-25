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

/**
 * Cuantía en COP con fallback claro cuando es 0, nula o no definida, para
 * evitar un "$0" confuso en procesos cuyo valor va "según pliegos".
 */
export function formatCuantia(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value) || value <= 0) {
    return "Cuantía por definir";
  }
  return formatCOP(value);
}

/** Tiempo relativo humanizado en español: "Hoy", "Ayer", "Hace 3 días"… */
export function relativeTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  // Diferencia en días calendario (ignora horas).
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);

  if (diffDays < 0) {
    const ahead = Math.abs(diffDays);
    if (ahead === 1) return "Mañana";
    return `En ${ahead} días`;
  }
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) {
    const w = Math.floor(diffDays / 7);
    return `Hace ${w} ${w === 1 ? "semana" : "semanas"}`;
  }
  if (diffDays < 365) {
    const m = Math.floor(diffDays / 30);
    return `Hace ${m} ${m === 1 ? "mes" : "meses"}`;
  }
  const y = Math.floor(diffDays / 365);
  return `Hace ${y} ${y === 1 ? "año" : "años"}`;
}

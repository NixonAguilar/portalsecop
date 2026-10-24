/**
 * Configuración de facetas de filtrado.
 *
 * Cada grupo lógico (p. ej. "Selección Abreviada") agrupa los valores crudos
 * reales de `modalidad_de_contratacion` / `estado_*` tal como aparecen en cada
 * dataset de Socrata. Los valores fueron obtenidos consultando
 * `$select=distinct ...` contra los endpoints en vivo.
 */

import type { SecopSource } from "@/types/secop";

export interface FacetGroup {
  id: string;
  label: string;
  /** Valores crudos por fuente. Un arreglo vacío = esta fuente no tiene match. */
  values: Record<SecopSource, string[]>;
}

export const SOURCE_OPTIONS: { value: "ALL" | SecopSource; label: string; hint: string }[] = [
  { value: "ALL", label: "Todos", hint: "SECOP I + II" },
  { value: "SECOP_II", label: "SECOP II", hint: "Procesos transaccionales" },
  { value: "SECOP_I", label: "SECOP I", hint: "Histórico / contratos" },
];

/** Modalidades de selección (Ley 80 / Ley 1150). */
export const MODALITY_GROUPS: FacetGroup[] = [
  {
    id: "licitacion-publica",
    label: "Licitación Pública",
    values: {
      SECOP_II: [
        "Licitación pública",
        "Licitación Pública Acuerdo Marco de Precios",
        "Licitación pública Obra Publica",
      ],
      SECOP_I: ["Licitación Pública", "Licitación obra pública"],
    },
  },
  {
    id: "seleccion-abreviada",
    label: "Selección Abreviada",
    values: {
      SECOP_II: [
        "Selección Abreviada de Menor Cuantía",
        "Seleccion Abreviada Menor Cuantia Sin Manifestacion Interes",
        "Selección abreviada subasta inversa",
      ],
      SECOP_I: [
        "Selección Abreviada de Menor Cuantía (Ley 1150 de 2007)",
        "Selección Abreviada del literal h del numeral 2 del artículo 2 de la Ley 1150 de 2007",
        "Selección Abreviada servicios de Salud",
        "Subasta",
      ],
    },
  },
  {
    id: "concurso-meritos",
    label: "Concurso de Méritos",
    values: {
      SECOP_II: ["Concurso de méritos abierto", "Concurso de méritos con precalificación"],
      SECOP_I: [
        "Concurso de Méritos Abierto",
        "Concurso de Méritos con Lista Corta",
        "Concurso de diseño Arquitectónico",
      ],
    },
  },
  {
    id: "contratacion-directa",
    label: "Contratación Directa",
    values: {
      SECOP_II: ["Contratación directa", "Contratación Directa (con ofertas)"],
      SECOP_I: ["Contratación Directa (Ley 1150 de 2007)"],
    },
  },
  {
    id: "minima-cuantia",
    label: "Mínima Cuantía",
    values: {
      SECOP_II: ["Mínima cuantía"],
      SECOP_I: ["Contratación Mínima Cuantía"],
    },
  },
  {
    id: "regimen-especial",
    label: "Régimen Especial",
    values: {
      SECOP_II: ["Contratación régimen especial", "Contratación régimen especial (con ofertas)"],
      SECOP_I: ["Régimen Especial"],
    },
  },
];

/** Estados del proceso. */
export const STATUS_GROUPS: FacetGroup[] = [
  {
    id: "borrador",
    label: "Borrador",
    values: { SECOP_II: ["Borrador"], SECOP_I: ["Borrador"] },
  },
  {
    id: "convocado",
    label: "Convocado / Abierto",
    values: {
      SECOP_II: ["Abierto", "Publicado"],
      SECOP_I: ["Convocado", "Publicación para manifestaciones de interés", "Expresión de Interés"],
    },
  },
  {
    id: "evaluacion",
    label: "En evaluación",
    values: {
      SECOP_II: ["Evaluación", "En aprobación", "Aprobado"],
      SECOP_I: ["Lista Corta", "Finalizado el plazo para manifestaciones de interés"],
    },
  },
  {
    id: "adjudicado",
    label: "Adjudicado",
    values: { SECOP_II: ["Seleccionado"], SECOP_I: ["Adjudicado"] },
  },
  {
    id: "celebrado",
    label: "Celebrado",
    values: { SECOP_II: [], SECOP_I: ["Celebrado"] },
  },
  {
    id: "liquidado",
    label: "Liquidado",
    values: { SECOP_II: [], SECOP_I: ["Liquidado"] },
  },
  {
    id: "finalizado",
    label: "Finalizado",
    values: { SECOP_II: [], SECOP_I: ["Finalizado", "Terminado sin Liquidar"] },
  },
  {
    id: "cancelado",
    label: "Cancelado / Suspendido",
    values: {
      SECOP_II: ["Cancelado", "Suspendido"],
      SECOP_I: ["Descartado", "Terminado Anormalmente después de Convocado"],
    },
  },
];

/** Mapa id -> grupo para resolución rápida. */
export const MODALITY_BY_ID = new Map(MODALITY_GROUPS.map((g) => [g.id, g]));
export const STATUS_BY_ID = new Map(STATUS_GROUPS.map((g) => [g.id, g]));

/** Departamentos de Colombia + Bogotá D.C. */
export const DEPARTMENTS: string[] = [
  "Amazonas",
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bogotá D.C.",
  "Bolívar",
  "Boyacá",
  "Caldas",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Cundinamarca",
  "Guainía",
  "Guaviare",
  "Huila",
  "La Guajira",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "Quindío",
  "Risaralda",
  "San Andrés y Providencia",
  "Santander",
  "Sucre",
  "Tolima",
  "Valle del Cauca",
  "Vaupés",
  "Vichada",
];

/** Presets de cuantía para accesos rápidos (COP). */
export const VALUE_PRESETS: { label: string; min: number | null; max: number | null }[] = [
  { label: "Cualquiera", min: null, max: null },
  { label: "Hasta $50M", min: null, max: 50_000_000 },
  { label: "$50M – $500M", min: 50_000_000, max: 500_000_000 },
  { label: "$500M – $5.000M", min: 500_000_000, max: 5_000_000_000 },
  { label: "Más de $5.000M", min: 5_000_000_000, max: null },
];

export const PAGE_SIZE = 12;

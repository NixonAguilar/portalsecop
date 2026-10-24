/**
 * Capa de servicios SECOP sobre la API Socrata (SoQL).
 *
 * Responsabilidades:
 *  - Construir dinámicamente consultas SoQL válidas ($q, $where, $order,
 *    $limit, $offset) por cada fuente, usando los nombres de columna reales.
 *  - Normalizar los registros crudos de SECOP I y II a `UnifiedProcess`.
 *  - Resolver la selección "Todos" consultando ambas fuentes en paralelo.
 */

import { MODALITY_BY_ID, STATUS_BY_ID } from "@/config/filters";
import { toNumber } from "@/lib/format";
import type {
  RawSecopI,
  RawSecopII,
  SearchFilters,
  SearchResult,
  SecopSource,
  SocrataUrl,
  UnifiedProcess,
} from "@/types/secop";

const APP_TOKEN = import.meta.env.VITE_SOCRATA_APP_TOKEN;

const ENDPOINTS: Record<SecopSource, string> = {
  SECOP_II: import.meta.env.VITE_SECOP_II_ENDPOINT,
  SECOP_I: import.meta.env.VITE_SECOP_I_ENDPOINT,
};

/** Mapa de campos SoQL por fuente. */
const FIELDS: Record<
  SecopSource,
  {
    modalidad: string;
    estado: string;
    valor: string;
    departamento: string;
    unspsc: string;
    fecha: string;
  }
> = {
  SECOP_II: {
    modalidad: "modalidad_de_contratacion",
    estado: "estado_del_procedimiento",
    valor: "precio_base",
    departamento: "departamento_entidad",
    unspsc: "codigo_principal_de_categoria",
    fecha: "fecha_de_publicacion_del",
  },
  SECOP_I: {
    modalidad: "modalidad_de_contratacion",
    estado: "estado_del_proceso",
    valor: "cuantia_proceso",
    departamento: "departamento_entidad",
    unspsc: "id_clase",
    fecha: "fecha_de_cargue_en_el_secop",
  },
};

/**
 * Sanitización SoQL: duplica las comillas simples para neutralizar la
 * inyección en literales de cadena. (Helper validado en implementaciones
 * previas.)
 */
export const escSoql = (s: string | number): string => String(s).replace(/'/g, "''");

/** Construye la cláusula $where para una fuente concreta. */
function buildWhere(source: SecopSource, filters: SearchFilters): string {
  const f = FIELDS[source];
  const clauses: string[] = [];

  // Modalidades: expandir grupos lógicos a valores crudos de la fuente.
  if (filters.modalities.length > 0) {
    const values = filters.modalities.flatMap(
      (id) => MODALITY_BY_ID.get(id)?.values[source] ?? [],
    );
    clauses.push(values.length > 0 ? inClause(f.modalidad, values) : "1=0");
  }

  // Estados.
  if (filters.statuses.length > 0) {
    const values = filters.statuses.flatMap(
      (id) => STATUS_BY_ID.get(id)?.values[source] ?? [],
    );
    clauses.push(values.length > 0 ? inClause(f.estado, values) : "1=0");
  }

  // Departamento (case-insensitive).
  if (filters.department) {
    clauses.push(`upper(${f.departamento}) = upper('${escSoql(filters.department)}')`);
  }

  // Rango de cuantía (las columnas aceptan comparación numérica directa).
  if (filters.minValue != null) {
    clauses.push(`${f.valor} >= ${Math.trunc(filters.minValue)}`);
  }
  if (filters.maxValue != null) {
    clauses.push(`${f.valor} <= ${Math.trunc(filters.maxValue)}`);
  }

  // Clasificación UNSPSC / clase.
  if (filters.unspsc) {
    clauses.push(`upper(${f.unspsc}) like upper('%${escSoql(filters.unspsc)}%')`);
  }

  // Rango de fechas de publicación.
  if (filters.dateFrom) {
    clauses.push(`${f.fecha} >= '${escSoql(filters.dateFrom)}T00:00:00.000'`);
  }
  if (filters.dateTo) {
    clauses.push(`${f.fecha} <= '${escSoql(filters.dateTo)}T23:59:59.999'`);
  }

  return clauses.join(" AND ");
}

function inClause(field: string, values: string[]): string {
  const quoted = values.map((v) => `'${escSoql(v)}'`).join(", ");
  return `${field} in (${quoted})`;
}

/** Construye el objeto de parámetros SoQL para una fuente. */
function buildParams(
  source: SecopSource,
  filters: SearchFilters,
  limit: number,
  offset: number,
): URLSearchParams {
  const f = FIELDS[source];
  const params = new URLSearchParams();

  const query = filters.query.trim();
  if (query) params.set("$q", query);

  const where = buildWhere(source, filters);
  if (where) params.set("$where", where);

  params.set("$order", `${f.fecha} DESC`);
  params.set("$limit", String(limit));
  params.set("$offset", String(offset));
  return params;
}

async function socrataFetch<T>(endpoint: string, params: URLSearchParams): Promise<T> {
  const headers: HeadersInit = {};
  if (APP_TOKEN) headers["X-App-Token"] = APP_TOKEN;

  const res = await fetch(`${endpoint}?${params.toString()}`, { headers });
  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { message?: string };
      detail = body?.message ? ` — ${body.message}` : "";
    } catch {
      /* respuesta no-JSON */
    }
    throw new Error(`Socrata ${res.status}${detail}`);
  }
  return (await res.json()) as T;
}

/** Cuenta registros que cumplen el filtro (para paginación/métricas). */
async function fetchCount(source: SecopSource, filters: SearchFilters): Promise<number> {
  const params = new URLSearchParams();
  const query = filters.query.trim();
  if (query) params.set("$q", query);
  const where = buildWhere(source, filters);
  if (where) params.set("$where", where);
  params.set("$select", "count(1) as total");

  const rows = await socrataFetch<Array<Record<string, string>>>(ENDPOINTS[source], params);
  const first = rows[0];
  if (!first) return 0;
  return toNumber(Object.values(first)[0]) ?? 0;
}

/* -------------------------------------------------------------------------- */
/* Normalización                                                              */
/* -------------------------------------------------------------------------- */

function resolveUrl(raw: SocrataUrl | string | undefined): string | undefined {
  if (!raw) return undefined;
  if (typeof raw === "string") return raw;
  return raw.url;
}

function normalizeII(r: RawSecopII): UnifiedProcess {
  const id = r.id_del_proceso ?? r.referencia_del_proceso ?? crypto.randomUUID();
  const object = r.descripci_n_del_procedimiento ?? "";
  return {
    key: `II-${id}`,
    source: "SECOP_II",
    id,
    reference: r.referencia_del_proceso ?? id,
    entity: r.entidad ?? "Entidad no especificada",
    entityNit: r.nit_entidad,
    title: r.nombre_del_procedimiento?.trim() || truncate(object, 90) || "Proceso sin título",
    object,
    modality: r.modalidad_de_contratacion ?? "No especificada",
    status: r.estado_del_procedimiento ?? r.estado_resumen ?? "No especificado",
    value: toNumber(r.precio_base),
    awardedValue: toNumber(r.valor_total_adjudicacion),
    department: r.departamento_entidad,
    city: r.ciudad_entidad,
    unspsc: r.codigo_principal_de_categoria,
    contractType: r.tipo_de_contrato,
    phase: r.fase,
    publishedDate: r.fecha_de_publicacion_del,
    deadlineDate: r.fecha_de_publicacion_fase_3,
    url: resolveUrl(r.urlproceso),
    raw: r,
  };
}

function normalizeI(r: RawSecopI): UnifiedProcess {
  const id = r.uid ?? r.numero_de_constancia ?? r.numero_de_proceso ?? crypto.randomUUID();
  const object =
    r.detalle_del_objeto_a_contratar ?? r.objeto_del_contrato_a_la ?? r.objeto_a_contratar ?? "";
  return {
    key: `I-${id}`,
    source: "SECOP_I",
    id,
    reference: r.numero_de_proceso ?? r.numero_de_constancia ?? r.numero_de_contrato ?? id,
    entity: r.nombre_entidad ?? "Entidad no especificada",
    entityNit: r.nit_de_la_entidad,
    title: r.objeto_a_contratar?.trim() || truncate(object, 90) || "Proceso sin título",
    object,
    modality: r.modalidad_de_contratacion ?? r.nombre_regimen_de_contratacion ?? "No especificada",
    status: r.estado_del_proceso ?? "No especificado",
    value: toNumber(r.cuantia_proceso) ?? toNumber(r.cuantia_contrato),
    awardedValue: toNumber(r.cuantia_contrato) ?? toNumber(r.valor_contrato_con_adiciones),
    department: r.departamento_entidad,
    city: r.municipio_entidad,
    unspsc: r.id_clase ?? r.nombre_clase,
    contractType: r.tipo_de_contrato,
    publishedDate: r.fecha_de_cargue_en_el_secop,
    deadlineDate: r.fecha_de_firma_del_contrato,
    url: r.ruta_proceso_en_secop_i,
    raw: r,
  };
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

function sortByDateDesc(a: UnifiedProcess, b: UnifiedProcess): number {
  const ta = a.publishedDate ? Date.parse(a.publishedDate) : 0;
  const tb = b.publishedDate ? Date.parse(b.publishedDate) : 0;
  return tb - ta;
}

/* -------------------------------------------------------------------------- */
/* API pública                                                                */
/* -------------------------------------------------------------------------- */

async function fetchSource(
  source: SecopSource,
  filters: SearchFilters,
  limit: number,
  offset: number,
): Promise<UnifiedProcess[]> {
  const params = buildParams(source, filters, limit, offset);
  if (source === "SECOP_II") {
    const rows = await socrataFetch<RawSecopII[]>(ENDPOINTS.SECOP_II, params);
    return rows.map(normalizeII);
  }
  const rows = await socrataFetch<RawSecopI[]>(ENDPOINTS.SECOP_I, params);
  return rows.map(normalizeI);
}

/**
 * Busca procesos según filtros. `page` es 0-indexado.
 * Para la fuente "Todos" se consultan ambas APIs en paralelo repartiendo el
 * tamaño de página y combinando por fecha de publicación descendente.
 */
export async function searchProcesses(
  filters: SearchFilters,
  page: number,
  pageSize: number,
): Promise<SearchResult> {
  if (filters.source !== "ALL") {
    const source = filters.source;
    const offset = page * pageSize;
    const [items, total] = await Promise.all([
      fetchSource(source, filters, pageSize, offset),
      fetchCount(source, filters),
    ]);
    return { items, total, page, pageSize };
  }

  // "Todos": repartir la página entre ambas fuentes.
  const halfII = Math.ceil(pageSize / 2);
  const halfI = pageSize - halfII;

  const [itemsII, itemsI, countII, countI] = await Promise.all([
    fetchSource("SECOP_II", filters, halfII, page * halfII),
    fetchSource("SECOP_I", filters, halfI, page * halfI),
    fetchCount("SECOP_II", filters),
    fetchCount("SECOP_I", filters),
  ]);

  const items = [...itemsII, ...itemsI].sort(sortByDateDesc);
  return { items, total: countII + countI, page, pageSize };
}

/** Totales globales por fuente (sin filtros) para la sección de métricas. */
export async function fetchGlobalMetrics(): Promise<{ secopII: number; secopI: number }> {
  const empty: SearchFilters = {
    source: "ALL",
    query: "",
    modalities: [],
    statuses: [],
    department: "",
    minValue: null,
    maxValue: null,
    unspsc: "",
    dateFrom: "",
    dateTo: "",
  };
  const [secopII, secopI] = await Promise.all([
    fetchCount("SECOP_II", empty),
    fetchCount("SECOP_I", empty),
  ]);
  return { secopII, secopI };
}

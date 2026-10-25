/**
 * Contratos TypeScript para los datos SECOP (Socrata).
 * Las interfaces "Raw" reflejan los nombres de columna reales de cada dataset;
 * `UnifiedProcess` es el modelo normalizado que consume la UI.
 */

/** Fuente de datos. */
export type SecopSource = "SECOP_II" | "SECOP_I";

/** Selector de fuente en la UI (incluye "Todos"). */
export type SourceSelection = SecopSource | "ALL";

/** Objeto URL que devuelve Socrata para urlproceso (SECOP II). */
export interface SocrataUrl {
  url?: string;
  description?: string;
}

/** Registro crudo de SECOP II (dataset p6dx-8zbt). Campos parciales/relevantes. */
export interface RawSecopII {
  id_del_proceso?: string;
  referencia_del_proceso?: string;
  entidad?: string;
  nit_entidad?: string;
  descripci_n_del_procedimiento?: string;
  nombre_del_procedimiento?: string;
  modalidad_de_contratacion?: string;
  estado_del_procedimiento?: string;
  estado_resumen?: string;
  fase?: string;
  precio_base?: string;
  valor_total_adjudicacion?: string;
  departamento_entidad?: string;
  ciudad_entidad?: string;
  codigo_principal_de_categoria?: string;
  tipo_de_contrato?: string;
  fecha_de_publicacion_del?: string;
  fecha_de_ultima_publicaci?: string;
  fecha_de_publicacion_fase_3?: string;
  adjudicado?: string;
  nombre_del_adjudicador?: string;
  urlproceso?: SocrataUrl | string;
  [key: string]: unknown;
}

/** Registro crudo de SECOP I (dataset f789-7hwg). Campos parciales/relevantes. */
export interface RawSecopI {
  uid?: string;
  numero_de_proceso?: string;
  numero_de_constancia?: string;
  numero_de_contrato?: string;
  nombre_entidad?: string;
  nit_de_la_entidad?: string;
  objeto_a_contratar?: string;
  detalle_del_objeto_a_contratar?: string;
  objeto_del_contrato_a_la?: string;
  modalidad_de_contratacion?: string;
  nombre_regimen_de_contratacion?: string;
  estado_del_proceso?: string;
  cuantia_proceso?: string;
  cuantia_contrato?: string;
  valor_contrato_con_adiciones?: string;
  departamento_entidad?: string;
  municipio_entidad?: string;
  id_clase?: string;
  nombre_clase?: string;
  tipo_de_contrato?: string;
  fecha_de_cargue_en_el_secop?: string;
  fecha_de_firma_del_contrato?: string;
  /** Socrata entrega este campo como objeto { url } (no como string). */
  ruta_proceso_en_secop_i?: SocrataUrl | string;
  [key: string]: unknown;
}

/** Modelo unificado que consume toda la UI. */
export interface UnifiedProcess {
  /** Clave única y estable para React. */
  key: string;
  source: SecopSource;
  /** Identificador del proceso en la fuente. */
  id: string;
  /** Número / referencia del proceso visible al usuario. */
  reference: string;
  /** Entidad compradora. */
  entity: string;
  entityNit?: string;
  /** Título corto (nombre del procedimiento u objeto resumido). */
  title: string;
  /** Objeto contractual completo. */
  object: string;
  modality: string;
  status: string;
  /** Valor estimado / cuantía en COP. */
  value: number | null;
  awardedValue: number | null;
  department?: string;
  city?: string;
  /** Clasificación UNSPSC / clase. */
  unspsc?: string;
  contractType?: string;
  phase?: string;
  publishedDate?: string;
  deadlineDate?: string;
  /** Número de constancia (SECOP I), útil para el enlace canónico y copiar. */
  constancia?: string;
  /** Enlace directo al proceso en SECOP. */
  url?: string;
  /** Registro crudo por si se requiere más detalle. */
  raw: RawSecopII | RawSecopI;
}

/** Estado de los filtros de búsqueda (fuente de verdad de la UI). */
export interface SearchFilters {
  source: SourceSelection;
  /** Texto libre (objeto, entidad, referencia). */
  query: string;
  /** IDs de grupos de modalidad seleccionados (ver MODALITY_GROUPS en config/filters.ts). */
  modalities: string[];
  /** IDs de grupos de estado seleccionados (ver STATUS_GROUPS en config/filters.ts). */
  statuses: string[];
  /** Departamentos seleccionados (nombres tal como se muestran en la UI). */
  departments: string[];
  /** Valor mínimo (COP) o null. */
  minValue: number | null;
  /** Valor máximo (COP) o null. */
  maxValue: number | null;
  /** Código UNSPSC / clase a filtrar o "". */
  unspsc: string;
  /** Fecha de publicación desde (ISO yyyy-mm-dd) o "". */
  dateFrom: string;
  /** Fecha de publicación hasta (ISO yyyy-mm-dd) o "". */
  dateTo: string;
}

/** Resultado paginado normalizado. */
export interface SearchResult {
  items: UnifiedProcess[];
  /** Total aproximado de registros que cumplen el filtro. */
  total: number;
  page: number;
  pageSize: number;
}

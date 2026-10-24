/**
 * Capa central de configuración por variables de entorno.
 *
 * Responsabilidad única (SRP): leer, *sanitizar* y *validar* las variables
 * `VITE_*` una sola vez, exponiendo un objeto tipado y una lista de errores de
 * configuración legibles. Así ningún servicio dispara `fetch` contra una URL
 * malformada (p. ej. una variable pegada como enlace Markdown).
 */

/** Error de configuración: credenciales/endpoints ausentes o malformados. */
export class ConfigError extends Error {
  readonly isConfigError = true;
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export function isConfigError(err: unknown): err is ConfigError {
  return err instanceof ConfigError || (typeof err === "object" && err !== null && "isConfigError" in err);
}

/**
 * Normaliza un valor de variable que puede llegar "sucio":
 *  - enlace Markdown `[texto](url)` (error de copiado frecuente)
 *  - comillas envolventes, espacios o saltos de línea
 *  - barras finales
 * Devuelve la mejor URL http(s) encontrada, o "" si no hay nada usable.
 */
export function sanitizeUrl(raw: string | undefined | null): string {
  if (!raw) return "";
  let v = String(raw).trim();

  // Markdown: [texto](url) -> preferir la que sea http(s).
  const md = v.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (md) {
    const label = md[1].trim();
    const href = md[2].trim();
    v = /^https?:\/\//i.test(label) ? label : href;
  }

  // Comillas envolventes y espacios internos sobrantes.
  v = v.replace(/^['"\s]+|['"\s]+$/g, "");
  // Barras finales.
  v = v.replace(/\/+$/, "");
  return v;
}

/** ¿Es una URL http/https válida? */
export function isValidHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Sanitiza un token/clave: recorta espacios y comillas; sin otras reglas. */
function sanitizeSecret(raw: string | undefined | null): string {
  if (!raw) return "";
  return String(raw).trim().replace(/^['"]+|['"]+$/g, "");
}

export interface SocrataConfig {
  /** Token de rate-limit de Socrata (opcional: la API funciona sin él). */
  appToken: string;
  endpoints: {
    SECOP_II: string;
    SECOP_I: string;
  };
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  /** true solo si ambos valores están presentes y la URL es válida. */
  configured: boolean;
}

export interface AppConfig {
  socrata: SocrataConfig;
  supabase: SupabaseConfig;
  /** Errores de configuración legibles para mostrar en la UI. */
  errors: string[];
}

function buildConfig(): AppConfig {
  const errors: string[] = [];

  const appToken = sanitizeSecret(import.meta.env.VITE_SOCRATA_APP_TOKEN);

  const secopII = sanitizeUrl(import.meta.env.VITE_SECOP_II_ENDPOINT);
  const secopI = sanitizeUrl(import.meta.env.VITE_SECOP_I_ENDPOINT);

  if (!secopII) {
    errors.push("Falta la variable VITE_SECOP_II_ENDPOINT (endpoint de SECOP II).");
  } else if (!isValidHttpUrl(secopII)) {
    errors.push(`VITE_SECOP_II_ENDPOINT no es una URL válida: "${secopII}".`);
  }

  if (!secopI) {
    errors.push("Falta la variable VITE_SECOP_I_ENDPOINT (endpoint de SECOP I).");
  } else if (!isValidHttpUrl(secopI)) {
    errors.push(`VITE_SECOP_I_ENDPOINT no es una URL válida: "${secopI}".`);
  }

  // Supabase es opcional hasta que se configuren credenciales.
  const supabaseUrl = sanitizeUrl(import.meta.env.VITE_SUPABASE_URL);
  const supabaseAnonKey = sanitizeSecret(import.meta.env.VITE_SUPABASE_ANON_KEY);
  const supabaseConfigured = Boolean(supabaseUrl) && isValidHttpUrl(supabaseUrl) && Boolean(supabaseAnonKey);

  return {
    socrata: {
      appToken,
      endpoints: { SECOP_II: secopII, SECOP_I: secopI },
    },
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      configured: supabaseConfigured,
    },
    errors,
  };
}

/** Configuración resuelta una sola vez al cargar el módulo. */
export const appConfig: AppConfig = buildConfig();

/** ¿Hay errores de configuración de Socrata que impidan consultar? */
export function hasSocrataConfigError(): boolean {
  return appConfig.errors.length > 0;
}

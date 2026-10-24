/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOCRATA_APP_TOKEN: string;
  readonly VITE_SECOP_II_ENDPOINT: string;
  readonly VITE_SECOP_I_ENDPOINT: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

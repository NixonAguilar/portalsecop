/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOCRATA_APP_TOKEN: string;
  readonly VITE_SECOP_II_ENDPOINT: string;
  readonly VITE_SECOP_I_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

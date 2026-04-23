/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_LOGIN_ID?: string;
  readonly VITE_DEFAULT_LOGIN_PASSWORD?: string;
  readonly VITE_ADMIN_LOGIN_ID?: string;
  readonly VITE_ADMIN_LOGIN_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

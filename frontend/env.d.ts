/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_BRANCH?: string
  readonly VITE_COMMIT?: string
  readonly VITE_DATE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

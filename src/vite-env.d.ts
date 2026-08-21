/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ROOM_VISUAL_DEFAULT?: 'classic' | 'morph' | 'morph-plan' | 'morph-legacy'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

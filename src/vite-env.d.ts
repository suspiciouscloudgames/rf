/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ROOM_VISUAL_DEFAULT?: 'classic' | 'morph' | 'morph-legacy'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

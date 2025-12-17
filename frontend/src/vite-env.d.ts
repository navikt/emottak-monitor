/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DEPLOY_TARGET: 'dev' | 'prod';
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

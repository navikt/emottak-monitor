import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {proxy:{"/v1":{target: "https://emottak-monitor.intern.dev.nav.no",
                changeOrigin: true,
                secure: false,}}},
    build: {outDir:"build"},
})
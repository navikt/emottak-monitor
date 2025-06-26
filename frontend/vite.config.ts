import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {proxy:{"/v1":{target: `${process.env.PROXY_URL }`,
                changeOrigin: true,
                secure: false,}}},
    build: {outDir:"build"},
})

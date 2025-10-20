import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    //TODO Parviz: use "localhost" in local environment
    server: {proxy:{"/v1":{target: `http://localhost:8081`,
                changeOrigin: true,
                secure: false,}}},
    build: {outDir:"build"},
})

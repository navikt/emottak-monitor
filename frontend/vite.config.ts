import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const lessIgnorePlugin = {
    name: 'less-ignore',
    setup(build: any) {
        build.onLoad({ filter: /\.less$/ }, () => ({
            contents: '',
            loader: 'css',
        }))
    },
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        esbuildOptions: {
            plugins: [lessIgnorePlugin],
        },
    },
    server: {proxy:{"/v1":{target: `${process.env.PROXY_URL }`,
                changeOrigin: true,
                secure: false,}}},
    build: {outDir:"build"},
})

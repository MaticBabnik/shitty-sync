import { fileURLToPath, URL } from 'node:url'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [
        vue(),
        visualizer({
            emitFile: true,
            filename: 'bundle.html',
            gzipSize: true,
            template: 'treemap'
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        rollupOptions: {
            input: {
                app: fileURLToPath(new URL('./index.html', import.meta.url)),
                frameApi: fileURLToPath(new URL('./frame-api.html', import.meta.url))
            }
        }
    },
    server: {
        proxy: {
            '^/(url|youtube)/.*': 'http://localhost:8080',
            '/socket.io': {
                target: 'http://localhost:8080',
                ws: true
            }
        }
    },
    optimizeDeps: {}
})

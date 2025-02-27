import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    },
    server: {
        proxy: {
            '/api': {
                target: isProduction ? 'https://plan-poker.com' : 'http://localhost:8080',
                changeOrigin: true,
                secure: true,
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            },
            '/planningHub': {
                target: isProduction ? 'https://plan-poker.com' : 'http://localhost:8080',
                changeOrigin: true,
                ws: true,
                secure: true,
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            }
        },
        port: 5173,
    }
});

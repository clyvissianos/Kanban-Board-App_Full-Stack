import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        // match the port you’re already launching on
        port: 50828,
        strictPort: true,
        // forward any /api requests to your .NET backend
        proxy: {
            '/api': {
                target: 'https://localhost:7050',
                changeOrigin: true,
                secure: false,     // if your API uses a self‐signed cert
            },
            '/health': { target: 'https://localhost:7050', changeOrigin: true, secure: false }
        }
    }
});

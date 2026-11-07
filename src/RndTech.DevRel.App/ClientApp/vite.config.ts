import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'build'
    },
    server: {
        port: 44422,
        strictPort: true,
        proxy: {
            '/api': 'http://localhost:29500'
        }
    },
    test: {
        globals: true,
        include: ['src/**/*.test.ts']
    }
})

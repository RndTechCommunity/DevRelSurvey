import { defineConfig } from '@playwright/test'

export default defineConfig({
    testDir: 'e2e',
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: 'http://localhost:4173',
        channel: 'chrome'
    },
    webServer: {
        command: 'npm run build && npx vite preview --port 4173 --strictPort',
        url: 'http://localhost:4173',
        // Не подхватывать чужой сервер на том же порту: занятый порт — ошибка запуска.
        reuseExistingServer: false,
        timeout: 180_000
    }
})

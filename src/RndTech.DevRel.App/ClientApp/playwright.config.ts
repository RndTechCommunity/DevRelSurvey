import { defineConfig } from '@playwright/test'

export default defineConfig({
    testDir: 'e2e',
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: 'http://localhost:4173',
        channel: 'chrome'
    },
    webServer: {
        command: 'npx react-scripts start',
        url: 'http://localhost:4173',
        // Не подхватывать чужой сервер на том же порту: занятый порт — ошибка запуска.
        reuseExistingServer: false,
        timeout: 180_000,
        env: {
            BROWSER: 'none',
            HTTPS: 'false',
            PORT: '4173'
        }
    }
})

import { expect, test } from '@playwright/test'
import { mockApi } from './mockApi'

// Исправленное поведение (разрешённые изменения issue #19).

const MOBILE_TITLE = 'Исследование Ростовского ИТ-сообщества'

for (const width of [390, 768, 1223]) {
    test(`width ${width} mounts only the mobile view`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await mockApi(page)
        await page.goto('/')

        await expect(page.getByRole('heading', { name: MOBILE_TITLE })).toBeVisible()
        await expect(page.locator('.rs-sidebar')).toHaveCount(0)
    })
}

for (const width of [1224, 1225, 1440]) {
    test(`width ${width} mounts only the desktop view`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await mockApi(page)
        await page.goto('/')

        await expect(page.getByText('В выборке 100 человек')).toBeVisible()
        await expect(page.locator('.rs-sidebar')).toHaveCount(1)
        await expect(page.getByRole('heading', { name: MOBILE_TITLE })).toHaveCount(0)
        await expect(page.locator('.recharts-wrapper')).toHaveCount(1)
    })
}

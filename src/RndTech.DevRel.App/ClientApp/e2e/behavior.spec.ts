import { expect, Locator, Page, test } from '@playwright/test'
import { mockApi } from './mockApi'

// Исправленное поведение (разрешённые изменения issue #19).

const MOBILE_TITLE = 'Исследование Ростовского ИТ-сообщества'

function table(page: Page, header: string) {
    return page.locator('.rs-table').filter({ has: page.getByRole('columnheader', { name: header }) })
}

function firstColumn(tableLocator: Locator) {
    return tableLocator.locator('.rs-table-body-row-wrapper .rs-table-cell-first')
}

// Сортировка применяется сразу; в исходной версии — через 500 ms.
const WITHOUT_DELAY = { timeout: 300 }

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

test.describe('desktop 1440', () => {
    test.use({ viewport: { width: 1440, height: 900 } })

    test('sorts company names descending, then ascending', async ({ page }) => {
        await mockApi(page)
        await page.goto('/')
        const companies = table(page, 'Компания')

        await companies.getByRole('columnheader', { name: 'Компания' }).click()
        await expect(firstColumn(companies)).toHaveText(
            ['Тинькофф', 'Почтатех', 'Контур', 'ИТРУМ (ex Exceed Team)', 'IBS Dunice', 'Gamma%'], WITHOUT_DELAY)

        await expect(companies.locator('.rs-table-cell-header-icon-sort-desc')).toBeVisible()
        await companies.getByRole('columnheader', { name: 'Компания' }).click()
        await expect(firstColumn(companies)).toHaveText(
            ['Gamma%', 'IBS Dunice', 'ИТРУМ (ex Exceed Team)', 'Контур', 'Почтатех', 'Тинькофф'])
    })

    test('sorts sample categories by name descending', async ({ page }) => {
        await mockApi(page)
        await page.goto('/')
        await page.getByRole('button', { name: 'Состав выборки' }).click()
        const languages = table(page, 'Язык программирования')

        await languages.getByRole('columnheader', { name: 'Язык программирования' }).click()
        await expect(firstColumn(languages)).toHaveText(['TypeScript', 'JavaScript', 'C#'], WITHOUT_DELAY)
    })
})

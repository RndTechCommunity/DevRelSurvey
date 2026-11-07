import { expect, Page, test } from '@playwright/test'
import { INITIAL_FILTER, isCompanies, mockApi } from './mockApi'

// Инварианты, общие для исходного и переработанного интерфейса.

const WIDTHS = [390, 768, 1223, 1224, 1225, 1440]

const activeTab = (page: Page) => page.locator('[role="button"][aria-selected="true"]')

function rowCells(page: Page, name: string) {
    return page.locator('.rs-table-row').filter({ hasText: name }).first().locator('.rs-table-cell')
}

test.describe('desktop 1440', () => {
    test.use({ viewport: { width: 1440, height: 900 } })

    test('opens 2022 for the initial group and shows company values', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto('/')

        await expect(page.getByText('В выборке 100 человек')).toBeVisible()
        expect(api.posts(isCompanies)[0].body).toBe(JSON.stringify(INITIAL_FILTER))
        await expect(activeTab(page)).toHaveText('2022')
        await expect(rowCells(page, 'IBS Dunice')).toHaveText(['IBS Dunice', '40%', '10%', '5%', '15%', '95', '60'])
    })

    test('switches the year without a new request', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto('/')
        await expect(page.getByText('В выборке 100 человек')).toBeVisible()
        const posts = api.posts().length

        await page.getByRole('button', { name: '2019', exact: true }).click()

        await expect(page.getByText('В выборке 50 человек')).toBeVisible()
        await expect(rowCells(page, 'Контур')).toHaveText(['Контур', '25%', '5%', '2.5%', '7.5%', '52.5', '42.9'])
        expect(api.posts()).toHaveLength(posts)
    })

    test('shows the sample composition', async ({ page }) => {
        await mockApi(page)
        await page.goto('/')
        await page.getByRole('button', { name: 'Состав выборки' }).click()

        await expect(page.getByRole('columnheader', { name: 'Язык программирования' })).toBeVisible()
        await expect(rowCells(page, 'JavaScript')).toHaveText(['JavaScript', '30 (60%)', '50 (62.5%)', '40 (66.7%)', '70 (70%)'])
    })

    test('opens a legacy link of 2020', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto(`/?tab=${encodeURIComponent('"known-and-wanted-2020"')}`
            + `&filter=${encodeURIComponent(JSON.stringify(INITIAL_FILTER))}`)

        await expect(page.getByText('В выборке 80 человек')).toBeVisible()
        await expect(activeTab(page)).toHaveText('2020')
        expect(api.posts(isCompanies)[0].body).toBe(JSON.stringify(INITIAL_FILTER))
    })
})

test('mobile 390 shows the summary of the initial group', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    const api = await mockApi(page)
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Исследование Ростовского ИТ-сообщества' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('100')
    await expect(page.locator('.rs-sidebar')).toHaveCount(0)
    expect(api.posts(isCompanies)[0].body).toBe(JSON.stringify(INITIAL_FILTER))
})

test('screenshots of the initial page', async ({ page }) => {
    await mockApi(page)
    for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 })
        await page.goto('/')
        await expect(page.getByText(/В выборке|Всего участников/).first()).toBeVisible()
        if (width < 1224) {
            await expect(page.locator('.recharts-pie-labels')).toHaveCount(2)
            await expect(page.locator('.recharts-label-list')).toHaveCount(2)
        }
        await test.info().attach(`initial-${width}.png`, {
            body: await page.screenshot({ fullPage: true }),
            contentType: 'image/png'
        })
    }
})

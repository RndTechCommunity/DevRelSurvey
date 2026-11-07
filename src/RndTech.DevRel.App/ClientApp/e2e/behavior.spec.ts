import { expect, Locator, Page, test } from '@playwright/test'
import { filterOptions } from '../src/test/fixtures'
import { INITIAL_FILTER, mockApi } from './mockApi'

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

const TAGANROG = { ...INITIAL_FILTER, cities: ['Таганрог'] }

const activeTab = (page: Page) => page.locator('.rs-nav-item-active')
const navButton = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
// Кнопки боковой панели вложены в пункты меню с ролью button.
const sidebarButton = (page: Page, name: string) => page.locator('button', { hasText: name })
// Поле флажка RSuite скрыто, щёлкаем по подписи.
const toggleCheckbox = (page: Page, name: string) => page.getByText(name, { exact: true }).click()

// Вместо новой вкладки запоминаем адрес, переданный в window.open.
async function spyOnWindowOpen(page: Page) {
    await page.addInitScript(() => {
        window.open = (url?: string | URL) => {
            document.body.dataset.opened = String(url)
            return null
        }
    })
}

const openedUrl = (page: Page) => page.evaluate(() => document.body.dataset.opened)

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

    test('an invalid link keeps the page working, warns and sends the initial filter', async ({ page }) => {
        const api = await mockApi(page)
        for (const [search, parameter] of [['?filter=not-json', 'filter'], ['?tab=%22unknown%22', 'tab'], ['?v=1&year=2031', 'year']]) {
            await page.goto(`/${search}`)
            await expect(page.getByText(`«${parameter}»`)).toBeVisible()
            await expect(page.getByText('В выборке 100 человек')).toBeVisible()
        }
        for (const post of api.posts()) {
            expect(post.body).toBe(JSON.stringify(INITIAL_FILTER))
        }
    })

    test('Back and Forward restore the year and the page', async ({ page }) => {
        await mockApi(page)
        await page.goto('/')
        await navButton(page, '2021').click()
        await navButton(page, 'Состав выборки').click()
        await expect(activeTab(page)).toHaveText('Состав выборки')

        await page.goBack()
        await expect(activeTab(page)).toHaveText('2021')
        await page.goBack()
        await expect(activeTab(page)).toHaveText('2022')
        await page.goForward()
        await expect(activeTab(page)).toHaveText('2021')
    })

    test('clicking the active year does not add a history entry', async ({ page }) => {
        await mockApi(page)
        await page.goto('/')
        await expect(page.getByText('В выборке 100 человек')).toBeVisible()
        const historyLength = await page.evaluate(() => history.length)

        await navButton(page, '2022').click()

        expect(await page.evaluate(() => history.length)).toBe(historyLength)
    })

    test('resizing to mobile and back keeps the research state', async ({ page }) => {
        await mockApi(page)
        await page.goto('/')
        await sidebarButton(page, 'Топ Таганрога').click()
        await navButton(page, '2021').click()
        await toggleCheckbox(page, 'Отображать доверительный интервал')

        await page.setViewportSize({ width: 390, height: 900 })
        await expect(page.getByRole('heading', { name: MOBILE_TITLE })).toBeVisible()
        await expect(page.locator('.rs-picker-toggle-value')).toHaveText('Таганрог')
        await expect(page.getByText('Данные 2021 года')).toBeVisible()

        await page.setViewportSize({ width: 1440, height: 900 })
        await expect(activeTab(page)).toHaveText('2021')
        await expect(sidebarButton(page, 'Топ Таганрога')).toBeDisabled()
        await expect(page.getByRole('checkbox', { name: 'Отображать доверительный интервал' })).toBeChecked()
    })

    test('a preset is inactive for a link with the same values in another order', async ({ page }) => {
        await mockApi(page)
        const reordered = { ...TAGANROG, ages: [...TAGANROG.ages].reverse() }
        await page.goto(`/?v=1&filter=${encodeURIComponent(JSON.stringify(reordered))}`)

        await expect(sidebarButton(page, 'Топ Таганрога')).toBeDisabled()
        await expect(sidebarButton(page, 'Топ Ростова')).toBeEnabled()
    })

    test('«Дублировать» opens the address of the current state', async ({ page }) => {
        await spyOnWindowOpen(page)
        await mockApi(page)
        await page.goto('/')
        await navButton(page, '2020').click()
        await toggleCheckbox(page, 'Знаю и рекомендую')

        await sidebarButton(page, 'Дублировать').click()

        const search = await page.evaluate(() => location.search)
        expect(search).toContain('good=0')
        expect(await openedUrl(page)).toBe(search)
    })

    test('a too long address is neither written nor duplicated', async ({ page }) => {
        await spyOnWindowOpen(page)
        const cities = ['Ростов-на-Дону', ...Array.from({ length: 300 }, (_, i) => `Населённый пункт ${i}`)]
        await mockApi(page, { ...filterOptions, cities })
        await page.goto('/')
        await navButton(page, '2021').click()
        const search = await page.evaluate(() => location.search)

        await page.locator('.rs-sidebar .rs-picker-toggle').first().click()
        await toggleCheckbox(page, 'Выбрать все')
        await page.keyboard.press('Escape')

        await expect(page.getByText('Ссылка слишком длинная')).toBeVisible()
        expect(await page.evaluate(() => location.search)).toBe(search)
        await sidebarButton(page, 'Дублировать').click()
        expect(await openedUrl(page)).toBeUndefined()
    })
})

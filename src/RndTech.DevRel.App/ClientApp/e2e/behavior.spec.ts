import { expect, Locator, Page, test } from '@playwright/test'
import { filterOptions } from '../src/test/fixtures'
import { forCity, INITIAL_FILTER, isCompanies, isFilterOptions, isMeta, mockApi } from './mockApi'

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

const linkTo = (filter: object, extra = '') => `/?v=1&filter=${encodeURIComponent(JSON.stringify(filter))}${extra}`

// Заблокированные счётчики Метрики и VK пишут в консоль свои ошибки — их не учитываем.
const TRACKER_NOISE = /Failed to load resource|VK is not defined/

function collectErrors(page: Page) {
    const errors: string[] = []
    const collect = (text: string) => {
        if (!TRACKER_NOISE.test(text)) {
            errors.push(text)
        }
    }
    page.on('pageerror', error => collect(error.message))
    page.on('console', message => {
        if (message.type() === 'error') {
            collect(message.text())
        }
    })
    return errors
}

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

    test('resizing to mobile and back keeps the research state without new requests', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto('/')
        await sidebarButton(page, 'Топ Таганрога').click()
        await navButton(page, '2021').click()
        await toggleCheckbox(page, 'Отображать доверительный интервал')
        await page.waitForLoadState('networkidle')
        const loaded = api.calls.length

        await page.setViewportSize({ width: 390, height: 900 })
        await expect(page.getByRole('heading', { name: MOBILE_TITLE })).toBeVisible()
        await expect(page.locator('.rs-picker-toggle-value')).toHaveText('Таганрог')
        await expect(page.getByText('Данные 2021 года')).toBeVisible()

        await page.setViewportSize({ width: 1440, height: 900 })
        await expect(activeTab(page)).toHaveText('2021')
        await expect(sidebarButton(page, 'Топ Таганрога')).toBeDisabled()
        await expect(page.getByRole('checkbox', { name: 'Отображать доверительный интервал' })).toBeChecked()
        expect(api.calls).toHaveLength(loaded)
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

    // Счёт ведётся после начальной загрузки: в dev-сборке StrictMode повторяет эффекты при монтировании.
    test('the year, companies, chart flags, sorting and Back send no requests, a preset sends two', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto('/')
        await expect(page.getByText('В выборке 100 человек')).toBeVisible()
        await page.waitForLoadState('networkidle')
        const loaded = api.calls.length

        await navButton(page, '2021').click()
        await toggleCheckbox(page, 'Знаю и хочу работать')
        await table(page, 'Компания').getByRole('columnheader', { name: 'Знают' }).click()
        await page.locator('.rs-picker-toggle', { hasText: 'IBS Dunice' }).click()
        await toggleCheckbox(page, 'Выбрать все')
        await page.keyboard.press('Escape')
        await navButton(page, 'Состав выборки').click()
        await page.goBack()

        await expect(activeTab(page)).toHaveText('2021')
        expect(api.calls).toHaveLength(loaded)

        await sidebarButton(page, 'Топ Таганрога').click()
        await expect.poll(() => api.calls.length).toBe(loaded + 2)
        expect(api.calls.slice(loaded).map(call => call.method)).toEqual(['POST', 'POST'])
    })

    test('a late response for the previous group does not replace the current one', async ({ page }) => {
        const errors = collectErrors(page)
        const api = await mockApi(page)
        let release = () => {}
        api.override(forCity('Тбилиси'), new Promise<void>(resolve => { release = resolve }))
        await page.goto(linkTo({ ...INITIAL_FILTER, cities: ['Тбилиси'] }))
        await expect(page.getByText('Загрузка данных').first()).toBeVisible()

        await sidebarButton(page, 'Топ Ростова').click()
        await expect(firstColumn(table(page, 'Компания'))).toHaveCount(6)
        release()
        await Promise.all(api.posts(forCity('Тбилиси')).map(call => call.done))
        await page.waitForLoadState('networkidle')

        await expect(firstColumn(table(page, 'Компания'))).toHaveCount(6)
        expect(errors).toEqual([])
    })

    test('a failed sample request shows an error and recovers on retry, companies keep working', async ({ page }) => {
        const api = await mockApi(page)
        const restore = api.override(isMeta, 500)
        await page.goto('/')
        await expect(firstColumn(table(page, 'Компания'))).toHaveCount(6)
        await navButton(page, 'Состав выборки').click()

        await expect(page.getByText('Не удалось загрузить данные')).toBeVisible()
        restore()
        await page.getByRole('button', { name: 'Повторить' }).click()
        await expect(page.getByRole('columnheader', { name: 'Язык программирования' })).toBeVisible()
    })

    test('a network error of the company request recovers on retry', async ({ page }) => {
        const api = await mockApi(page)
        const restore = api.override(isCompanies, 'abort')
        await page.goto('/')

        await expect(page.getByText('Не удалось загрузить данные')).toBeVisible()
        restore()
        await page.getByRole('button', { name: 'Повторить' }).click()
        await expect(firstColumn(table(page, 'Компания'))).toHaveCount(6)
    })

    test('returning to a group with a failed request shows loading, not the old error', async ({ page }) => {
        const api = await mockApi(page)
        const restore = api.override(isCompanies, 500)
        await page.goto('/')
        await expect(page.getByText('Не удалось загрузить данные')).toBeVisible()
        restore()
        let release = () => {}
        api.override(isCompanies, new Promise<void>(resolve => { release = resolve }))

        await sidebarButton(page, 'Топ Таганрога').click()
        await sidebarButton(page, 'Топ Ростова').click()

        await expect(page.getByText('Загрузка данных')).toBeVisible()
        await expect(page.getByText('Не удалось загрузить данные')).toHaveCount(0)
        release()
        await expect(firstColumn(table(page, 'Компания'))).toHaveCount(6)
    })

    test('a dictionary error stays in the filter panel', async ({ page }) => {
        const api = await mockApi(page)
        const restore = api.override(isFilterOptions, 500)
        await page.goto('/')

        await expect(page.locator('.rs-sidebar').getByText('Не удалось загрузить данные')).toBeVisible()
        await expect(firstColumn(table(page, 'Компания'))).toHaveCount(6)
        restore()
        await page.locator('.rs-sidebar').getByRole('button', { name: 'Повторить' }).click()
        await expect(page.locator('.rs-sidebar .rs-picker-toggle', { hasText: 'Ростов-на-Дону' })).toBeVisible()
    })

    test('a group without respondents shows messages instead of tables', async ({ page }) => {
        await mockApi(page)
        await page.goto(linkTo({ ...INITIAL_FILTER, cities: ['Нет-такого'] }))

        await expect(page.getByText('Нет данных о компаниях за 2022 год')).toBeVisible()
        await navButton(page, 'Состав выборки').click()
        await expect(page.getByText('В выбранной группе нет респондентов')).toBeVisible()
    })

    test('the group size is the number of respondents of the selected year', async ({ page }) => {
        await mockApi(page)
        await page.goto('/')
        await navButton(page, '2021').click()

        await expect(page.getByText('В выборке 60 человек')).toBeVisible()
    })

    test('an undefined brand rating is shown as a dash and sorted last', async ({ page }) => {
        await mockApi(page)
        await page.goto('/')
        const companies = table(page, 'Компания')

        await companies.getByRole('columnheader', { name: 'Рейтинг бренда' }).click()

        await expect(firstColumn(companies)).toHaveText(
            ['Контур', 'Gamma%', 'IBS Dunice', 'ИТРУМ (ex Exceed Team)', 'Тинькофф', 'Почтатех'])
        await expect(companies.locator('.rs-table-body-row-wrapper .rs-table-cell-last'))
            .toHaveText(['66.7', '66.7', '60', '33.3', '—', '—'])
    })

    test('a year without respondents shows a dash instead of a share', async ({ page }) => {
        await mockApi(page)
        await page.goto(linkTo({ ...INITIAL_FILTER, cities: ['Тбилиси'] }, '&page=sample'))

        await expect(page.locator('.rs-table-row', { hasText: 'Тбилиси' }).locator('.rs-table-cell'))
            .toHaveText(['Тбилиси', '0 (—)', '0 (—)', '0 (—)', '1 (100%)'])
    })
})

test('mobile shows the number of respondents of the selected year', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 })
    await mockApi(page)
    await page.goto('/?v=1&year=2021')

    await expect(page.getByText('Данные 2021 года')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('60')
})

test('mobile shows the bar values when the sample arrives after the companies', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 })
    const api = await mockApi(page)
    let release = () => {}
    api.override(isMeta, new Promise<void>(resolve => { release = resolve }))
    await page.goto('/')
    await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(12)

    release()

    await expect(page.locator('.recharts-label-list')).toHaveCount(2)
})

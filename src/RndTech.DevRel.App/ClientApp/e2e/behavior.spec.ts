import { expect, Locator, Page, test } from '@playwright/test'
import { LEGACY_COMPANIES } from '../src/app/surveyState'
import { NO_RESTRICTIONS } from '../src/features/filters/model'
import { companyResults, filterOptions } from '../src/test/fixtures'
import { forCity, INITIAL_FILTER, isCompanies, isFilterOptions, isMeta, mockApi } from './mockApi'

// Исправленное поведение (разрешённые изменения issue #19).

function table(page: Page, header: string) {
    return page.getByRole('table').filter({ has: page.getByRole('columnheader', { name: header }) })
}

function firstColumn(tableLocator: Locator) {
    return tableLocator.locator('tbody td:first-child')
}

// Сортировка применяется сразу; в исходной версии — через 500 ms.
const WITHOUT_DELAY = { timeout: 300 }

const TAGANROG = { ...INITIAL_FILTER, cities: ['Таганрог'] }

const currentSection = (page: Page) => page.getByRole('navigation', { name: 'Разделы' }).locator('[aria-current="page"]')
const navButton = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
const yearRadio = (page: Page, year: string) =>
    page.getByRole('radiogroup', { name: 'Год исследования' }).getByRole('radio', { name: year })
// Поле radio скрыто библиотекой, щёлкаем по подписи года.
const selectYear = (page: Page, year: string) =>
    page.getByRole('radiogroup', { name: 'Год исследования' }).getByText(year, { exact: true }).click()
const selectMetric = (page: Page, name: string) =>
    page.getByRole('radiogroup', { name: 'Показатель' }).getByText(name, { exact: true }).click()
const selectView = (page: Page, name: string) =>
    page.getByRole('radiogroup', { name: 'Вид', exact: true }).getByText(name, { exact: true }).click()
const filterPanel = (page: Page) => page.getByRole('complementary', { name: '', exact: true })
const sidebarButton = (page: Page, name: string) => filterPanel(page).getByRole('button', { name, exact: true })
// Поле флажка RSuite скрыто, щёлкаем по подписи.
const toggleCheckbox = (page: Page, name: string) => page.getByText(name, { exact: true }).click()

async function selectPopularCompanies(page: Page) {
    await page.getByRole('combobox', { name: 'Компании', exact: true }).click()
    await page.getByRole('option', { name: 'Популярные', exact: true }).click()
    await page.keyboard.press('Escape')
}

const clearCompanyFilter = (page: Page) =>
    page.getByRole('combobox', { name: 'Компании', exact: true }).locator('..').getByRole('button', { name: 'Очистить' }).click()

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

// Заблокированный счётчик Метрики пишет в консоль свою ошибку — её не учитываем.
const TRACKER_NOISE = /Failed to load resource/

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

for (const width of [768, 1223]) {
    test(`width ${width} shows the full interface with a filter drawer`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await mockApi(page)
        await page.goto('/')

        await expect(page.getByRole('button', { name: 'Фильтры · 2' })).toBeVisible()
        await expect(page.getByRole('radiogroup', { name: 'Год исследования' })).toHaveCount(1)
    })
}

for (const width of [1224, 1225, 1440]) {
    test(`width ${width} shows one interface with a filter sidebar`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await mockApi(page)
        await page.goto('/')

        await expect(page.getByText('Выборка: 100 из 600')).toBeVisible()
        await expect(filterPanel(page)).toHaveCount(1)
        await expect(page.getByRole('button', { name: /^Фильтры ·/ })).toHaveCount(0)
        await expect(page.locator('.recharts-wrapper')).toHaveCount(1)
    })
}

test.describe('desktop 1440', () => {
    test.use({ viewport: { width: 1440, height: 900 } })

    test('sorts company names descending, then ascending', async ({ page }) => {
        await mockApi(page)
        await page.goto('/?v=1&companies=[]&view=table')
        const companies = table(page, 'Компания')

        await companies.getByRole('button', { name: 'Компания' }).click()
        await expect(firstColumn(companies)).toHaveText(
            ['Тинькофф', 'Почтатех', 'Контур', 'ИТРУМ (ex Exceed Team)', 'IBS Dunice', 'Gamma%'], WITHOUT_DELAY)

        await expect(companies.getByRole('columnheader', { name: 'Компания' })).toHaveAttribute('aria-sort', 'descending')
        await companies.getByRole('button', { name: 'Компания' }).click()
        await expect(firstColumn(companies)).toHaveText(
            ['Gamma%', 'IBS Dunice', 'ИТРУМ (ex Exceed Team)', 'Контур', 'Почтатех', 'Тинькофф'])
    })

    test('sorts sample categories by name descending', async ({ page }) => {
        await mockApi(page)
        await page.goto('/')
        await page.getByRole('button', { name: 'Состав выборки' }).click()
        const languages = table(page, 'Язык программирования')

        await languages.getByRole('button', { name: 'Язык программирования' }).click()
        await expect(firstColumn(languages)).toHaveText(['TypeScript', 'JavaScript', 'C#'], WITHOUT_DELAY)
    })

    test('an invalid link keeps the page working, warns and sends the initial filter', async ({ page }) => {
        const api = await mockApi(page)
        for (const [search, parameter] of [['?filter=not-json', 'filter'], ['?tab=%22unknown%22', 'tab'], ['?v=1&year=2031', 'year'], ['?v=1&view=other', 'view']]) {
            await page.goto(`/${search}`)
            await expect(page.getByText(`«${parameter}»`)).toBeVisible()
            await expect(page.getByText('Выборка: 100 из 600')).toBeVisible()
        }
        for (const post of api.posts()) {
            expect(post.body).toBe(JSON.stringify(INITIAL_FILTER))
        }
    })

    test('Back and Forward restore the year and the page', async ({ page }) => {
        await mockApi(page)
        await page.goto('/')
        await selectYear(page, '2021')
        await navButton(page, 'Состав выборки').click()
        await expect(currentSection(page)).toHaveText('Состав выборки')
        await expect(yearRadio(page, '2021')).toBeChecked()

        await page.goBack()
        await expect(currentSection(page)).toHaveText('Компании')
        await expect(yearRadio(page, '2021')).toBeChecked()
        await page.goBack()
        await expect(yearRadio(page, '2022')).toBeChecked()
        await page.goForward()
        await expect(yearRadio(page, '2021')).toBeChecked()
    })

    test('«Подробнее» opens its section of «О данных», Back returns, the page opens by its link', async ({ page }) => {
        await mockApi(page)
        await page.goto('/')
        await selectYear(page, '2021')

        await page.getByText('индексы, а не проценты людей').getByRole('button', { name: 'Подробнее' }).click()
        await expect(currentSection(page)).toHaveText('О данных')
        await expect(page.getByRole('heading', { name: 'Индексы бренда' })).toBeFocused()
        await expect(page.getByRole('heading', { name: 'Индексы бренда' })).toBeInViewport()
        await expect(page.getByRole('radiogroup', { name: 'Год исследования' })).toHaveCount(0)
        await expect(filterPanel(page)).toHaveCount(0)

        await page.goBack()
        await expect(currentSection(page)).toHaveText('Компании')
        await expect(yearRadio(page, '2021')).toBeChecked()

        await page.goto('/?v=1&page=methodology')
        await expect(page.getByRole('heading', { name: 'О данных', level: 1 })).toBeVisible()
        await expect(page.getByText('не распознан')).toHaveCount(0)
    })

    test('clicking the active year does not add a history entry', async ({ page }) => {
        await mockApi(page)
        await page.goto('/')
        await expect(page.getByText('Выборка: 100 из 600')).toBeVisible()
        const historyLength = await page.evaluate(() => history.length)

        await selectYear(page, '2022')

        expect(await page.evaluate(() => history.length)).toBe(historyLength)
    })

    test('resizing to mobile and back keeps the research state without new requests', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto('/')
        await sidebarButton(page, 'Таганрог, 20–44 года').click()
        await selectYear(page, '2021')
        await selectMetric(page, 'Рекомендуют')
        await selectView(page, 'Таблица')
        await page.waitForLoadState('networkidle')
        const loaded = api.calls.length

        await page.setViewportSize({ width: 390, height: 900 })
        await expect(yearRadio(page, '2021')).toBeChecked()
        await expect(page.getByText('2021 · Таганрог, 20–44 года · Выборка: 60 из 500')).toBeVisible()

        await page.setViewportSize({ width: 1440, height: 900 })
        await expect(yearRadio(page, '2021')).toBeChecked()
        await expect(sidebarButton(page, 'Таганрог, 20–44 года')).toBeDisabled()
        await expect(page.getByRole('radiogroup', { name: 'Показатель' }).getByRole('radio', { name: 'Рекомендуют', exact: true })).toBeChecked()
        await expect(page.getByRole('radiogroup', { name: 'Вид', exact: true }).getByRole('radio', { name: 'Таблица' })).toBeChecked()
        expect(api.calls).toHaveLength(loaded)
    })

    // RSuite 6 переводит фокус на пункт открытого списка; после Escape или Tab он должен вернуться в поля.
    test('Escape and Tab from an opened list keep the keyboard focus on the filter fields', async ({ page }) => {
        await mockApi(page)
        await page.goto('/')
        await expect(page.getByText('Выборка: 100 из 600')).toBeVisible()
        const [city, ages] = [0, 1].map(i => filterPanel(page).getByRole('combobox').nth(i))

        await city.focus()
        await page.keyboard.press('Enter')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Escape')
        await expect(city).toBeFocused()

        await page.keyboard.press('Enter')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Tab')
        await expect(ages).toBeFocused()
    })

    test('a preset is inactive for a link with the same values in another order', async ({ page }) => {
        await mockApi(page)
        const reordered = { ...TAGANROG, ages: [...TAGANROG.ages].reverse() }
        await page.goto(`/?v=1&filter=${encodeURIComponent(JSON.stringify(reordered))}`)

        await expect(sidebarButton(page, 'Таганрог, 20–44 года')).toBeDisabled()
        await expect(sidebarButton(page, 'Ростов-на-Дону, 20-44 года')).toBeEnabled()
    })

    test('restriction buttons clear one dimension or all, quick groups keep their composition', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto('/')
        await expect(sidebarButton(page, 'Ростов-на-Дону, 20-44 года')).toBeDisabled()
        await page.waitForLoadState('networkidle')
        let posts = api.posts().length
        const cityChip = page.getByRole('button', { name: /^Убрать ограничение «Город»/ })
        await yearRadio(page, '2022').focus()
        for (let i = 0; i < 30 && !await cityChip.evaluate(el => el === document.activeElement); i++) {
            await page.keyboard.press('Tab')
        }
        await expect(cityChip).toBeFocused()
        await page.keyboard.press('Enter')
        await expect(cityChip).toHaveCount(0)
        await expect.poll(() => api.posts().length).toBe(posts + 2)
        expect(JSON.parse(api.posts().at(-1)!.body!)).toEqual({ ...INITIAL_FILTER, cities: [] })
        posts = api.posts().length
        await page.getByRole('button', { name: 'Сбросить ограничения' }).click()
        await expect.poll(() => api.posts().length).toBe(posts + 2)
        expect(JSON.parse(api.posts().at(-1)!.body!)).toEqual(NO_RESTRICTIONS)
        await expect(page.getByRole('group', { name: 'Активные ограничения' })).toHaveCount(0)
        await expect(sidebarButton(page, 'Все участники')).toBeDisabled()
        await expect(page.getByText('2022 · Все участники · Выборка: 100 из 600')).toBeVisible()

        const taganrog = sidebarButton(page, 'Таганрог, 20–44 года')
        await taganrog.focus()
        await page.keyboard.press('Tab')
        const qa = sidebarButton(page, 'QA: все города и возрасты')
        await expect(qa).toBeFocused()
        await page.keyboard.press('Enter')
        await expect(qa).toBeDisabled()
        await expect.poll(() => api.posts().length).toBe(posts + 4)
        expect(JSON.parse(api.posts().at(-1)!.body!)).toEqual({ ...NO_RESTRICTIONS, professions: ['QA'] })
        await sidebarButton(page, 'Ростов-на-Дону, 20-44 года').click()
        await expect.poll(() => api.posts().length).toBe(posts + 6)
        expect(JSON.parse(api.posts().at(-1)!.body!)).toEqual(INITIAL_FILTER)
    })

    test('Enter in search keeps the initial city, arrows and Enter select a visible match', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto('/')
        await expect(page.getByText('Выборка: 100 из 600')).toBeVisible()
        const city = filterPanel(page).getByRole('combobox', { name: 'Город', exact: true })
        await city.click()
        const search = page.getByRole('textbox', { name: 'Поиск' })
        await search.pressSequentially('таг')
        await expect(search).toBeFocused()
        await expect(page.getByRole('option')).toHaveText(['Выбрать все', 'Таганрог'])
        const posts = api.posts().length

        await search.press('Enter')
        await page.waitForLoadState('networkidle')
        expect(JSON.parse(api.posts().at(-1)!.body!)).toEqual(INITIAL_FILTER)
        expect(api.posts()).toHaveLength(posts)

        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        await expect.poll(() => api.posts().length).toBe(posts + 2)
        expect(JSON.parse(api.posts().at(-1)!.body!)).toEqual({
            ...INITIAL_FILTER, cities: ['Ростов-на-Дону', 'Таганрог']
        })
        await page.keyboard.press('Escape')
        await expect(city).toBeFocused()
    })

    test('the first list item selects all with Enter, another Enter clears, Cyrillic search keeps old values', async ({ page }) => {
        const api = await mockApi(page)
        const archived = 'Город "А", __all__, -1'
        await page.goto(linkTo({ ...INITIAL_FILTER, cities: [archived] }))
        const city = filterPanel(page).getByRole('combobox', { name: 'Город', exact: true })
        await city.focus()
        await page.keyboard.press('Enter')
        await expect(page.getByRole('textbox', { name: 'Поиск' })).toBeFocused()
        await expect(city).toBeInViewport()
        await expect(page.getByRole('textbox', { name: 'Поиск' })).toBeInViewport()
        await expect(page.getByRole('option').first()).toHaveText('Выбрать все')
        await expect(page.getByRole('checkbox', { name: 'Выбрать все' })).not.toBeChecked()
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        await expect(page.getByRole('checkbox', { name: 'Выбрать все' })).toBeChecked()
        await expect.poll(() => api.posts().length).toBe(4)
        expect(JSON.parse(api.posts().at(-1)!.body!).cities).toEqual([...filterOptions.cities, archived])
        await page.keyboard.press('Enter')
        await expect(page.getByRole('checkbox', { name: 'Выбрать все' })).not.toBeChecked()
        await expect.poll(() => api.posts().length).toBe(6)
        expect(JSON.parse(api.posts().at(-1)!.body!).cities).toEqual([])
        await page.keyboard.press('Escape')
        await expect(city).toBeFocused()

        await page.goto(linkTo({ ...INITIAL_FILTER, cities: [archived] }))
        await city.click()
        await page.getByRole('textbox', { name: 'Поиск' }).pressSequentially('таг')
        await page.keyboard.press('Backspace')
        await expect(page.getByRole('textbox', { name: 'Поиск' })).toHaveValue('та')
        await expect(page.getByRole('option')).toHaveText(['Выбрать все', 'Таганрог'])
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        await page.keyboard.press('Escape')
        await expect(city).toContainText(archived)
        await expect(city).toContainText('Таганрог')
        const cities = JSON.parse(new URL(page.url()).searchParams.get('filter')!).cities
        expect(cities).toEqual([archived, 'Таганрог'])
        await city.click()
        await expect(page.getByRole('textbox', { name: 'Поиск' })).toHaveValue('')
    })

    test('«Дублировать» opens the address of the current state', async ({ page }) => {
        await spyOnWindowOpen(page)
        await mockApi(page)
        await page.goto('/')
        await selectYear(page, '2020')
        await selectMetric(page, 'Хотят работать')
        await selectView(page, 'Таблица')

        await page.getByRole('button', { name: 'Дублировать' }).click()

        const search = await page.evaluate(() => location.search)
        expect(search).toContain('good=0')
        expect(search).toContain('view=table')
        expect(search).not.toContain('error=')
        expect(await openedUrl(page)).toBe(search)
    })

    test('metric, view and legacy flags survive year changes, reload and history without requests', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto('/?v=1&companies=%5B%22IBS%20Dunice%22%5D')
        const metric = page.getByRole('radiogroup', { name: 'Показатель' })
        const chart = page.getByRole('img', { name: /^Карта компаний/ })
        const ticks = page.locator('.recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value')
        const tickLines = page.locator('.recharts-yAxis-tick-lines .recharts-cartesian-axis-tick-line')
        await expect(chart).toHaveAttribute('aria-label', /2022 год.*Рекомендуют \+ хотят работать.*Компаний: 1.*Таблица/)
        await expect(ticks.last()).toHaveText('140 %')
        await expect(page.getByRole('table')).toHaveCount(0)
        const posts = api.posts().length
        for (const [label, maximum, share] of [['Рекомендуют', '70 %', 0.1], ['Хотят работать', '70 %', 0.05], ['Рекомендуют + хотят работать', '140 %', 0.15]] as const) {
            await selectMetric(page, label)
            await expect(ticks.last()).toHaveText(maximum)
            const zeroY = Number(await tickLines.first().getAttribute('y1'))
            const topY = Number(await tickLines.last().getAttribute('y1'))
            const pointY = Number(await page.locator('[data-company="IBS Dunice"] circle').last().getAttribute('cy'))
            expect(pointY).toBeCloseTo(zeroY + (topY - zeroY) * share / (parseInt(maximum) / 100), 6)
            await expect(chart).toHaveAttribute('aria-label', new RegExp(label.replace('+', '\\+')))
        }
        await selectMetric(page, 'Рекомендуют')
        await selectYear(page, '2019')
        await expect(metric.getByRole('radio')).toHaveCount(1)
        await expect(metric.getByRole('radio', { name: 'Хотят работать' })).toBeChecked()
        await expect(ticks.last()).toHaveText('25 %')
        await expect(page.getByText('В 2019 году ось показывает только «Хотят работать».')).toBeVisible()
        expect(new URL(page.url()).searchParams.get('wanted')).toBe('0')
        await selectYear(page, '2022')
        await expect(metric.getByRole('radio', { name: 'Рекомендуют', exact: true })).toBeChecked()
        await selectView(page, 'Таблица')
        await expect(chart).toHaveCount(0)
        await expect(table(page, 'Компания').getByRole('columnheader')).toHaveCount(7)
        await page.goBack()
        await expect(yearRadio(page, '2019')).toBeChecked()
        await expect(chart).toBeVisible()
        await page.goForward()
        await expect(table(page, 'Компания')).toBeVisible()
        expect(api.posts()).toHaveLength(posts)
        await page.reload()
        await expect(table(page, 'Компания')).toBeVisible()
        await expect(metric.getByRole('radio', { name: 'Рекомендуют', exact: true })).toBeChecked()
    })

    test('obsolete interval links stay quiet; selecting a metric recovers the map', async ({ page }) => {
        await mockApi(page)
        await page.goto('/?v=1&error=1&good=0&wanted=0')
        await expect(page.getByText('Отображение «доверительного интервала» убрано:')).toHaveCount(0)
        await expect(page.getByText('Показатель не выбран.')).toBeVisible()
        await expect(page.locator('.recharts-wrapper')).toHaveCount(0)
        await selectYear(page, '2019')
        await expect(page.getByText('Показатель не выбран.')).toBeVisible()
        await page.goBack()
        await expect(page.getByText('Отображение «доверительного интервала» убрано:')).toHaveCount(0)
        const metric = page.getByRole('radiogroup', { name: 'Показатель' })
        await metric.getByRole('radio', { name: 'Рекомендуют', exact: true }).focus()
        await page.keyboard.press('Space')
        await expect(page.locator('[data-company] circle[r="4"]')).toHaveCount(5)
        await expect(page.getByText('Показатель не выбран.')).toHaveCount(0)
        expect(new URL(page.url()).searchParams.has('error')).toBe(false)
        await selectYear(page, '2021')
        await page.goBack()
        await expect(metric.getByRole('radio', { name: 'Рекомендуют', exact: true })).toBeChecked()
    })

    test('a too long address is neither written nor duplicated', async ({ page }) => {
        await spyOnWindowOpen(page)
        const cities = ['Ростов-на-Дону', ...Array.from({ length: 300 }, (_, i) => `Населённый пункт ${i}`)]
        await mockApi(page, { ...filterOptions, cities })
        await page.goto('/')
        await selectYear(page, '2021')
        const search = await page.evaluate(() => location.search)

        await filterPanel(page).locator('.rs-picker-toggle').first().click()
        await toggleCheckbox(page, 'Выбрать все')
        await page.keyboard.press('Escape')

        await expect(page.getByText('Ссылка слишком длинная')).toBeVisible()
        expect(await page.evaluate(() => location.search)).toBe(search)
        await page.getByRole('button', { name: 'Дублировать' }).click()
        expect(await openedUrl(page)).toBeUndefined()
    })

    // Счёт ведётся после начальной загрузки: в dev-сборке StrictMode повторяет эффекты при монтировании.
    test('the year, companies, metric, view, sorting and Back send no requests, a preset sends two', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto('/')
        await expect(page.getByText('Выборка: 100 из 600')).toBeVisible()
        await page.waitForLoadState('networkidle')
        const loaded = api.calls.length

        await selectYear(page, '2021')
        await selectMetric(page, 'Рекомендуют')
        await selectView(page, 'Таблица')
        await table(page, 'Компания').getByRole('button', { name: 'Знают' }).click()
        await page.getByRole('combobox', { name: 'Компании', exact: true }).click()
        await toggleCheckbox(page, 'Выбрать все')
        await page.keyboard.press('Escape')
        await navButton(page, 'Состав выборки').click()
        await page.goBack()

        await expect(yearRadio(page, '2021')).toBeChecked()
        expect(api.calls).toHaveLength(loaded)

        await sidebarButton(page, 'Таганрог, 20–44 года').click()
        await expect.poll(() => api.calls.length).toBe(loaded + 2)
        expect(api.calls.slice(loaded).map(call => call.method)).toEqual(['POST', 'POST'])
    })

    test('a late response for the previous group does not replace the current one', async ({ page }) => {
        const errors = collectErrors(page)
        const api = await mockApi(page)
        let release = () => {}
        api.override(forCity('Тбилиси'), new Promise<void>(resolve => { release = resolve }))
        await page.goto(linkTo({ ...INITIAL_FILTER, cities: ['Тбилиси'] }, '&view=table&companies=[]'))
        await expect(page.getByText('Загрузка данных').first()).toBeVisible()

        await sidebarButton(page, 'Ростов-на-Дону, 20-44 года').click()
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
        await page.goto('/?v=1&companies=[]&view=table')
        await expect(firstColumn(table(page, 'Компания'))).toHaveCount(6)
        await expect(page.getByText('Выборка: не удалось загрузить')).toBeVisible()
        await navButton(page, 'Состав выборки').click()

        await expect(page.getByText('Не удалось загрузить данные')).toBeVisible()
        restore()
        await page.getByRole('main').getByRole('button', { name: 'Повторить' }).click()
        await expect(page.getByRole('columnheader', { name: 'Язык программирования' })).toBeVisible()
        await expect(page.getByText('Выборка: 100 из 600')).toBeVisible()
    })

    test('a network error of the company request recovers on retry', async ({ page }) => {
        const api = await mockApi(page)
        const restore = api.override(isCompanies, 'abort')
        await page.goto('/?v=1&companies=[]&view=table')

        await expect(page.getByText('Не удалось загрузить данные')).toBeVisible()
        restore()
        await page.getByRole('button', { name: 'Повторить' }).click()
        await expect(firstColumn(table(page, 'Компания'))).toHaveCount(6)
    })

    test('returning to a group with a failed request shows loading, not the old error', async ({ page }) => {
        const api = await mockApi(page)
        const restore = api.override(isCompanies, 500)
        await page.goto('/?v=1&companies=[]&view=table')
        await expect(page.getByText('Не удалось загрузить данные')).toBeVisible()
        restore()
        let release = () => {}
        api.override(isCompanies, new Promise<void>(resolve => { release = resolve }))

        await sidebarButton(page, 'Таганрог, 20–44 года').click()
        await sidebarButton(page, 'Ростов-на-Дону, 20-44 года').click()

        await expect(page.getByText('Загрузка данных')).toBeVisible()
        await expect(page.getByText('Не удалось загрузить данные')).toHaveCount(0)
        release()
        await expect(firstColumn(table(page, 'Компания'))).toHaveCount(6)
    })

    test('a dictionary error stays in the filter panel', async ({ page }) => {
        const api = await mockApi(page)
        const restore = api.override(isFilterOptions, 500)
        await page.goto('/?v=1&companies=[]&view=table')

        await expect(filterPanel(page).getByText('Не удалось загрузить данные')).toBeVisible()
        await expect(firstColumn(table(page, 'Компания'))).toHaveCount(6)
        restore()
        await filterPanel(page).getByRole('button', { name: 'Повторить' }).click()
        await expect(filterPanel(page).locator('.rs-picker-toggle', { hasText: 'Ростов-на-Дону' })).toBeVisible()
    })

    test('empty companies and sample offer all participants', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto(linkTo({ ...INITIAL_FILTER, cities: ['Нет-такого'] }))

        await expect(page.getByText('Нет данных о компаниях за 2022 год')).toBeVisible()
        await navButton(page, 'Состав выборки').click()
        await expect(page.getByText('В выбранной группе нет респондентов за 2022 год.')).toBeVisible()
        for (const section of ['sample', 'companies']) {
            await page.goto(linkTo({ ...INITIAL_FILTER, cities: ['Нет-такого'] }, `&page=${section}`))
            await page.getByRole('main').getByRole('button', { name: 'Все участники', exact: true }).click()
            await expect(page.getByText('Выборка: 100 из 600')).toBeVisible()
            expect(JSON.parse(api.posts().at(-1)!.body!)).toEqual(NO_RESTRICTIONS)
        }
    })

    test('the group size is the number of respondents of the selected year', async ({ page }) => {
        await mockApi(page)
        await page.goto('/')
        await selectYear(page, '2021')

        await expect(page.getByText('2021 · Ростов-на-Дону, 20–44 года · Выборка: 60 из 500')).toBeVisible()
    })

    test('company sorting uses raw ratings, then names, with undefined values last', async ({ page }) => {
        await mockApi(page)
        await page.route('**/api/results/known-and-wanted', route => route.fulfill({ json: [
            ...companyResults,
            { ...companyResults[1], name: 'Z rounded', selectionCount: 1000,
                knownVotes: 837, goodVotes: 168, wantedVotes: 167,
                knownLevel: 0.837, goodLevel: 0.168, wantedLevel: 0.167 }
        ] }))
        await page.goto('/?v=1&companies=[]&view=table')
        const companies = table(page, 'Компания')
        await expect(firstColumn(companies)).toHaveText([
            'IBS Dunice', 'Контур', 'Тинькофф', 'ИТРУМ (ex Exceed Team)', 'Почтатех', 'Gamma%', 'Z rounded'
        ])

        for (const compare of [false, true]) {
            if (compare) {
                await page.getByRole('combobox', { name: 'Сравнить с' }).click()
                await page.getByRole('option', { name: '2021', exact: true }).click()
            }
            const missing = [...(compare ? ['Zero Corp'] : []), 'Почтатех', 'Тинькофф']
            for (const direction of ['descending', 'ascending']) {
                await companies.getByRole('button', { name: 'Рейтинг бренда' }).press('Enter')
                await expect(companies.getByRole('columnheader', { name: 'Рейтинг бренда' }))
                    .toHaveAttribute('aria-sort', direction)
                await expect(firstColumn(companies)).toHaveText(direction === 'descending'
                    ? ['Z rounded', 'Gamma%', 'Контур', 'IBS Dunice', 'ИТРУМ (ex Exceed Team)', ...missing]
                    : ['ИТРУМ (ex Exceed Team)', 'IBS Dunice', 'Gamma%', 'Контур', 'Z rounded', ...missing])
                if (!compare) await expect(companies.locator('tbody td:last-child')).toHaveText(direction === 'descending'
                    ? ['66.7', '66.7', '66.7', '60', '33.3', '—', '—']
                    : ['33.3', '60', '66.7', '66.7', '66.7', '—', '—'])
            }
        }
    })

    test('the sample composition of a year without respondents is a message, not zero shares', async ({ page }) => {
        await mockApi(page)
        await page.goto(linkTo({ ...INITIAL_FILTER, cities: ['Тбилиси'] }, '&page=sample'))

        await expect(page.locator('tbody tr', { hasText: 'Тбилиси' }).locator('td'))
            .toHaveText(['Тбилиси', '1 (100%)'])
        await selectYear(page, '2021')
        await expect(page.getByText('В выбранной группе нет респондентов за 2021 год.')).toBeVisible()
        await expect(page.getByText('Выборка: 0 из 500')).toBeVisible()
        await expect(page.locator('td [aria-hidden="true"]')).toHaveCount(0)
    })
})

test('mobile keeps the selected year and renders a late sample independently of companies', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 })
    const api = await mockApi(page)
    let release = () => {}
    api.override(isMeta, new Promise<void>(resolve => { release = resolve }))
    await page.goto('/?v=1&companies=[]&year=2021&view=table')
    await expect(yearRadio(page, '2021')).toBeChecked()
    await expect(firstColumn(table(page, 'Компания'))).toHaveCount(3)
    await expect(page.getByText('Выборка: …')).toBeVisible()
    release()
    await expect(page.getByText('Выборка: 60 из 500')).toBeVisible()
    await navButton(page, 'Состав выборки').click()
    await expect(table(page, 'Язык программирования').getByText('40 (66.7%)')).toBeVisible()
})

test.describe('filter draft', () => {
    test.use({ viewport: { width: 390, height: 900 } })

    test('cancel, close and Escape discard changes, unchanged apply sends nothing, two edits apply once', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto('/')
        await expect(page.getByText('Выборка: 100 из 600')).toBeVisible()
        const trigger = page.getByRole('button', { name: 'Фильтры · 2' })
        const drawer = page.getByRole('dialog', { name: 'Фильтры', exact: true })
        const posts = api.posts().length
        for (const action of ['Отмена', 'Закрыть', 'Escape', 'Показать результаты']) {
            await trigger.click()
            await expect(drawer).toBeVisible()
            if (action !== 'Показать результаты') await drawer.getByRole('button', { name: 'Все участники', exact: true }).click()
            if (action === 'Escape') await page.keyboard.press('Escape')
            else await drawer.getByRole('button', { name: action, exact: true }).click()
            await expect(drawer).toHaveCount(0)
            await expect(trigger).toBeFocused()
            expect(api.posts()).toHaveLength(posts)
        }
        await trigger.click()
        await drawer.getByRole('button', { name: 'Таганрог, 20–44 года' }).click()
        const community = drawer.getByRole('combobox', { name: 'Митапы или сообщество' })
        await community.click()
        await page.getByRole('option', { name: 'Да', exact: true }).click()
        expect(api.posts()).toHaveLength(posts)
        await drawer.getByRole('button', { name: 'Показать результаты' }).click()
        await expect(drawer).toHaveCount(0)
        await expect.poll(() => api.posts().length).toBe(posts + 2)
        expect(JSON.parse(api.posts().at(-1)!.body!)).toEqual({ ...TAGANROG, isCommunity: 'Да' })
        await expect(page.getByRole('button', { name: 'Фильтры · 3' })).toBeFocused()
    })

    test('community picker supports keyboard selection inside the mobile filter draft', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto('/')
        await expect(page.getByText('Выборка: 100 из 600')).toBeVisible()
        const posts = api.posts().length
        await page.getByRole('button', { name: 'Фильтры · 2' }).click()
        const drawer = page.getByRole('dialog', { name: 'Фильтры', exact: true })
        const community = drawer.getByRole('combobox', { name: 'Митапы или сообщество' })
        await community.click({ trial: true })
        await community.focus()
        await page.keyboard.press('Enter')
        await expect(page.getByRole('option', { name: 'Да', exact: true })).toBeInViewport()
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        await expect(page.getByRole('listbox')).toHaveCount(0)
        await expect(community).toHaveText('Да')
        await expect(community).toBeFocused()
        await page.keyboard.press('Enter')
        await page.keyboard.press('Escape')
        await expect(page.getByRole('listbox')).toHaveCount(0)
        await expect(community).toBeFocused()
        await expect(community).toHaveText('Да')
        expect(api.posts()).toHaveLength(posts)
        await page.keyboard.press('Escape')
        await expect(drawer).toHaveCount(0)
        await expect(page.getByRole('button', { name: 'Фильтры · 2' })).toBeFocused()
        expect(api.posts()).toHaveLength(posts)
    })

    test('Back resets an open draft and resize discards it without resetting the page', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto('/')
        await selectYear(page, '2021')
        const trigger = page.getByRole('button', { name: 'Фильтры · 2' })
        await trigger.click()
        const drawer = page.getByRole('dialog', { name: 'Фильтры', exact: true })
        await drawer.getByRole('button', { name: 'Все участники', exact: true }).click()
        await page.goBack()
        await expect(drawer.getByRole('button', { name: 'Ростов-на-Дону, 20-44 года', exact: true })).toBeDisabled()
        await drawer.getByRole('button', { name: 'Отмена' }).click()
        await expect(drawer).toHaveCount(0)
        expect(api.posts()).toHaveLength(2)
        await selectYear(page, '2021')
        await trigger.click()
        await drawer.getByRole('button', { name: 'Таганрог, 20–44 года' }).click()
        await drawer.getByRole('button', { name: 'Показать результаты' }).click()
        await expect(drawer).toHaveCount(0)
        await expect(page.getByText('2021 · Таганрог')).toBeVisible()
        await trigger.click()
        await drawer.getByRole('button', { name: 'Все участники', exact: true }).click()
        await page.goBack()
        await expect(drawer.getByRole('button', { name: 'Ростов-на-Дону, 20-44 года', exact: true })).toBeDisabled()
        await drawer.getByRole('button', { name: 'Таганрог, 20–44 года' }).click()
        await page.setViewportSize({ width: 1440, height: 900 })
        await expect(drawer).toHaveCount(0)
        await expect(yearRadio(page, '2022')).toBeChecked()
        await expect(sidebarButton(page, 'Ростов-на-Дону, 20-44 года')).toBeDisabled()
        const posts = api.posts().length
        await page.setViewportSize({ width: 390, height: 900 })
        await trigger.click()
        await expect(drawer.getByRole('button', { name: 'Ростов-на-Дону, 20-44 года', exact: true })).toBeDisabled()
        await drawer.getByRole('button', { name: 'Показать результаты' }).click()
        await expect(drawer).toHaveCount(0)
        expect(api.posts()).toHaveLength(posts)
    })
})

for (const width of [390, 768, 1223]) {
    test(`nested Escape and immediate reopening at ${width} keep draft and focus in the right panel`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        const api = await mockApi(page)
        await page.goto('/')
        await expect(page.getByText('Выборка: 100 из 600')).toBeVisible()
        const posts = api.posts().length
        const trigger = page.getByRole('button', { name: 'Фильтры · 2' })
        await trigger.click()
        const drawer = page.getByRole('dialog', { name: 'Фильтры', exact: true })
        await drawer.getByRole('button', { name: 'Таганрог, 20–44 года' }).click()
        const city = drawer.getByRole('combobox', { name: 'Город', exact: true })
        await city.click()
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Escape')
        await expect(page.getByRole('listbox')).toHaveCount(0)
        await expect(city).toBeFocused()
        await expect(drawer.getByRole('button', { name: 'Таганрог, 20–44 года' })).toBeDisabled()
        await page.keyboard.press('Enter')
        await page.keyboard.press('Escape')
        await page.keyboard.press('Enter')
        const search = page.getByRole('textbox', { name: 'Поиск', exact: true })
        await expect(search).toBeFocused()
        await search.fill('Ростов')
        await expect(page.getByRole('option', { name: 'Ростов-на-Дону', exact: true })).toBeVisible()
        await page.keyboard.press('Enter')
        await page.keyboard.press('Escape')
        await expect(page.getByRole('listbox')).toHaveCount(0)
        await expect(city).toBeFocused()
        await expect(city).toHaveText('Таганрог')
        await page.keyboard.press('Enter')
        await expect(search).toBeFocused()
        await page.keyboard.press('Tab')
        await expect(page.getByRole('listbox')).toHaveCount(0)
        await expect(drawer.getByRole('combobox', { name: 'Возраст', exact: true })).toBeFocused()
        await page.keyboard.press('Shift+Tab')
        await expect(city).toBeFocused()
        expect(api.posts()).toHaveLength(posts)
        await page.keyboard.press('Escape')
        // Повторное открытие до завершения closing animation.
        await trigger.evaluate(button => (button as HTMLButtonElement).click())
        await expect(drawer.getByRole('button', { name: 'Ростов-на-Дону, 20-44 года', exact: true })).toBeDisabled()
        const cancel = drawer.getByRole('button', { name: 'Отмена' })
        await cancel.focus()
        await page.keyboard.press('Tab')
        await expect(drawer.getByRole('button', { name: 'Закрыть', exact: true })).toBeFocused()
        await page.keyboard.press('Shift+Tab')
        await expect(cancel).toBeFocused()
        for (let i = 0; i < 20; i++) {
            await page.keyboard.press('Tab')
            expect(await page.getByTestId('drawer-wrapper').evaluate(dialog => dialog.contains(document.activeElement))).toBe(true)
        }
        await page.keyboard.press('Escape')
        await expect(drawer).toHaveCount(0)
        await expect(trigger).toBeFocused()
        expect(api.posts()).toHaveLength(posts)
    })
}

test('resize keeps company selection and both sorts, without remounting main or requesting data', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 })
    const api = await mockApi(page)
    await page.goto('/?v=1&view=table&year=2021&companies=%5B%22IBS%20Dunice%22,%22Тинькофф%22%5D')
    const main = await page.getByRole('main').elementHandle()
    const companyTable = table(page, 'Компания')
    await companyTable.getByRole('button', { name: 'Компания', exact: true }).press('Enter')
    await expect(firstColumn(companyTable)).toHaveText(['Тинькофф', 'IBS Dunice'])
    await companyTable.getByRole('button', { name: 'Тинькофф', exact: true }).press('Enter')
    const card = page.getByRole('complementary', { name: 'Карточка компании' })
    await expect(card).toContainText('Ответили на вопрос о компании: 20')
    const posts = api.posts().length
    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(card).toContainText('Ответили на вопрос о компании: 20')
    expect(await main!.evaluate(element => element.isConnected)).toBe(true)
    await expect(page.getByRole('combobox', { name: 'Компании', exact: true })).toHaveText('IBS Dunice, Тинькофф')
    await expect(firstColumn(companyTable)).toHaveText(['Тинькофф', 'IBS Dunice'])
    await navButton(page, 'Состав выборки').click()
    const languages = table(page, 'Язык программирования')
    await languages.getByRole('button', { name: 'Язык программирования' }).press('Space')
    await expect(firstColumn(languages)).toHaveText(['TypeScript', 'JavaScript', 'C#'])
    for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        await expect(firstColumn(languages)).toHaveText(['TypeScript', 'JavaScript', 'C#'])
        expect(await languages.locator('td [aria-hidden="true"] > span').first().evaluate(bar => {
            const rect = bar.getBoundingClientRect()
            const track = bar.parentElement!.getBoundingClientRect()
            return rect.width > 0 && rect.height > 0 && rect.left >= track.left && rect.right <= track.right
                && rect.top >= track.top && rect.bottom <= track.bottom
        })).toBe(true)
        await expect(yearRadio(page, '2021')).toBeChecked()
    }
    expect(api.posts()).toHaveLength(posts)
})

for (const colorScheme of ['light', 'dark'] as const) {
    test(`theme follows ${colorScheme} system preference and preserves an explicit choice`, async ({ page }) => {
        await page.setViewportSize({ width: colorScheme === 'light' ? 390 : 1440, height: 900 })
        await page.emulateMedia({ colorScheme })
        const api = await mockApi(page)
        await page.goto(linkTo(TAGANROG, '&year=2021&view=table'))
        await expect(page.getByText('Выборка: 60 из 500')).toBeVisible()
        const themeButton = page.getByRole('button', { name: 'Тёмная тема', exact: true })
        await expect(page.locator('body')).toHaveClass(`rs-theme-${colorScheme}`)
        expect(await page.evaluate(() => localStorage.getItem('devrel-theme'))).toBeNull()
        const other = colorScheme === 'light' ? 'dark' : 'light'
        await page.emulateMedia({ colorScheme: other })
        await expect(page.locator('body')).toHaveClass(`rs-theme-${other}`)
        const url = page.url()
        const contents = await table(page, 'Компания').innerText()
        await page.waitForLoadState('networkidle')
        const posts = api.posts().length
        await themeButton.focus()
        await page.keyboard.press('Space')
        await expect(themeButton).toHaveAttribute('aria-pressed', String(colorScheme === 'dark'))
        await expect(page.locator('body')).toHaveClass(`rs-theme-${colorScheme}`)
        await expect(themeButton).toBeFocused()
        await page.waitForLoadState('networkidle')
        expect(page.url()).toBe(url)
        expect(await table(page, 'Компания').innerText()).toBe(contents)
        expect(api.posts()).toHaveLength(posts)
        expect(await page.evaluate(() => localStorage.getItem('devrel-theme'))).toBe(colorScheme)
        await page.reload()
        await expect(page.locator('body')).toHaveClass(`rs-theme-${colorScheme}`)
        await expect(yearRadio(page, '2021')).toBeChecked()
        await expect(page.getByText('2021 · Таганрог, 20–44 года · Выборка: 60 из 500')).toBeVisible()
    })
}

for (const failure of ['read', 'write'] as const) {
    test(`unavailable theme storage (${failure}) falls back to the system without crashing`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'light' })
        await page.addInitScript(failure => {
            localStorage.setItem('devrel-theme', 'dark')
            if (failure === 'read') Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage unavailable') } })
            else Storage.prototype.setItem = () => { throw new Error('Storage full') }
        }, failure)
        const errors = collectErrors(page)
        const api = await mockApi(page)
        await page.goto('/')
        await expect(page.getByText('Выборка: 100 из 600')).toBeVisible()
        await expect(page.locator('body')).toHaveClass(`rs-theme-${failure === 'read' ? 'light' : 'dark'}`)
        const posts = api.posts().length
        await page.getByRole('button', { name: 'Тёмная тема', exact: true }).click()
        await expect(page.locator('body')).toHaveClass('rs-theme-light')
        await page.emulateMedia({ colorScheme: 'dark' })
        await expect(page.locator('body')).toHaveClass('rs-theme-dark')
        await page.waitForLoadState('networkidle')
        expect(api.posts()).toHaveLength(posts)
        expect(errors).toEqual([])
    })
}

test('clean links show all companies; old sets and empty intersections stay explicit in both views', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const api = await mockApi(page)
    const points = page.locator('[data-company]')
    for (const [url, count] of [['/', 6], ['/?v=1', 5], ['/?tab=%22known-and-wanted-2022%22', 5],
        ['/?v=1&companies=invalid', 5], ['/?v=1&companies=[]', 6]] as const) {
        await page.goto(url)
        await expect(points).toHaveCount(count)
        await expect(points.locator('text')).toHaveCount(count)
        if (url.includes('invalid')) await expect(page.getByText('Параметр ссылки «companies»')).toBeVisible()
        await selectView(page, 'Таблица')
        await expect(firstColumn(table(page, 'Компания'))).toHaveCount(count)
        await page.getByRole('combobox', { name: 'Компании', exact: true }).click()
        expect(await page.getByRole('checkbox', { name: 'Популярные', exact: true }).isChecked()).toBe(count === 5)
        await page.keyboard.press('Escape')
    }
    const posts = api.posts().length
    await selectPopularCompanies(page)
    await expect(firstColumn(table(page, 'Компания'))).toHaveCount(5)
    await clearCompanyFilter(page)
    await expect(firstColumn(table(page, 'Компания'))).toHaveCount(6)
    expect(new URL(page.url()).searchParams.get('companies')).toBe('[]')
    expect(api.posts()).toHaveLength(posts)

    await page.goto('/?v=1&companies=%5B%22Контур%22%5D&year=2021')
    for (const view of ['Таблица', 'Карта']) {
        await selectView(page, view)
        await expect(page.getByText('Для выбранных компаний нет данных за 2021 год.')).toBeVisible()
        await expect(page.getByRole('table')).toHaveCount(0)
        await expect(points).toHaveCount(0)
        await expect(page.getByText('Выборка: 60 из 500')).toBeVisible()
    }
    await page.getByRole('alert').getByRole('button', { name: 'Показать все компании' }).click()
    await expect(points).toHaveCount(3)
})

for (const [width, colorScheme] of [[390, 'light'], [390, 'dark'], [1440, 'light'], [1440, 'dark']] as const) {
    test(`company search highlights without filtering at ${width} in ${colorScheme}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.emulateMedia({ colorScheme })
        const api = await mockApi(page)
        await page.goto(linkTo({ ...INITIAL_FILTER, cities: ['Плотный'] }, '&companies=[]'))
        const points = page.locator('[data-company]')
        await expect(points).toHaveCount(40)
        await expect(points.locator('text')).toHaveCount(40)
        const url = page.url()
        const posts = api.posts().length
        const search = page.getByRole('combobox', { name: 'Найти компанию', exact: true })
        await search.focus()
        await page.keyboard.press('Enter')
        await page.keyboard.press('Escape')
        await expect(search).toBeFocused()
        await page.keyboard.press('Enter')
        const input = page.getByRole('searchbox')
        await expect(input).toBeFocused()
        await input.fill('тинь')
        await expect(page.getByRole('option')).toHaveCount(1)
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        await expect(search).toBeFocused()
        await expect(page.getByRole('complementary', { name: 'Карточка компании' })).toContainText('Ответили на вопрос о компании: 100')
        await expect(points).toHaveCount(40)
        const label = points.filter({ has: page.locator('circle[r="7"]') }).locator('text')
        await expect(label).toHaveCount(1)
        await expect(label).toHaveText('Тинькофф')
        await expect(label).toHaveCSS('fill', 'rgb(255, 221, 45)')
        await expect(label).toHaveCSS('stroke', 'none')
        await expect(label).toHaveCSS('font-weight', '600')
        await expect(label).toHaveCSS('font-size', '12px')
        await expect(points.last()).toHaveAttribute('data-company', 'Тинькофф')
        await expect(points.last().locator('circle').last()).toHaveAttribute('r', '7')
        await expect(points.first().locator('circle').last()).toHaveAttribute('r', '4')
        expect(page.url()).toBe(url)
        expect(api.posts()).toHaveLength(posts)
        await search.press('Enter')
        await input.fill('почт')
        await page.keyboard.press('Escape')
        await expect(search).toBeFocused()
        await expect(label).toHaveText('Тинькофф')
        await search.press('Enter')
        await page.keyboard.press('Tab')
        await expect(page.getByRole('listbox')).toHaveCount(0)
        await expect(page.getByRole('radiogroup', { name: 'Показатель' }).getByRole('radio', { checked: true })).toBeFocused()
        await selectView(page, 'Таблица')
        const companies = table(page, 'Компания')
        await expect(firstColumn(companies)).toHaveCount(40)
        await expect(companies.locator('tr[aria-current="true"] td:first-child')).toHaveText('Тинькофф')
        await page.setViewportSize({ width: width === 390 ? 1440 : 390, height: 900 })
        await expect(companies.locator('tr[aria-current="true"] td:first-child')).toHaveText('Тинькофф')
        await selectView(page, 'Карта')
        await expect(label).toHaveText('Тинькофф')
        await search.press('Backspace')
        await expect(label).toHaveCount(0)
        await search.press('Enter')
        await input.fill('пример')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        await expect(label).toHaveText('Пример')
        await selectPopularCompanies(page)
        await expect(points).toHaveCount(2)
        await expect(label).toHaveCount(0)
        await expect(search).toHaveText('Найти компанию')
        await search.click()
        await expect(page.getByRole('option')).toHaveCount(2)
        await page.keyboard.press('Escape')
        await clearCompanyFilter(page)
        await expect(label).toHaveText('Пример')
        for (const name of ['Длинное название компании 38', 'Длинное название компании 39']) {
            await search.click()
            await input.fill(name)
            await page.keyboard.press('ArrowDown')
            await page.keyboard.press('Enter')
            await expect(points.last()).toHaveAttribute('data-company', name)
            expect(await label.evaluate(element => {
                const box = element.getBoundingClientRect()
                const svg = element.closest('svg')!.getBoundingClientRect()
                return box.left >= svg.left && box.right <= svg.right && box.top >= svg.top && box.bottom <= svg.bottom
            })).toBe(true)
        }
        expect(api.posts()).toHaveLength(posts)
    })
}

for (const colorScheme of ['light', 'dark'] as const) {
    test(`long company labels stay inside the plot at 390 in ${colorScheme}`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 900 })
        await page.emulateMedia({ colorScheme })
        await mockApi(page)
        let posts = 0
        page.on('request', request => { if (request.method() === 'POST') posts++ })
        const errors = collectErrors(page)
        const name = 'НИИ "Спецвузавтоматика"'
        await page.route('**/api/results/known-and-wanted', route => route.fulfill({ json: [{
            ...companyResults[0], name, year: 2022, selectionCount: 100,
            knownVotes: 50, knownLevel: 0.5, goodVotes: 10, goodLevel: 0.1, wantedVotes: 8, wantedLevel: 0.08
        }] }))
        await page.goto('/')
        await page.getByRole('combobox', { name: 'Найти компанию', exact: true }).click()
        await page.getByRole('searchbox').fill(name)
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        const label = page.locator('[data-company] text')
        await expect(page.locator('[data-company]')).toHaveAttribute('data-company', name)
        await expect(label).toBeVisible()
        const geometry = await label.evaluate(element => {
            const box = element.getBoundingClientRect()
            const svg = element.closest('svg')!
            const plot = svg.querySelector('.recharts-cartesian-grid')!.getBoundingClientRect()
            const ticks = [...svg.querySelectorAll('.recharts-yAxis-tick-labels text')]
            return {
                insidePlot: box.left >= plot.left && box.right <= plot.right && box.top >= plot.top && box.bottom <= plot.bottom,
                tickCount: ticks.length,
                overlaps: ticks.filter(tick => {
                    const other = tick.getBoundingClientRect()
                    return box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top
                }).map(tick => tick.textContent)
            }
        })
        expect(geometry.tickCount).toBeGreaterThan(0)
        expect(geometry).toMatchObject({ insidePlot: true, overlaps: [] })
        await page.getByRole('combobox', { name: 'Компании', exact: true }).click()
        await page.getByRole('textbox', { name: 'Поиск', exact: true }).fill(name)
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        await page.keyboard.press('Escape')
        expect(JSON.parse(new URL(page.url()).searchParams.get('companies')!)).toEqual([name])
        expect(posts).toBe(2)
        expect(errors).toEqual([])
    })
}

test('company card uses each company denominator, follows the year and opens from any table cell or name', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    const api = await mockApi(page)
    await page.goto('/')
    const card = page.getByRole('complementary', { name: 'Карточка компании' })
    await expect(page.locator('[data-company]')).toHaveCount(6)
    const posts = api.posts().length
    const url = page.url()
    await page.locator('[data-company="IBS Dunice"] circle').last().click()
    await expect(card).toContainText('Ответили на вопрос о компании: 100')
    await expect(card.locator('dd')).toHaveText(['40 (40%)', '10 (10%)', '5 (5%)'])
    expect(page.url()).toBe(url)
    await expect(page.getByRole('tooltip')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('tooltip')).toHaveCount(0)
    await expect(card).toContainText('Ответили на вопрос о компании: 100')
    await selectView(page, 'Таблица')
    const companies = table(page, 'Компания')
    await companies.getByRole('row').filter({ hasText: 'Контур' }).getByRole('cell').nth(1).click()
    await expect(card.getByRole('heading', { name: 'Контур', exact: true })).toBeVisible()
    await expect(card).toContainText('Ответили на вопрос о компании: 90')
    await expect(card.locator('dd')).toHaveText(['45 (50%)', '9 (10%)', '9 (10%)'])
    await companies.getByRole('button', { name: 'Тинькофф', exact: true }).click()
    await expect(card).toContainText('Ответили на вопрос о компании: 6')
    await companies.getByRole('button', { name: 'Контур', exact: true }).press('Enter')
    await selectYear(page, '2021')
    await expect(card).toContainText('Нет данных за 2021 год.')
    await expect(card.locator('dd')).toHaveCount(0)
    await expect(companies.getByRole('columnheader')).toHaveCount(7)
    await selectYear(page, '2019')
    await expect(card.locator('dd')).toHaveText(['10 (25%)', '2 (5%)', '1 (2.5%)'])
    await card.getByRole('button', { name: 'Закрыть карточку компании' }).click()
    await expect(card).toContainText('Выберите компанию на карте, в таблице или через поиск.')
    expect(new URL(page.url()).searchParams.has('focused')).toBe(false)
    expect(api.posts()).toHaveLength(posts)
    expect(errors).toEqual([])
})

for (const touch of [false, true]) {
    test.describe(touch ? 'tap nearby companies' : 'hover nearby companies', () => {
        test.use({ hasTouch: touch, viewport: { width: 390, height: 900 } })
        test('the tooltip keeps the current nearby list after focus, resize, metric and restriction changes', async ({ page }) => {
            const errors = collectErrors(page)
            const api = await mockApi(page)
            await page.goto(linkTo({ ...INITIAL_FILTER, cities: ['Плотный'] }, '&companies=[]'))
            const points = page.locator('[data-company]')
            await expect(points).toHaveCount(40)
            const posts = api.posts().length
            const target = points.filter({ has: page.locator('circle[cx]') }).nth(37)
            const dot = target.locator('circle').last()
            await dot.scrollIntoViewIfNeeded()
            const center = await dot.boundingBox()
            if (touch) await page.touchscreen.tap(center!.x + center!.width / 2, center!.y + center!.height / 2)
            else await page.mouse.move(center!.x + center!.width / 2, center!.y + center!.height / 2)
            const tooltip = page.getByRole('tooltip')
            await expect(tooltip).toContainText('Рядом на карте:')
            const actualName = (await tooltip.locator('div').first().textContent())!
            expect(actualName).toBeTruthy()
            if (touch) {
                await expect(points.last()).toHaveAttribute('data-company', actualName)
                await expect(page.getByRole('complementary', { name: 'Карточка компании' })).toBeInViewport()
            }
            const checkNeighbors = async () => {
                await expect.poll(async () => {
                    const expected = await points.evaluateAll((groups, name) => {
                        const target = groups.find(group => group.getAttribute('data-company') === name)!.querySelector('circle')!
                        const box = target.getBoundingClientRect()
                        const x = box.x + box.width / 2, y = box.y + box.height / 2
                        return groups.map(group => {
                            const dot = group.querySelector('circle')!.getBoundingClientRect()
                            return { name: group.getAttribute('data-company'),
                                distance: (dot.x + dot.width / 2 - x) ** 2 + (dot.y + dot.height / 2 - y) ** 2 }
                        }).filter(point => point.distance <= 144 + 1e-8)
                    }, (await tooltip.locator('div').first().textContent())!)
                    const names = await tooltip.locator('li').allTextContents()
                    const distances = names.map(name => expected.find(point => point.name === name)?.distance ?? Infinity)
                    return JSON.stringify([...names].sort()) === JSON.stringify(expected.map(point => point.name).sort())
                        && distances.every((distance, i) => i === 0 || distance >= distances[i - 1] - 1e-8)
                }).toBe(true)
            }
            await checkNeighbors()
            await page.setViewportSize({ width: 1440, height: 900 })
            // Касание сохраняет открытую подсказку даже после перемонтирования shape.
            if (!touch) await page.locator(`[data-company="${actualName}"] circle`).last().hover({ force: true })
            await checkNeighbors()
            await selectMetric(page, 'Хотят работать')
            await expect(tooltip).toHaveCount(0)
            await selectView(page, 'Таблица')
            await page.setViewportSize({ width: 390, height: 900 })
            const nameButton = table(page, 'Компания').getByRole('button', { name: actualName, exact: true })
            await nameButton.press('Enter')
            const card = page.getByRole('complementary', { name: 'Карточка компании' })
            await expect(card).toBeInViewport()
            await nameButton.scrollIntoViewIfNeeded()
            await expect(card).not.toBeInViewport()
            await nameButton.press('Enter')
            await expect(card).toBeInViewport()
            await page.setViewportSize({ width: 1440, height: 900 })
            await selectView(page, 'Карта')
            await selectPopularCompanies(page)
            await expect(points).toHaveCount(2)
            await expect(page.getByRole('complementary', { name: 'Карточка компании' })).toContainText('Выберите компанию')
            await selectYear(page, '2021')
            await expect(tooltip).toHaveCount(0)
            expect(api.posts()).toHaveLength(posts)
            expect(errors).toEqual([])
        })
    })
}

test.describe('touch nearby list dismissal', () => {
    test.use({ hasTouch: true, viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 })
    test('swipes inside and outside keep the clipped list; taps outside close only the tooltip', async ({ page }) => {
        const errors = collectErrors(page)
        const api = await mockApi(page)
        for (const inside of [true, false]) {
            await page.goto(linkTo({ ...INITIAL_FILTER, cities: ['Плотный'] }, '&companies=[]'))
            const points = page.locator('[data-company]')
            await expect(points).toHaveCount(40)
            await points.nth(37).locator('circle').last().tap({ force: true })
            const tooltip = page.getByRole('tooltip')
            await expect(tooltip).toHaveCSS('opacity', '1')
            const card = page.getByRole('complementary', { name: 'Карточка компании' })
            const cardText = await card.textContent()
            const posts = api.posts().length
            await expect.poll(() => tooltip.locator('li').last().evaluate(el => el.getBoundingClientRect().bottom)).toBeGreaterThan(450)
            if (!inside) {
                await page.evaluate(() => new Promise<void>(resolve => {
                    document.addEventListener('scrollend', () => resolve(), { once: true })
                    scrollBy(0, -160)
                }))
                await expect.poll(() => tooltip.evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThan(450)
            }
            const box = await tooltip.boundingBox()
            const start = inside ? { x: box!.x + box!.width / 2, y: box!.y + 40 } : { x: 680, y: 400 }
            expect(await page.evaluate(({ x, y }) => !!document.elementFromPoint(x, y)?.closest('[role="tooltip"]'), start)).toBe(inside)
            expect(await page.evaluate(({ x, y }) => !!document.elementFromPoint(x, y)?.closest('[data-company], button, input, a'), start)).toBe(false)
            await page.evaluate(() => {
                document.body.removeAttribute('data-scroll-ended')
                document.addEventListener('scrollend', () => { document.body.dataset.scrollEnded = 'true' }, { once: true })
                document.addEventListener('pointerdown', event => {
                    document.body.dataset.trustedTouch = String(event.isTrusted && event.pointerType === 'touch')
                }, { once: true, passive: true })
            })
            const cdp = await page.context().newCDPSession(page)
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...start, id: 1 }] })
            for (let step = 1; step <= (inside ? 10 : 24); step++) {
                await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x, y: start.y - step * 12, id: 1 }] })
                await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())))
            }
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
            await expect(page.locator('body')).toHaveAttribute('data-scroll-ended', 'true')
            await expect(page.locator('body')).toHaveAttribute('data-trusted-touch', 'true')
            await expect(tooltip).toBeVisible()
            const last = await tooltip.locator('li').last().boundingBox()
            expect(last!.y).toBeGreaterThanOrEqual(0)
            expect(last!.y + last!.height).toBeLessThanOrEqual(450)
            await tooltip.locator('li').last().tap()
            await expect(tooltip).toBeVisible()
            await page.touchscreen.tap(680, 400)
            await expect(tooltip).toHaveCount(0)
            await expect(card).toHaveText(cardText!)
            expect(api.posts()).toHaveLength(posts)
            await test.info().attach(`swipe-${inside ? 'inside' : 'outside'}.json`, {
                body: JSON.stringify({ before: box, start, lastAfterSwipe: last, cardPreserved: await card.textContent() === cardText,
                    postDelta: api.posts().length - posts, browser: page.context().browser()?.version() }), contentType: 'application/json'
            })
            await cdp.detach()
        }
        expect(errors).toEqual([])
    })
})

test('comparison picker uses one history patch, survives reload and duplicate, and works from the keyboard at 390', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 })
    const api = await mockApi(page)
    await spyOnWindowOpen(page)
    await page.goto('/')
    await expect(page.getByText('Выборка: 100 из 600')).toBeVisible()
    const history = await page.evaluate(() => window.history.length)
    const compare = page.getByRole('combobox', { name: 'Сравнить с', exact: true })
    await compare.focus()
    await compare.press('Enter')
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('option', { name: '2022', exact: true })).toHaveCount(0)
    await page.getByRole('option', { name: '2021', exact: true }).press('Enter')
    await expect(compare).toContainText('2021')
    expect(new URL(page.url()).searchParams.get('compareYear')).toBe('2021')
    expect(await page.evaluate(() => window.history.length)).toBe(history)
    await page.getByRole('button', { name: 'Дублировать' }).click()
    expect(new URL((await openedUrl(page))!, page.url()).searchParams.get('compareYear')).toBe('2021')
    await page.reload()
    await expect(compare).toContainText('2021')
    await expect(page.locator('[data-company]')).toHaveCount(9)
    const posts = api.posts().length
    await selectYear(page, '2021')
    expect(new URL(page.url()).searchParams.get('compareYear')).toBeNull()
    expect(await page.evaluate(() => window.history.length)).toBe(history + 1)
    await page.goBack()
    await expect(yearRadio(page, '2022')).toBeChecked()
    await expect(compare).toContainText('2021')
    await compare.press('Enter')
    await page.keyboard.press('Escape')
    await expect(compare).toBeFocused()
    await compare.locator('..').getByRole('button', { name: 'Очистить' }).click()
    expect(new URL(page.url()).searchParams.has('compareYear')).toBe(false)
    expect(api.posts()).toHaveLength(posts)
    await page.goto('/?v=1&year=2022&compareYear=2022')
    await expect(page.getByText('Параметр ссылки «compareYear» не распознан', { exact: false })).toBeVisible()
    await expect(compare).toContainText('нет')
})

test('comparison map keeps a shared scale, one brand label including fallback, both card denominators and resize state', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const errors = collectErrors(page)
    const api = await mockApi(page)
    await page.goto('/?v=1&year=2021&compareYear=2022&companies=[]')
    await expect(page.locator('[data-company]')).toHaveCount(9)
    const posts = api.posts().length
    await expect(page.getByLabel('Годы на карте')).toHaveText('● 2021 — основной год · ○ 2022 — сравнение')
    const ticks = page.locator('.recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value')
    await expect(ticks.last()).toHaveText('140 %')
    const search = page.getByRole('combobox', { name: 'Найти компанию', exact: true })
    await search.click()
    await page.getByRole('option', { name: 'Контур', exact: true }).click()
    const labels = page.locator('[data-company] text')
    const names = await page.locator('[data-company]').evaluateAll(points => points.map(point => point.getAttribute('data-company')))
    expect((await labels.allTextContents()).sort()).toEqual([...new Set(names)].sort())
    const label = page.locator('[data-company]').filter({ has: page.locator('circle[r="7"]') }).locator('text')
    await expect(label).toHaveText('Контур')
    await expect(label.locator('..')).toHaveAttribute('data-year', '2022')
    // Контур 2022 и Тинькофф 2021 совпадают по координатам; выбранная подпись выше обоих лет.
    await expect(page.locator('[data-company]').last()).toHaveAttribute('data-company', 'Контур')
    await expect(page.locator('[data-company] text').last()).toHaveText('Контур')
    await expect(label).toHaveCSS('fill', 'rgb(215, 12, 23)')
    await expect(label).toHaveCSS('stroke', 'none')
    const card = page.getByRole('complementary', { name: 'Карточка компании' })
    await expect(card).toContainText('Нет данных за 2021 год.')
    await expect(card).toContainText('Ответили на вопрос о компании: 90')
    for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        await expect(card.getByRole('heading', { name: 'Контур', exact: true })).toBeVisible()
        await expect(page.locator('main')).toHaveCount(1)
        await expect(label).toHaveCount(1)
    }
    await search.click()
    await page.getByRole('option', { name: 'IBS Dunice', exact: true }).click()
    await expect(card.locator('dd')).toHaveText(['15 (50%)', '6 (20%)', '3 (10%)', '40 (40%)', '10 (10%)', '5 (5%)'])
    await expect(card).toContainText('Ответили на вопрос о компании: 30')
    await expect(card).toContainText('Ответили на вопрос о компании: 100')
    await expect(label.locator('..')).toHaveAttribute('data-year', '2021')
    // Обычные кольца перед основными точками; выбранная компания выше обоих слоёв.
    expect(await page.locator('[data-company]:not([data-company="IBS Dunice"])')
        .evaluateAll(points => points.map(point => point.getAttribute('data-year'))))
        .toEqual([...Array(5).fill('2022'), ...Array(2).fill('2021')])
    expect(await page.locator('[data-company]').evaluateAll(points => points.slice(-2).map(point =>
        [point.getAttribute('data-company'), point.getAttribute('data-year')])))
        .toEqual([['IBS Dunice', '2022'], ['IBS Dunice', '2021']])
    const scaleBefore = await ticks.allTextContents()
    await selectPopularCompanies(page)
    expect(await ticks.allTextContents()).toEqual(scaleBefore)
    expect(api.posts()).toHaveLength(posts)
    expect(errors).toEqual([])
})

test('comparison table keeps all seven columns, main-year sorting and only wanted deltas with 2019', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await mockApi(page)
    await page.goto('/?v=1&year=2022&compareYear=2021&companies=[]&view=table')
    const companies = table(page, 'Компания')
    await expect(companies.getByRole('columnheader')).toHaveCount(7)
    const cells = (name: string) => companies.locator('tbody tr').filter({ hasText: name }).locator('td')
    await expect(cells('IBS Dunice').nth(1)).toHaveText('40%Δ -10 п. п.')
    await expect(cells('IBS Dunice').nth(5)).toHaveText('95Δ -65')
    await expect(cells('Тинькофф').nth(6)).toHaveText('——')
    await expect(cells('Контур').nth(3)).toHaveText('10%Нет данных за 2021 год')
    expect(await cells('Zero Corp').allTextContents()).toEqual(['Zero Corp', ...Array(6).fill('Нет данных за 2022 год')])
    for (const direction of ['descending', 'ascending']) {
        await companies.getByRole('button', { name: 'Знают', exact: true }).press('Enter')
        await expect(companies.getByRole('columnheader', { name: 'Знают', exact: true })).toHaveAttribute('aria-sort', direction)
        await expect(companies.locator('tbody tr').last()).toContainText('Zero Corp')
    }
    await navButton(page, 'Состав выборки').click()
    await table(page, 'Возраст').getByRole('button', { name: '2021 · 60 из 500', exact: true }).press('Enter')
    await page.getByRole('combobox', { name: 'Сравнить с' }).locator('..').getByRole('button', { name: 'Очистить' }).click()
    await expect(table(page, 'Возраст').getByRole('columnheader', { name: '2022 · 100 из 600' })).toHaveAttribute('aria-sort', 'descending')
    await navButton(page, 'Компании').click()
    await page.getByRole('combobox', { name: 'Сравнить с' }).click()
    await page.getByRole('option', { name: '2019', exact: true }).click()
    await expect(page.getByText('С 2019 годом сравнивается только «Хотят работать».')).toBeVisible()
    await expect(cells('Контур').nth(3)).toHaveText('10%Δ +7.5 п. п.')
    await expect(cells('Тинькофф').nth(3)).toHaveText('66.7%Нет данных за 2019 год')
    for (const name of ['Контур', 'Тинькофф']) {
        for (const column of [1, 2, 4, 5, 6]) await expect(cells(name).nth(column)).not.toContainText(/Δ|Нет данных/)
    }
    await selectView(page, 'Карта')
    await expect(page.getByRole('radiogroup', { name: 'Показатель' }).getByRole('radio')).toHaveCount(1)
    await expect(page.getByRole('radio', { name: 'Хотят работать', exact: true })).toBeChecked()
    await selectView(page, 'Таблица')
    await page.getByText('С 2019 годом сравнивается только «Хотят работать».').getByRole('button', { name: 'Подробнее' }).click()
    await expect(page.getByRole('heading', { name: 'Особенность 2019 года', exact: true })).toBeFocused()
})

test('comparison keeps the populated year when the main sample is empty, without percentages or bars for zero', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 })
    const api = await mockApi(page)
    await page.goto(linkTo({ ...INITIAL_FILTER, cities: ['Тбилиси'] }, '&year=2021&compareYear=2022&companies=[]'))
    await expect(page.locator('[data-company]')).toHaveCount(1)
    await selectView(page, 'Таблица')
    await expect(table(page, 'Компания').locator('tbody td').nth(1)).toHaveText('Нет данных за 2021 год')
    await navButton(page, 'Состав выборки').click()
    const cities = table(page, 'Город')
    await expect(cities.getByRole('columnheader')).toHaveText(['Город ↕', '2021 · 0 из 500 ↕', '2022 · 1 из 600 ↕'])
    await expect(cities.locator('tbody td')).toHaveText(['Тбилиси', '0 (—)', '1 (100%)'])
    await expect(cities.locator('tbody td').nth(1).locator('[aria-hidden]')).toHaveCount(0)
    await expect(cities.locator('tbody td').nth(2).locator('[aria-hidden]')).toHaveCount(1)
    await expect(page.getByText('В выбранной группе нет респондентов', { exact: false })).toHaveCount(0)
    expect(api.posts()).toHaveLength(2)
})


for (const hasTouch of [false, true]) {
    test.describe(`comparison nearby entries, touch ${hasTouch}`, () => {
        test.use({ hasTouch, viewport: { width: 390, height: 900 } })
        test('coincident company years stay distinct in the current tooltip and share one card', async ({ page }) => {
            const api = await mockApi(page)
            await page.route('**/api/results/known-and-wanted', route => route.fulfill({ json: [
                companyResults[0], { ...companyResults[0], year: 2021 }
            ] }))
            await page.goto('/?v=1&compareYear=2021&companies=[]')
            await expect(page.locator('[data-company]')).toHaveCount(2)
            const posts = api.posts().length
            const dot = page.locator('[data-company="IBS Dunice"][data-year="2022"] circle').last()
            if (hasTouch) await dot.tap()
            else await dot.hover()
            const tooltip = page.getByRole('tooltip')
            await expect(tooltip.locator('div').first()).toHaveText('IBS Dunice · 2022')
            await expect(tooltip.locator('li')).toHaveText(['IBS Dunice · 2022', 'IBS Dunice · 2021'])
            if (hasTouch) {
                const card = page.getByRole('complementary', { name: 'Карточка компании' })
                await expect(card.getByRole('heading', { level: 3 })).toHaveText(['2022', '2021'])
                await page.setViewportSize({ width: 1440, height: 900 })
                await expect(tooltip.locator('li')).toHaveText(['IBS Dunice · 2022', 'IBS Dunice · 2021'])
                await page.keyboard.press('Escape')
                await expect(tooltip).toHaveCount(0)
                await expect(card).toContainText('Ответили на вопрос о компании: 100')
            }
            expect(api.posts()).toHaveLength(posts)
        })
    })
}

for (const width of [390, 1440]) {
    test(`company presets stay inside the picker and keep the exact set at ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        const api = await mockApi(page)
        await page.goto('/')
        await expect(page.locator('[data-company] text')).toHaveCount(6)
        const posts = api.posts().length
        const picker = page.getByRole('combobox', { name: 'Компании', exact: true })
        await expect(page.getByRole('button', { name: 'Прежний набор: 29 компаний' })).toHaveCount(0)
        await expect(page.getByRole('button', { name: 'Показать все компании' })).toHaveCount(0)
        await picker.focus()
        await page.keyboard.press('Enter')
        const search = page.getByRole('textbox', { name: 'Поиск', exact: true })
        await expect(search).toBeFocused()
        await search.fill('Контур')
        await expect(page.getByRole('option')).toHaveText(['Выбрать все', 'Популярные', 'Контур'])
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        await expect(page.getByRole('checkbox', { name: 'Популярные', exact: true })).toBeChecked()
        expect(JSON.parse(new URL(page.url()).searchParams.get('companies')!)).toEqual(LEGACY_COMPANIES)
        await page.keyboard.press('Escape')
        await expect(picker).toBeFocused()
        await expect(picker).toContainText('Популярные')
        await expect(page.locator('[data-company] text')).toHaveCount(5)
        await selectYear(page, '2021')
        expect(JSON.parse(new URL(page.url()).searchParams.get('companies')!)).toEqual(LEGACY_COMPANIES)
        await selectYear(page, '2022')
        await picker.click()
        await search.fill('Тинькофф')
        await page.getByRole('option', { name: 'Тинькофф', exact: true }).click()
        await expect(page.getByRole('checkbox', { name: 'Популярные', exact: true })).not.toBeChecked()
        expect(JSON.parse(new URL(page.url()).searchParams.get('companies')!).sort())
            .toEqual(LEGACY_COMPANIES.filter(name => name !== 'Тинькофф').sort())
        await page.getByRole('option', { name: 'Выбрать все', exact: true }).click()
        await expect(page.getByRole('checkbox', { name: 'Выбрать все', exact: true })).toBeChecked()
        await expect(page.locator('[data-company] text')).toHaveCount(6)
        await page.getByRole('option', { name: 'Популярные', exact: true }).click()
        await expect(page.getByRole('checkbox', { name: 'Популярные', exact: true })).toBeChecked()
        await expect(page.getByRole('checkbox', { name: 'Выбрать все', exact: true })).not.toBeChecked()
        await page.keyboard.press('Escape')
        await clearCompanyFilter(page)
        expect(new URL(page.url()).searchParams.get('companies')).toBe('[]')
        await expect(page.locator('[data-company] text')).toHaveCount(6)
        expect(api.posts()).toHaveLength(posts)

        if (width < 1224) await page.getByRole('button', { name: 'Фильтры · 2' }).click()
        const panel = width < 1224 ? page.getByRole('dialog') : filterPanel(page)
        await expect(panel.getByRole('heading', { name: 'Быстрый выбор', exact: true })).toHaveCount(0)
        await expect(panel.getByRole('heading', { name: 'Готовые группы', exact: true })).toHaveCount(1)
        await expect(panel.getByRole('button', { name: 'Ростов-на-Дону, 20-44 года', exact: true })).toBeDisabled()
        await panel.getByRole('button', { name: 'Все участники', exact: true }).press('Enter')
        await expect(panel.getByRole('button', { name: 'Все участники', exact: true })).toBeDisabled()
        await panel.getByRole('button', { name: 'Ростов-на-Дону, 20-44 года', exact: true }).press('Enter')
        await expect(panel.getByRole('button', { name: 'Ростов-на-Дону, 20-44 года', exact: true })).toBeDisabled()
    })
}

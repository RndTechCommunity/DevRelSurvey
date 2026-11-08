import { expect, Locator, Page, test } from '@playwright/test'
import { NO_RESTRICTIONS } from '../src/features/filters/model'
import { filterOptions } from '../src/test/fixtures'
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
const filterPanel = (page: Page) => page.getByRole('complementary')
const sidebarButton = (page: Page, name: string) => filterPanel(page).getByRole('button', { name, exact: true })
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
        await page.goto('/?v=1&view=table')
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
        await expect(sidebarButton(page, 'Исходная выборка')).toBeEnabled()
    })

    test('restriction buttons clear one dimension or all, quick groups keep their composition', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto('/')
        await expect(sidebarButton(page, 'Исходная выборка')).toBeDisabled()
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
        await sidebarButton(page, 'Исходная выборка').click()
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
            const pointY = Number(await page.locator('[data-company="IBS Dunice"] circle').getAttribute('cy'))
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

    test('old interval and disabled flags explain the change; selecting a metric recovers the map', async ({ page }) => {
        await mockApi(page)
        await page.goto('/?v=1&error=1&good=0&wanted=0')
        await expect(page.getByText('Отображение «доверительного интервала» убрано:')).toBeVisible()
        await expect(page.getByText('Показатель не выбран.')).toBeVisible()
        await expect(page.locator('.recharts-wrapper')).toHaveCount(0)
        await selectYear(page, '2019')
        await expect(page.getByText('Показатель не выбран.')).toBeVisible()
        await page.getByRole('button', { name: 'Закрыть', exact: true }).click()
        await page.goBack()
        await expect(page.getByText('Отображение «доверительного интервала» убрано:')).toBeVisible()
        const metric = page.getByRole('radiogroup', { name: 'Показатель' })
        await metric.getByRole('radio', { name: 'Рекомендуют', exact: true }).focus()
        await page.keyboard.press('Space')
        await expect(page.locator('[data-company] circle')).toHaveCount(5)
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
        await page.locator('.rs-picker-toggle', { hasText: 'IBS Dunice' }).click()
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
        await page.goto(linkTo({ ...INITIAL_FILTER, cities: ['Тбилиси'] }, '&view=table'))
        await expect(page.getByText('Загрузка данных').first()).toBeVisible()

        await sidebarButton(page, 'Исходная выборка').click()
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
        await page.goto('/?v=1&view=table')
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
        await page.goto('/?v=1&view=table')

        await expect(page.getByText('Не удалось загрузить данные')).toBeVisible()
        restore()
        await page.getByRole('button', { name: 'Повторить' }).click()
        await expect(firstColumn(table(page, 'Компания'))).toHaveCount(6)
    })

    test('returning to a group with a failed request shows loading, not the old error', async ({ page }) => {
        const api = await mockApi(page)
        const restore = api.override(isCompanies, 500)
        await page.goto('/?v=1&view=table')
        await expect(page.getByText('Не удалось загрузить данные')).toBeVisible()
        restore()
        let release = () => {}
        api.override(isCompanies, new Promise<void>(resolve => { release = resolve }))

        await sidebarButton(page, 'Таганрог, 20–44 года').click()
        await sidebarButton(page, 'Исходная выборка').click()

        await expect(page.getByText('Загрузка данных')).toBeVisible()
        await expect(page.getByText('Не удалось загрузить данные')).toHaveCount(0)
        release()
        await expect(firstColumn(table(page, 'Компания'))).toHaveCount(6)
    })

    test('a dictionary error stays in the filter panel', async ({ page }) => {
        const api = await mockApi(page)
        const restore = api.override(isFilterOptions, 500)
        await page.goto('/?v=1&view=table')

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

    test('an undefined brand rating is shown as a dash and sorted last', async ({ page }) => {
        await mockApi(page)
        await page.goto('/?v=1&view=table')
        const companies = table(page, 'Компания')

        await companies.getByRole('button', { name: 'Рейтинг бренда' }).click()

        await expect(firstColumn(companies)).toHaveText(
            ['Контур', 'Gamma%', 'IBS Dunice', 'ИТРУМ (ex Exceed Team)', 'Тинькофф', 'Почтатех'])
        await expect(companies.locator('tbody td:last-child'))
            .toHaveText(['66.7', '66.7', '60', '33.3', '—', '—'])
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
    await page.goto('/?v=1&year=2021&view=table')
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
        await expect(drawer.getByRole('button', { name: 'Исходная выборка', exact: true })).toBeDisabled()
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
        await expect(drawer.getByRole('button', { name: 'Исходная выборка', exact: true })).toBeDisabled()
        await drawer.getByRole('button', { name: 'Таганрог, 20–44 года' }).click()
        await page.setViewportSize({ width: 1440, height: 900 })
        await expect(drawer).toHaveCount(0)
        await expect(yearRadio(page, '2022')).toBeChecked()
        await expect(sidebarButton(page, 'Исходная выборка')).toBeDisabled()
        const posts = api.posts().length
        await page.setViewportSize({ width: 390, height: 900 })
        await trigger.click()
        await expect(drawer.getByRole('button', { name: 'Исходная выборка', exact: true })).toBeDisabled()
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
        await expect(drawer.getByRole('button', { name: 'Исходная выборка', exact: true })).toBeDisabled()
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
    await page.goto('/?v=1&view=table&year=2021&companies=%5B%22IBS%20Dunice%22%5D')
    const main = await page.getByRole('main').elementHandle()
    const companyTable = table(page, 'Компания')
    await companyTable.getByRole('button', { name: 'Компания', exact: true }).press('Enter')
    await expect(firstColumn(companyTable)).toHaveText(['Тинькофф', 'Zero Corp', 'IBS Dunice'])
    const posts = api.posts().length
    await page.setViewportSize({ width: 1440, height: 900 })
    expect(await main!.evaluate(element => element.isConnected)).toBe(true)
    await expect(page.getByRole('combobox', { name: 'Компании', exact: true })).toHaveText('IBS Dunice')
    await expect(firstColumn(companyTable)).toHaveText(['Тинькофф', 'Zero Corp', 'IBS Dunice'])
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

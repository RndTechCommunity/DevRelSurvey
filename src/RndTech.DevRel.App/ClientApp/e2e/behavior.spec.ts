import { expect, Locator, Page, test } from '@playwright/test'
import { NO_RESTRICTIONS } from '../src/features/filters/model'
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

const currentSection = (page: Page) => page.getByRole('navigation', { name: 'Разделы' }).locator('[aria-current="page"]')
const navButton = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
const yearRadio = (page: Page, year: string) =>
    page.getByRole('radiogroup', { name: 'Год исследования' }).getByRole('radio', { name: year })
// Поле radio скрыто библиотекой, щёлкаем по подписи года.
const selectYear = (page: Page, year: string) =>
    page.getByRole('radiogroup', { name: 'Год исследования' }).getByText(year, { exact: true }).click()
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
    test(`width ${width} mounts only the mobile view`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await mockApi(page)
        await page.goto('/')

        await expect(page.getByRole('heading', { name: MOBILE_TITLE })).toBeVisible()
        await expect(page.getByRole('radiogroup', { name: 'Год исследования' })).toHaveCount(0)
    })
}

for (const width of [1224, 1225, 1440]) {
    test(`width ${width} mounts only the desktop view`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await mockApi(page)
        await page.goto('/')

        await expect(page.getByText('Выборка: 100 из 600')).toBeVisible()
        await expect(filterPanel(page)).toHaveCount(1)
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

        await expect(companies.getByRole('columnheader', { name: 'Компания' })).toHaveAttribute('aria-sort', 'descending')
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
        await toggleCheckbox(page, 'Отображать доверительный интервал')
        await page.waitForLoadState('networkidle')
        const loaded = api.calls.length

        await page.setViewportSize({ width: 390, height: 900 })
        await expect(page.getByRole('heading', { name: MOBILE_TITLE })).toBeVisible()
        await expect(page.locator('.rs-picker-toggle-value')).toHaveText('Таганрог')
        await expect(page.getByText('Данные 2021 года')).toBeVisible()

        await page.setViewportSize({ width: 1440, height: 900 })
        await expect(yearRadio(page, '2021')).toBeChecked()
        await expect(sidebarButton(page, 'Таганрог, 20–44 года')).toBeDisabled()
        await expect(page.getByRole('checkbox', { name: 'Отображать доверительный интервал' })).toBeChecked()
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
        await toggleCheckbox(page, 'Знаю и рекомендую')

        await page.getByRole('button', { name: 'Дублировать' }).click()

        const search = await page.evaluate(() => location.search)
        expect(search).toContain('good=0')
        expect(await openedUrl(page)).toBe(search)
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
    test('the year, companies, chart flags, sorting and Back send no requests, a preset sends two', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto('/')
        await expect(page.getByText('Выборка: 100 из 600')).toBeVisible()
        await page.waitForLoadState('networkidle')
        const loaded = api.calls.length

        await selectYear(page, '2021')
        await toggleCheckbox(page, 'Знаю и хочу работать')
        await table(page, 'Компания').getByRole('columnheader', { name: 'Знают' }).click()
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
        await page.goto(linkTo({ ...INITIAL_FILTER, cities: ['Тбилиси'] }))
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
        await page.goto('/')
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
        await page.goto('/')

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
        await page.goto('/')
        const companies = table(page, 'Компания')

        await companies.getByRole('columnheader', { name: 'Рейтинг бренда' }).click()

        await expect(firstColumn(companies)).toHaveText(
            ['Контур', 'Gamma%', 'IBS Dunice', 'ИТРУМ (ex Exceed Team)', 'Тинькофф', 'Почтатех'])
        await expect(companies.locator('.rs-table-body-row-wrapper .rs-table-cell-last'))
            .toHaveText(['66.7', '66.7', '60', '33.3', '—', '—'])
    })

    test('the sample composition of a year without respondents is a message, not zero shares', async ({ page }) => {
        await mockApi(page)
        await page.goto(linkTo({ ...INITIAL_FILTER, cities: ['Тбилиси'] }, '&page=sample'))

        await expect(page.locator('.rs-table-row', { hasText: 'Тбилиси' }).locator('.rs-table-cell'))
            .toHaveText(['Тбилиси', '1 (100%)'])
        await selectYear(page, '2021')
        await expect(page.getByText('В выбранной группе нет респондентов за 2021 год.')).toBeVisible()
        await expect(page.getByText('Выборка: 0 из 500')).toBeVisible()
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

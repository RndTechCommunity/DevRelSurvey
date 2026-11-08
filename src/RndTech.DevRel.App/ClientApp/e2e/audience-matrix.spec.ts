import AxeBuilder from '@axe-core/playwright'
import { expect, test, Page, Locator } from '@playwright/test'
import { AudienceGroupBy } from '../src/api/types'
import { DEFAULT_STATE, LEGACY_COMPANIES, SurveyState } from '../src/app/surveyState'
import { encodeSurveyUrl } from '../src/app/surveyUrl'
import { GROUP_LABELS } from '../src/features/audience-matrix/audienceMatrix'
import { audienceMatrixFixture, MATRIX_COMPANY, MATRIX_LONG_COMPANY } from '../src/test/fixtures'
import { isMatrix, mockApi } from './mockApi'

const initial: SurveyState = { ...DEFAULT_STATE, page: 'audience-matrix' }
const url = (patch: Partial<SurveyState> = {}) => '/' + encodeSurveyUrl({ ...initial, ...patch })
const table = (page: Page) => page.getByRole('table')
const cell = (page: Page) => table(page).getByRole('button', { name: new RegExp(`${MATRIX_COMPANY}; Backend;`) })
const matrixState = (page: Page) => new URL(page.url()).searchParams.get('matrix')
async function expectCellVisible(active: Locator) {
    const visibility = await active.evaluate(button => {
        const rect = button.getBoundingClientRect()
        const table = button.closest('table')!
        const header = table.querySelector('thead th')!.getBoundingClientRect()
        const row = button.closest('tr')!.querySelector('th')!.getBoundingClientRect()
        const region = table.parentElement!.getBoundingClientRect()
        return {
            top: rect.top - Math.max(header.bottom, region.top, 0),
            left: rect.left - row.right,
            bottom: Math.min(region.bottom, innerHeight) - rect.bottom,
            right: Math.min(region.right, innerWidth) - rect.right,
            center: button.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2))
        }
    })
    expect(visibility.top).toBeGreaterThanOrEqual(0)
    expect(visibility.left).toBeGreaterThanOrEqual(0)
    expect(visibility.bottom).toBeGreaterThanOrEqual(0)
    expect(visibility.right).toBeGreaterThanOrEqual(0)
    expect(visibility.center).toBe(true)
}

async function closePicker(page: Page) {
    await page.getByRole('textbox', { name: 'Поиск', exact: true }).press('Escape')
    await expect(page.getByRole('listbox')).toHaveCount(0)
}

for (const groupBy of Object.keys(GROUP_LABELS) as AudienceGroupBy[]) {
    test(`full catalog, explicit all and clear: ${groupBy}`, async ({ page }) => {
        const api = await mockApi(page)
        await page.goto(url({ matrix: { ...initial.matrix, groupBy } }))
        const expected = audienceMatrixFixture({ year: 2022, filter: initial.filter, groupBy, groupValues: null })
        await expect(table(page).getByRole('row')).toHaveCount(19)
        await expect(page.getByText('Общая группа: 3 участников · 18 компаний')).toBeVisible()
        await expect(page.getByText(/Выборка:/)).toHaveCount(0)
        await expect(page.getByRole('combobox', { name: 'Сравнить с' })).toHaveCount(0)
        await page.getByRole('button', { name: 'Очистить колонки' }).click()
        await expect(table(page)).toHaveCount(0)
        await page.getByRole('combobox', { name: 'Колонки', exact: true }).click()
        await page.getByRole('option', { name: 'Выбрать все', exact: true }).click()
        await closePicker(page)
        await expect(table(page).getByRole('columnheader')).toHaveCount(expected.availableValues.length + 1)
        expect(JSON.parse(matrixState(page)!).groupValues).toEqual(expected.availableValues.map(option => option.value))
        expect(api.posts(isMatrix)).toHaveLength(3)
        await page.getByRole('button', { name: 'Очистить колонки' }).click()
        await expect(page.getByText('Выберите значения в поле «Колонки».', { exact: false })).toBeVisible()
        await expect(table(page)).toHaveCount(0)
        expect(JSON.parse(matrixState(page)!).groupValues).toEqual([])
        await page.getByRole('button', { name: 'Начальные группы', exact: true }).click()
        await expect(table(page)).toBeVisible()
        expect(JSON.parse(matrixState(page)!).groupValues).toBeNull()
    })
}

test('local controls preserve rows, precise details and auto selection without POST', async ({ page }) => {
    const api = await mockApi(page)
    await page.goto(url())
    await cell(page).focus()
    const details = page.getByRole('complementary', { name: 'Значение ячейки' })
    await expect(details).toContainText('50,0% · Отметок: 1 · Ответов о компании: 2')
    await page.getByLabel('Показатель', { exact: true }).selectOption('known')
    await expect(details).toContainText('100,0% · Отметок: 2')
    await page.getByLabel('Сортировка строк').selectOption('column:"Backend"')
    expect(JSON.parse(matrixState(page)!).groupValues).toBeNull()
    await page.getByLabel('Направление').selectOption('asc')
    await page.getByRole('button', { name: 'Тёмная тема' }).click()
    await page.setViewportSize({ width: 390, height: 900 })
    await page.getByRole('combobox', { name: 'Компании', exact: true }).click()
    const search = page.getByRole('textbox', { name: 'Поиск', exact: true })
    await expect(search).toBeFocused()
    await search.fill('100%')
    await search.press('Enter')
    await expect(page.getByRole('option', { name: MATRIX_COMPANY, exact: true })).toBeVisible()
    await page.getByRole('option', { name: MATRIX_COMPANY, exact: true }).click()
    await closePicker(page)
    await expect(table(page).getByRole('row')).toHaveCount(2)
    await expect(page.getByRole('combobox', { name: 'Компании', exact: true })).toBeFocused()
    await page.getByRole('combobox', { name: 'Компании', exact: true }).click()
    await page.getByRole('option', { name: 'Популярные', exact: true }).click()
    await closePicker(page)
    await expect(table(page).getByRole('row')).toHaveCount(LEGACY_COMPANIES.length + 1)
    await expect(details).toHaveCount(0)
    await page.waitForTimeout(150)
    expect(api.posts(isMatrix)).toHaveLength(1)
})

test('auto sort falls back once after ready; stale requests cannot restore data, N or selection', async ({ page }) => {
    const api = await mockApi(page)
    await page.goto(url())
    await cell(page).click()
    await page.getByLabel('Сортировка строк').selectOption('column:"Backend"')
    let release = () => {}
    const pending = new Promise<void>(resolve => { release = resolve })
    const remove = api.override(call => isMatrix(call) && call.body?.includes('2020') === true, pending)
    await page.getByRole('radiogroup', { name: 'Год исследования' }).getByText('2020').click()
    await expect(table(page)).toHaveCount(0)
    await expect(page.getByLabel('Цветовая шкала')).toHaveCount(0)
    await expect(page.getByText(/Общая группа:/)).toHaveCount(0)
    await expect(page.getByRole('complementary', { name: 'Значение ячейки' })).toHaveCount(0)
    expect(JSON.parse(matrixState(page)!).sort.by).toBe('column')
    await page.getByRole('radiogroup', { name: 'Год исследования' }).getByText('2021').click()
    await expect(table(page).getByRole('columnheader', { name: /Только 2021/ })).toBeVisible()
    await expect(page.getByLabel('Сортировка строк')).toHaveValue('name')
    expect(JSON.parse(matrixState(page)!).sort).toEqual({ by: 'name', direction: 'asc' })
    release(); remove()
    await page.waitForTimeout(150)
    expect(api.posts(isMatrix)).toHaveLength(3)
    await expect(table(page)).toContainText('2021 · Хотят работать')
    await expect(page.getByText('Общая группа: 1 участников · 18 компаний')).toBeVisible()
})

test('errors and retry hide old numbers; exit aborts; explicit unknown and conflicting groups survive', async ({ page }) => {
    const api = await mockApi(page)
    await page.goto(url({ filter: { ...initial.filter, professions: ['Backend'] },
        matrix: { ...initial.matrix, groupValues: ['Frontend', 'Unknown'] } }))
    await expect(table(page).getByRole('columnheader', { name: 'Unknown N = 0' })).toBeVisible()
    await expect(page.getByText('Есть колонки с N = 0.', { exact: false })).toBeVisible()
    await page.getByRole('button', { name: /Убрать ограничение «Профессия»/ }).click()
    await expect(table(page).getByRole('columnheader', { name: 'Frontend N = 1' })).toBeVisible()
    await page.getByLabel('Сортировка строк').selectOption('column:"Frontend"')
    await page.getByRole('combobox', { name: 'Колонки', exact: true }).click()
    await page.getByRole('option', { name: 'Frontend', exact: true }).click()
    await expect(page.getByRole('option', { name: 'Unknown (нет в справочнике)', exact: true })).toBeVisible()
    await closePicker(page)
    await expect(page.getByLabel('Сортировка строк')).toHaveValue('name')
    for (const code of [400, 413, 500]) {
        const remove = api.override(isMatrix, code)
        await page.getByLabel('Группировать по').selectOption('cities')
        await expect(page.getByText('Не удалось загрузить данные.', { exact: false })).toBeVisible()
        await expect(table(page)).toHaveCount(0)
        await expect(page.getByText(/Общая группа:/)).toHaveCount(0)
        remove()
        await page.getByRole('button', { name: 'Повторить', exact: true }).click()
        await expect(table(page)).toBeVisible()
        await page.getByLabel('Группировать по').selectOption('professions')
        await expect(table(page)).toBeVisible()
    }
    let release = () => {}
    api.override(isMatrix, new Promise<void>(resolve => { release = resolve }))
    await page.getByLabel('Группировать по').selectOption('languages')
    await page.getByRole('button', { name: 'О данных', exact: true }).click()
    release()
    await expect(page.getByRole('heading', { name: 'О данных', exact: true })).toBeVisible()
    await expect(table(page)).toHaveCount(0)
})

test('2019 fallback, preserved comparison, duplicate and Back/Forward restore the full state', async ({ page, context }) => {
    await mockApi(page)
    await page.goto(url({ year: 2020, compareYear: 2021, matrix: { ...initial.matrix, metric: 'good', groupValues: ['Backend', 'Unknown'] } }))
    await expect(table(page)).toBeVisible()
    await page.getByRole('radiogroup', { name: 'Год исследования' }).getByText('2019').click()
    await expect(page.getByText('Для 2019 года вместо рекомендаций показано желание работать.')).toBeVisible()
    await expect(page.getByLabel('Показатель', { exact: true })).toHaveValue('wanted')
    await expect(page.getByLabel('Показатель', { exact: true }).getByRole('option', { name: 'Рекомендуют' })).toHaveCount(0)
    await page.getByRole('radiogroup', { name: 'Год исследования' }).getByText('2021').click()
    await expect(page.getByLabel('Показатель', { exact: true })).toHaveValue('good')
    const saved = page.url()
    await context.route('**/api/**', route => route.fulfill({ status: 503, body: '' }))
    const popup = context.waitForEvent('page')
    await page.getByRole('button', { name: 'Дублировать' }).click()
    const copy = await popup
    await copy.waitForURL(saved)
    await copy.close()
    await page.getByRole('button', { name: 'Компании', exact: true }).click()
    await expect(page.getByText('Сравнение с 2021 сохранено.', { exact: false })).toBeVisible()
    await page.goBack()
    await expect(page).toHaveURL(saved)
    await expect(table(page).getByRole('columnheader', { name: 'Unknown N = 0' })).toBeVisible()
    await page.goBack()
    await expect(page.getByText('Для 2019 года вместо рекомендаций показано желание работать.')).toBeVisible()
    await page.goForward()
    await expect(page).toHaveURL(saved)
})

for (const theme of ['light', 'dark'] as const) {
    for (const width of [390, 768, 1223, 1224, 1225, 1440]) {
        test(`${theme} readable table at ${width}, keyboard and full labels`, async ({ page }, testInfo) => {
            await page.setViewportSize({ width, height: 900 })
            await page.emulateMedia({ colorScheme: theme })
            await mockApi(page)
            await page.goto(url({
                companies: [MATRIX_COMPANY, 'AB', MATRIX_LONG_COMPANY, 'Missing', ...Array.from({ length: 17 }, (_, i) => `Missing ${i}`)],
                matrix: { ...initial.matrix, groupValues: ['Backend', 'Frontend', 'Анонсы в телеграм-каналах и чатах профильных сообществ региона'] }
            }))
            await expect(table(page)).toBeVisible()
            await cell(page).focus()
            await page.keyboard.press('Enter')
            await expect(page.getByRole('complementary', { name: 'Значение ячейки' })).toContainText('Ответов о компании: 2')
            await page.keyboard.press('Escape')
            await expect(page.getByRole('complementary', { name: 'Значение ячейки' })).toHaveCount(0)
            await page.keyboard.press('Tab')
            await expect(table(page).getByRole('button', { name: new RegExp(`${MATRIX_COMPANY}; Frontend;`) })).toBeFocused()
            await page.keyboard.press('Shift+Tab')
            await expect(cell(page)).toBeFocused()
            const rowLabel = await table(page).getByRole('rowheader', { name: MATRIX_COMPANY, exact: true }).boundingBox()
            const focused = await cell(page).boundingBox()
            expect(focused!.x).toBeGreaterThanOrEqual(rowLabel!.x + rowLabel!.width)
            expect(focused!.x + focused!.width).toBeLessThanOrEqual(width - 16)
            await table(page).locator('tbody button').nth(45).focus()
            for (let step = 0; step < 10; step++) await page.keyboard.press('Shift+Tab')
            const active = table(page).locator('tbody button').nth(35)
            await expect(active).toBeFocused()
            await expectCellVisible(active)
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
            const violations = (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations
            expect(violations).toEqual([])
            await page.screenshot({ path: testInfo.outputPath(`matrix-${theme}-${width}.png`), fullPage: true })
        })
    }
}

test('a header taller than the scroll area leaves the focused cell fully visible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 })
    await mockApi(page)
    await page.goto(url({
        companies: Array.from({ length: 21 }, (_, i) => `Missing ${i}`),
        matrix: { ...initial.matrix, groupValues: ['Backend', 'Frontend', 'Very long audience label with words and spaces '.repeat(11)] }
    }))
    await table(page).locator('tbody button').nth(45).focus()
    for (let step = 0; step < 10; step++) await page.keyboard.press('Shift+Tab')
    const active = table(page).locator('tbody button').nth(35)
    await expect(active).toBeFocused()
    await expectCellVisible(active)
})

test('touch cell and horizontal gesture retain full labels and a bounded page', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 900 }, hasTouch: true })
    const page = await context.newPage()
    await mockApi(page)
    await page.goto('http://localhost:4173' + url({ companies: [MATRIX_COMPANY, 'AB'], matrix: { ...initial.matrix, groupValues: ['Backend', 'Frontend', 'Unknown'] } }))
    await cell(page).tap()
    await expect(page.getByRole('complementary', { name: 'Значение ячейки' })).toContainText('50,0%')
    const region = page.getByRole('region', { name: 'Матрица аудиторий, прокручиваемая таблица' })
    await region.scrollIntoViewIfNeeded()
    const box = (await region.boundingBox())!
    const cdp = await context.newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 340, y: box.y + 90 }] })
    for (const x of [290, 220, 150, 60]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: box.y + 90 }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await context.close()
})

test('125 companies and 81 columns remain complete; a long URL keeps the full state', async ({ page, context }) => {
    const api = await mockApi(page)
    await page.route('**/api/results/audience-matrix', async route => {
        const request = route.request().postDataJSON()
        const response = audienceMatrixFixture(request)
        const availableValues = Array.from({ length: 81 }, (_, i) => ({ value: `Город ${i}`, label: `Город ${i}`, respondentCount: 1 }))
        const values: string[] = request.groupValues ?? availableValues.slice(0, 6).map(option => option.value)
        const companyNames = Array.from({ length: 125 }, (_, i) => `Полное название компании ${i}`)
        await route.fulfill({ json: { ...response, availableValues, companyNames,
            columns: values.map(value => ({ value, label: value, respondentCount: 1, companies: [] })) } })
    })
    await page.goto(url({ matrix: { ...initial.matrix, groupBy: 'cities' } }))
    await expect(table(page).getByRole('row')).toHaveCount(126)
    await page.getByRole('combobox', { name: 'Колонки', exact: true }).click()
    await page.getByRole('option', { name: 'Выбрать все', exact: true }).click()
    await closePicker(page)
    await expect(table(page).getByRole('columnheader')).toHaveCount(82)
    const before = page.url()
    await page.getByRole('combobox', { name: 'Компании', exact: true }).click()
    await page.getByRole('option', { name: 'Выбрать все', exact: true }).click()
    await closePicker(page)
    await expect(page.getByText('Ссылка слишком длинная и не сохранена в адресной строке.')).toBeVisible()
    expect(page.url()).toBe(before)
    await page.getByRole('button', { name: 'Дублировать' }).click()
    expect(context.pages()).toHaveLength(1)
    await expect(table(page).getByRole('row')).toHaveCount(126)
    expect(api.posts(isMatrix)).toHaveLength(0)
})

test('an excessive column selection preserves the current columns and URL without a request', async ({ page }) => {
    await mockApi(page)
    let requests = 0
    await page.route('**/api/results/audience-matrix', async route => {
        requests++
        const response = audienceMatrixFixture(route.request().postDataJSON())
        const availableValues = Array.from({ length: 257 }, (_, i) => ({ value: `Город ${i}`, label: `Город ${i}`, respondentCount: 1 }))
        await route.fulfill({ json: { ...response, availableValues } })
    })
    const groupValues = ['Город 0', 'Город 1']
    await page.goto(url({ matrix: { ...initial.matrix, groupBy: 'cities', groupValues } }))
    await expect(table(page).getByRole('columnheader')).toHaveCount(3)
    const before = page.url()
    await page.getByRole('combobox', { name: 'Колонки', exact: true }).click()
    await page.getByRole('option', { name: 'Выбрать все', exact: true }).click()
    await closePicker(page)
    await expect(page.getByText('Можно выбрать не более 256 колонок. Прежний выбор сохранён.')).toBeVisible()
    await expect(table(page).getByRole('columnheader')).toHaveCount(3)
    expect(JSON.parse(matrixState(page)!).groupValues).toEqual(groupValues)
    expect(page.url()).toBe(before)
    expect(requests).toBe(1)
})

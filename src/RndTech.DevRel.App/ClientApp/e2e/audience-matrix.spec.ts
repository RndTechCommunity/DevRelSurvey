import AxeBuilder from '@axe-core/playwright'
import { expect, test, Page, Locator } from '@playwright/test'
import { AudienceGroupBy } from '../src/api/types'
import { DEFAULT_STATE, LEGACY_COMPANIES, SurveyState } from '../src/app/surveyState'
import { encodeSurveyUrl } from '../src/app/surveyUrl'
import { GROUP_LABELS } from '../src/features/audience-matrix/audienceMatrix'
import { audienceMatrixFixture, MATRIX_COMPANY, MATRIX_LONG_COMPANY } from '../src/test/fixtures'
import { isMatrix, isMeta, mockApi } from './mockApi'

const initial: SurveyState = { ...DEFAULT_STATE, page: 'audience-matrix' }
const url = (patch: Partial<SurveyState> = {}) => '/' + encodeSurveyUrl({ ...initial, ...patch })
const table = (page: Page) => page.getByRole('table')
const cell = (page: Page) => table(page).getByRole('button', { name: new RegExp(`${MATRIX_COMPANY}; Backend;`) })
const tooltip = (page: Page) => page.getByRole('tooltip')
const sortColumn = (page: Page, label: string) => table(page).getByRole('columnheader', { name: new RegExp(`^${label} N =`) }).getByRole('button')
const summary = (page: Page) => page.getByRole('status').filter({ hasText: 'Выборка:' })
async function columnAction(page: Page, label: string) {
    await page.getByRole('combobox', { name: 'Колонки', exact: true }).click()
    await page.getByRole('option', { name: label, exact: true }).click()
    await closePicker(page)
}
async function clearColumns(page: Page) {
    await page.getByRole('combobox', { name: 'Колонки', exact: true }).press('Backspace')
}
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
        await expect(summary(page)).toContainText('Выборка: 3')
        await expect(page.getByRole('combobox', { name: 'Сравнить с' })).toHaveCount(0)
        await columnAction(page, 'Очистить колонки')
        await expect(table(page)).toHaveCount(0)
        await page.getByRole('combobox', { name: 'Колонки', exact: true }).click()
        await page.getByRole('option', { name: 'Выбрать все', exact: true }).click()
        await closePicker(page)
        await expect(table(page).getByRole('columnheader')).toHaveCount(expected.availableValues.length + 1)
        expect(JSON.parse(matrixState(page)!).groupValues).toEqual(expected.availableValues.map(option => option.value))
        expect(api.posts(isMatrix)).toHaveLength(3)
        await clearColumns(page)
        await expect(page.getByText('Выберите значения в поле «Колонки».', { exact: false })).toBeVisible()
        await expect(table(page)).toHaveCount(0)
        expect(JSON.parse(matrixState(page)!).groupValues).toEqual([])
        await columnAction(page, 'Начальные группы')
        await expect(table(page)).toBeVisible()
        expect(JSON.parse(matrixState(page)!).groupValues).toBeNull()
    })
}

test('local controls preserve rows, precise details and auto selection without POST', async ({ page }) => {
    const api = await mockApi(page)
    await page.goto(url())
    await cell(page).focus()
    const details = tooltip(page)
    await expect(details).toContainText('50,0% · Отметок: 1 · Ответов о компании: 2')
    await page.getByLabel('Показатель', { exact: true }).selectOption('known')
    await expect(details).toHaveCount(0)
    await cell(page).click()
    await expect(details).toContainText('100,0% · Отметок: 2')
    await sortColumn(page, 'Backend').click()
    expect(JSON.parse(matrixState(page)!).groupValues).toBeNull()
    await sortColumn(page, 'Backend').press('Enter')
    await expect(sortColumn(page, 'Backend').locator('..')).toHaveAttribute('aria-sort', 'ascending')
    await sortColumn(page, 'Backend').press('Space')
    await expect(sortColumn(page, 'Backend').locator('..')).toHaveAttribute('aria-sort', 'descending')
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
    await sortColumn(page, 'Backend').click()
    let release = () => {}
    const pending = new Promise<void>(resolve => { release = resolve })
    const remove = api.override(call => isMatrix(call) && call.body?.includes('2020') === true, pending)
    await page.getByRole('radiogroup', { name: 'Год исследования' }).getByText('2020').click()
    await expect(table(page)).toHaveCount(0)
    await expect(page.getByLabel('Цветовая шкала')).toHaveCount(0)
    await expect(summary(page)).toContainText('Выборка: …')
    await expect(tooltip(page)).toHaveCount(0)
    expect(JSON.parse(matrixState(page)!).sort.by).toBe('column')
    await page.getByRole('radiogroup', { name: 'Год исследования' }).getByText('2021').click()
    await expect(table(page).getByRole('columnheader', { name: /Только 2021/ })).toBeVisible()
    await expect(table(page).getByRole('columnheader', { name: 'Компания' })).toHaveAttribute('aria-sort', 'ascending')
    expect(JSON.parse(matrixState(page)!).sort).toEqual({ by: 'name', direction: 'asc' })
    release(); remove()
    await page.waitForTimeout(150)
    expect(api.posts(isMatrix)).toHaveLength(3)
    await expect(table(page)).toContainText('2021 · Хотят работать')
    await expect(summary(page)).toContainText('Выборка: 1')
})

test('errors and retry hide old numbers; exit aborts; explicit unknown and conflicting groups survive', async ({ page }) => {
    const api = await mockApi(page)
    await page.goto(url({ filter: { ...initial.filter, professions: ['Backend'] },
        matrix: { ...initial.matrix, groupValues: ['Frontend', 'Unknown'] } }))
    await expect(table(page).getByRole('columnheader', { name: 'Unknown N = 0' })).toBeVisible()
    await expect(page.getByText('Есть колонки с N = 0.', { exact: false })).toBeVisible()
    await page.getByRole('button', { name: /Убрать ограничение «Профессия»/ }).click()
    await expect(table(page).getByRole('columnheader', { name: 'Frontend N = 1' })).toBeVisible()
    await sortColumn(page, 'Frontend').click()
    await page.getByRole('combobox', { name: 'Колонки', exact: true }).click()
    await page.getByRole('option', { name: 'Frontend', exact: true }).click()
    await expect(page.getByRole('option', { name: 'Unknown (нет в справочнике)', exact: true })).toBeVisible()
    await closePicker(page)
    await expect(table(page).getByRole('columnheader', { name: 'Компания' })).toHaveAttribute('aria-sort', 'ascending')
    for (const code of [400, 413, 500]) {
        const remove = api.override(isMatrix, code)
        await page.getByLabel('Группировать по').selectOption('cities')
        await expect(page.getByText('Не удалось загрузить данные.', { exact: false })).toBeVisible()
        await expect(table(page)).toHaveCount(0)
        await expect(summary(page)).toContainText('Выборка: не удалось загрузить')
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
            const controls = page.getByLabel('Группировать по').locator('../..')
            const fields = await controls.locator(':scope > div').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().top))
            if (width >= 1224) {
                expect(Math.max(...fields) - Math.min(...fields)).toBeLessThanOrEqual(2)
                expect((await controls.boundingBox())!.height).toBeLessThanOrEqual(80)
            }
            const region = table(page).locator('..')
            expect(await region.evaluate(el => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(1)
            expect(await table(page).getByRole('rowheader', { name: 'AB', exact: true }).evaluate(el => el.parentElement!.getBoundingClientRect().height)).toBeLessThanOrEqual(42)
            const styles = await table(page).locator('tbody button').evaluateAll(buttons => buttons.map(button => {
                const css = getComputedStyle(button)
                const rgb = css.backgroundColor.match(/\d+/g)!.map(Number).map(value => {
                    const x = value / 255
                    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
                })
                return { color: css.color, contrast: (rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 + .05) / .05 }
            }))
            expect(styles.every(style => style.color === 'rgb(0, 0, 0)' && style.contrast >= 4.5)).toBe(true)
            await page.screenshot({ path: testInfo.outputPath(`initial-${theme}-${width}.png`), fullPage: true })
            await cell(page).focus()
            await page.keyboard.press('Enter')
            await expect(tooltip(page)).toContainText('Ответов о компании: 2')
            await page.keyboard.press('Escape')
            await expect(tooltip(page)).toHaveCount(0)
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
            await active.evaluate(button => window.scrollBy(0, button.getBoundingClientRect().top - button.closest('table')!.tHead!.getBoundingClientRect().height - 15))
            await page.keyboard.press('Shift+Tab')
            await expectCellVisible(table(page).locator('tbody button').nth(34))
            const beforeScroll = await page.evaluate(() => scrollY)
            await page.mouse.move(width - 5, 450)
            await page.mouse.wheel(0, -500)
            await page.waitForTimeout(350)
            const afterScroll = await page.evaluate(() => scrollY)
            expect(afterScroll).toBeLessThan(beforeScroll - 100)
            expect(await region.evaluate(el => el.scrollTop)).toBe(0)
            await expect(table(page).locator('tbody button').nth(34)).toBeFocused()
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
            await page.keyboard.press('Escape')
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

for (const theme of ['light', 'dark'] as const) test(`touch cell and horizontal gesture in ${theme}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 900 }, hasTouch: true, colorScheme: theme })
    const page = await context.newPage()
    await mockApi(page)
    await page.goto('http://localhost:4173' + url({ companies: [MATRIX_COMPANY, 'AB'], matrix: { ...initial.matrix, groupValues: ['Backend', 'Frontend', 'Unknown'] } }))
    await cell(page).tap()
    await expect(tooltip(page)).toContainText('50,0%')
    expect((await cell(page).boundingBox())!.height).toBeGreaterThanOrEqual(44)
    await page.getByRole('heading', { name: 'Матрица аудиторий', exact: true }).tap()
    await expect(tooltip(page)).toHaveCount(0)
    await cell(page).tap()
    await expect(tooltip(page)).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expect(tooltip(page)).toHaveCount(0)
    const region = page.getByRole('region', { name: 'Матрица аудиторий, прокручиваемая таблица' })
    await cell(page).scrollIntoViewIfNeeded()
    const box = (await cell(page).boundingBox())!
    const start = { x: Math.min(382, box.x + box.width - 8), y: box.y + box.height / 2 }
    expect(await cell(page).evaluate((button, point) => button.contains(document.elementFromPoint(point.x, point.y)), start)).toBe(true)
    const cdp = await context.newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] })
    for (const distance of [50, 120, 190, 280]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x - distance, y: start.y }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.getByRole('combobox', { name: 'Колонки', exact: true }).tap()
    await page.getByRole('option', { name: 'Начальные группы', exact: true }).tap()
    expect(JSON.parse(matrixState(page)!).groupValues).toBeNull()
    await context.close()
})

test('125 companies and 81 columns remain complete with full state', async ({ page, context }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    const api = await mockApi(page)
    await page.route('**/tag.js', route => route.fulfill({ body: '', contentType: 'application/javascript' }))
    await page.route('**/api/results/audience-matrix', async route => {
        const request = route.request().postDataJSON()
        const response = audienceMatrixFixture(request)
        const availableValues = Array.from({ length: 81 }, (_, i) => ({ value: `Город ${i}`, label: `Город ${i}`, respondentCount: 1 }))
        const values: string[] = request.groupValues ?? availableValues.slice(0, 6).map(option => option.value)
        const companyNames = Array.from({ length: 125 }, (_, i) => `Полное название компании ${i}`)
        await route.fulfill({ json: { ...response, availableValues, companyNames,
            columns: values.map(value => ({ value, label: value, respondentCount: 1, companies: companyNames.map((name, index) => ({ ...response.baseCompanies[0], name, selectionCount: 125, wantedVotes: index + 1 })) })) } })
    })
    await page.goto(url({ matrix: { ...initial.matrix, groupBy: 'cities' } }))
    await expect(table(page).getByRole('row')).toHaveCount(126)
    await page.getByRole('combobox', { name: 'Колонки', exact: true }).click()
    await page.getByRole('option', { name: 'Выбрать все', exact: true }).click()
    await closePicker(page)
    await expect(table(page).getByRole('columnheader')).toHaveCount(82)
    await expect(table(page).locator('tbody button')).toHaveCount(10125)
    await expect(table(page).locator('tbody button').first()).not.toHaveText('—')
    await table(page).locator('tbody button').first().click()
    await expect(tooltip(page)).toContainText('Ответов о компании: 125')
    await page.keyboard.press('Escape')
    await table(page).locator('thead button').nth(1).click()
    await expect(table(page).getByRole('rowheader').first()).toHaveText('Полное название компании 124')
    await expect(table(page).locator('tbody button')).toHaveCount(10125)
    expect(errors).toEqual([])
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

test('one current batch owns N across meta failure, A-B-A loading and empty columns', async ({ page }) => {
    const api = await mockApi(page)
    let metaFails = false
    await page.route('**/api/results/meta', route => metaFails ? route.fulfill({ status: 503, body: '' })
        : route.fulfill({ json: { total: { count2022: 99999 }, filtered: { count2022: 99999 }, sources: {} } }))
    await page.goto(url())
    await expect(summary(page)).toContainText('Выборка: 3')
    await cell(page).click()
    let releaseB = () => {}
    let releaseA = () => {}
    const removeB = api.override(call => isMatrix(call) && JSON.parse(call.body!).year === 2020, new Promise<void>(resolve => { releaseB = resolve }))
    const removeA = api.override(call => isMatrix(call) && JSON.parse(call.body!).year === 2022, new Promise<void>(resolve => { releaseA = resolve }))
    await page.getByRole('radiogroup', { name: 'Год исследования' }).getByText('2020').click()
    await expect(summary(page)).toContainText('Выборка: …')
    await page.getByRole('radiogroup', { name: 'Год исследования' }).getByText('2022').click()
    await expect(summary(page)).toContainText('Выборка: …')
    await expect(table(page)).toHaveCount(0)
    await expect(tooltip(page)).toHaveCount(0)
    releaseA(); removeA()
    await expect(summary(page)).toContainText('Выборка: 3')
    releaseB(); removeB()
    await expect(table(page)).toContainText('2022 · Хотят работать')
    expect(api.posts(isMatrix)).toHaveLength(3)
    metaFails = true
    await page.getByRole('button', { name: 'Сбросить ограничения' }).click()
    await expect(summary(page)).toContainText('Выборка: 3')
    await expect(table(page)).toBeVisible()
    expect(api.posts(isMatrix)).toHaveLength(4)
    expect(api.posts(call => !isMatrix(call) && !isMeta(call))).toHaveLength(2)
    await clearColumns(page)
    await expect(table(page)).toHaveCount(0)
    await expect(summary(page)).toContainText('Выборка: 3')
    expect(api.posts(isMatrix)).toHaveLength(5)
})

test('empty auto can be cleared and restored with the keyboard action', async ({ page }) => {
    const api = await mockApi(page)
    await page.goto(url({ filter: { ...initial.filter, cities: ['Нет-такого'] } }))
    await expect(summary(page)).toContainText('Выборка: 0')
    const picker = page.getByRole('combobox', { name: 'Колонки', exact: true })
    for (const label of ['Очистить колонки', 'Начальные группы']) {
        await picker.press('Enter')
        await expect(page.getByRole('textbox', { name: 'Поиск', exact: true })).toBeFocused()
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowDown')
        await expect(page.getByRole('option', { name: label, exact: true })).toBeFocused()
        await page.keyboard.press('Enter')
        await page.keyboard.press('Escape')
        await expect(picker).toBeFocused()
        expect(JSON.parse(matrixState(page)!).groupValues).toEqual(label === 'Очистить колонки' ? [] : null)
    }
    await expect.poll(() => api.posts(isMatrix).length).toBe(3)
})

for (const theme of ['light', 'dark'] as const) {
    for (const openingDelay of [0, 240]) test(`tooltip survives resize at ${openingDelay} ms and repeated resize in ${theme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme })
        const api = await mockApi(page)
        await page.goto(url({ matrix: { ...initial.matrix, groupValues: ['Backend', 'Unknown', 'Frontend'] } }))
        await cell(page).click()
        if (openingDelay) await page.waitForTimeout(openingDelay)
        await page.setViewportSize({ width: 390, height: 900 })
        await cell(page).focus()
        await cell(page).press('Enter')
        for (const repeated of [false, true]) {
            if (repeated) {
                for (const width of [430, 390, 420, 390]) await page.setViewportSize({ width, height: 900 })
            }
            await expect(tooltip(page)).toHaveCSS('opacity', '1')
            await page.waitForTimeout(1200)
            const bounds = (await tooltip(page).boundingBox())!
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
            expect(await tooltip(page).boundingBox()).toEqual(bounds)
            expect(bounds.x).toBeGreaterThanOrEqual(0)
            expect(bounds.y).toBeGreaterThanOrEqual(0)
            expect(bounds.x + bounds.width).toBeLessThanOrEqual(390)
            expect(bounds.y + bounds.height).toBeLessThanOrEqual(900)
            expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
            await expect(tooltip(page)).toContainText('50,0% · Отметок: 1 · Ответов о компании: 2')
            await expectCellVisible(cell(page))
        }
        expect(api.posts(isMatrix)).toHaveLength(1)
    })
    test(`tooltip lifecycle and palette in ${theme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme })
        await mockApi(page)
        await page.goto(url({ matrix: { ...initial.matrix, groupValues: ['Backend', 'Unknown', 'Frontend'] } }))
        const button = cell(page)
        await button.scrollIntoViewIfNeeded()
        await page.waitForTimeout(200)
        await button.hover()
        await expect(tooltip(page)).toContainText('50,0% · Отметок: 1 · Ответов о компании: 2')
        const normal = await button.evaluate(el => ({ color: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor }))
        await expect(tooltip(page)).toHaveCSS('opacity', '1')
        await tooltip(page).hover()
        await page.waitForTimeout(250)
        await expect(tooltip(page)).toBeVisible()
        await button.focus()
        await page.mouse.move(1, 1)
        await page.waitForTimeout(250)
        await expect(tooltip(page)).toBeVisible()
        expect(await button.evaluate(el => ({ color: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor }))).toEqual(normal)
        expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
        await page.keyboard.press('Escape')
        await expect(tooltip(page)).toHaveCount(0)
        await expect(button).toBeFocused()
        await page.waitForTimeout(250)
        await expect(tooltip(page)).toHaveCount(0)
        await button.press('Space')
        await expect(tooltip(page)).toContainText('Отметок: 1')
        await table(page).getByRole('button', { name: new RegExp(`${MATRIX_COMPANY}; Unknown;`) }).hover()
        await expect(tooltip(page)).toHaveCount(1)
        await expect(tooltip(page)).toContainText('Нет данных')
        await page.getByRole('heading', { name: 'Матрица аудиторий', exact: true }).click()
        await expect(tooltip(page)).toHaveCount(0)
        await button.click()
        await page.setViewportSize({ width: 390, height: 900 })
        await button.focus()
        await button.press('Enter')
        await expect(tooltip(page)).toHaveCSS('opacity', '1')
        await expect(async () => {
            const bounds = await tooltip(page).boundingBox()
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
            expect(await tooltip(page).boundingBox()).toEqual(bounds)
            expect(bounds!.x).toBeGreaterThanOrEqual(0)
            expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
            expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
        }).toPass({ timeout: 5000 })
        await table(page).locator('..').evaluate(el => { el.scrollLeft = el.scrollWidth })
        await expect(tooltip(page)).toHaveCount(0)
    })
}

test('legacy base links normalize on changes and survive browser history', async ({ page }) => {
    await mockApi(page)
    const params = new URLSearchParams(encodeSurveyUrl({ ...initial, companies: [MATRIX_COMPANY, 'Missing'] }))
    params.set('matrix', JSON.stringify({ ...initial.matrix, sort: { by: 'base', direction: 'desc' } }))
    await page.goto('/?' + params)
    await expect(table(page).getByRole('columnheader', { name: 'Компания' })).toHaveAttribute('aria-sort', 'ascending')
    await expect(page.getByRole('alert')).toHaveCount(0)
    await page.getByRole('radiogroup', { name: 'Год исследования' }).getByText('2021').click()
    expect(JSON.parse(matrixState(page)!).sort).toEqual({ by: 'name', direction: 'asc' })
    await page.goBack()
    expect(JSON.parse(matrixState(page)!).sort.by).toBe('base')
    await expect(table(page).getByRole('columnheader', { name: 'Компания' })).toHaveAttribute('aria-sort', 'ascending')
    await page.goForward()
    await expect(table(page).getByRole('rowheader')).toHaveCount(2)
})

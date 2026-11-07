import { expect, Page, test } from '@playwright/test'
import { companyResults } from '../src/test/fixtures'
import { INITIAL_FILTER, isCompanies, mockApi } from './mockApi'

// Инварианты, общие для исходного и переработанного интерфейса.

const WIDTHS = [390, 768, 1223, 1224, 1225, 1440]

const yearRadio = (page: Page, year: string) =>
    page.getByRole('radiogroup', { name: 'Год исследования' }).getByRole('radio', { name: year })
// Поле radio скрыто библиотекой, щёлкаем по подписи года.
const selectYear = (page: Page, year: string) =>
    page.getByRole('radiogroup', { name: 'Год исследования' }).getByText(year, { exact: true }).click()

function rowCells(page: Page, name: string) {
    return page.locator('.rs-table-row').filter({ hasText: name }).first().locator('.rs-table-cell')
}

const horizontalOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)

// Координата деления оси графика с подписью label, в единицах SVG.
async function tickAt(page: Page, axis: 'x' | 'y', label: string) {
    const tick = page.locator(`.recharts-${axis}Axis-tick-labels .recharts-cartesian-axis-tick-value`)
        .filter({ hasText: new RegExp(`^${label}$`) })
    return Number(await tick.getAttribute(axis))
}

test.describe('desktop 1440', () => {
    test.use({ viewport: { width: 1440, height: 900 } })

    test('opens 2022 for the initial group and shows company values', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto('/')

        await expect(page.getByText('2022 · Ростов-на-Дону, 20–44 года · Выборка: 100 из 600')).toBeVisible()
        expect(api.posts(isCompanies)[0].body).toBe(JSON.stringify(INITIAL_FILTER))
        await expect(yearRadio(page, '2022')).toBeChecked()
        await expect(rowCells(page, 'IBS Dunice')).toHaveText(['IBS Dunice', '40%', '10%', '5%', '15%', '95', '60'])

        // График не добавляет остановку Tab между controls и таблицей.
        const companyHeader = page.getByRole('columnheader', { name: 'Компания' })
        const focusedTags: string[] = []
        while (focusedTags.length < 60 && !await companyHeader.evaluate(header => header === document.activeElement)) {
            await page.keyboard.press('Tab')
            focusedTags.push(await page.evaluate(() => document.activeElement?.tagName ?? ''))
        }
        await expect(companyHeader).toBeFocused()
        expect(focusedTags).not.toContain('svg')
    })

    test('places company points by their values and shows their numbers on hover', async ({ page }) => {
        await mockApi(page)
        await page.goto('/')
        const points = page.locator('[data-company]')
        await expect(points).toHaveCount(5)

        const [x10, x100, y0, y120] = await Promise.all([
            tickAt(page, 'x', '10 %'), tickAt(page, 'x', '100 %'), tickAt(page, 'y', '0 %'), tickAt(page, 'y', '120 %')
        ])
        for (const name of await points.evaluateAll(groups => groups.map(g => g.getAttribute('data-company') ?? ''))) {
            const row = companyResults.find(r => r.year === 2022 && r.name === name)!
            const center = page.locator(`[data-company="${name}"] circle`).first()
            const cx = Number(await center.getAttribute('cx'))
            const cy = Number(await center.getAttribute('cy'))
            expect(Math.abs(cx - (x10 + (row.knownLevel - 0.1) * (x100 - x10) / 0.9)), name).toBeLessThanOrEqual(1)
            expect(Math.abs(cy - (y0 + (row.goodLevel + row.wantedLevel) * (y120 - y0) / 1.2)), name).toBeLessThanOrEqual(1)
        }

        await page.locator('[data-company="IBS Dunice"]').hover()
        await expect(page.getByRole('tooltip')).toHaveText(
            'Знают: 40 человек, 40%Рекомендуют: 10 человек, 10%Хотят работать: 5 человек, 5%')
    })

    test('switches the year without a new request', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto('/')
        await expect(page.getByText('Выборка: 100 из 600')).toBeVisible()
        const posts = api.posts().length

        await selectYear(page, '2019')

        await expect(page.getByText('Выборка: 50 из 300')).toBeVisible()
        await expect(rowCells(page, 'Контур')).toHaveText(['Контур', '25%', '5%', '2.5%', '7.5%', '52.5', '42.9'])
        expect(api.posts()).toHaveLength(posts)
    })

    test('shows the sample composition of the selected year', async ({ page }) => {
        await mockApi(page)
        await page.goto('/')
        await page.getByRole('button', { name: 'Состав выборки' }).click()

        await expect(page.getByRole('columnheader', { name: 'Язык программирования' })).toBeVisible()
        await expect(rowCells(page, 'JavaScript')).toHaveText(['JavaScript', '70 (70%)'])
        // Полоса скрыта от экранного диктора, её длина — доля от ширины дорожки.
        const barShare = await rowCells(page, 'JavaScript').locator('[aria-hidden="true"]').evaluate(track =>
            track.firstElementChild!.getBoundingClientRect().width / track.getBoundingClientRect().width)
        expect(barShare).toBeCloseTo(0.7, 2)
        await selectYear(page, '2019')
        await expect(rowCells(page, 'JavaScript')).toHaveText(['JavaScript', '30 (60%)'])
        await expect(page.getByRole('columnheader', { name: '2019 · 50 из 300' }).first()).toBeVisible()
    })

    test('opens a legacy link of 2020', async ({ page }) => {
        const api = await mockApi(page)
        await page.goto(`/?tab=${encodeURIComponent('"known-and-wanted-2020"')}`
            + `&filter=${encodeURIComponent(JSON.stringify(INITIAL_FILTER))}`)

        await expect(page.getByText('Выборка: 80 из 400')).toBeVisible()
        await expect(yearRadio(page, '2020')).toBeChecked()
        expect(api.posts(isCompanies)[0].body).toBe(JSON.stringify(INITIAL_FILTER))
    })
})

test('mobile 390 shows the summary of the initial group', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    const api = await mockApi(page)
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Исследование Ростовского ИТ-сообщества' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('100')
    await expect(page.getByRole('radiogroup', { name: 'Год исследования' })).toHaveCount(0)
    expect(api.posts(isCompanies)[0].body).toBe(JSON.stringify(INITIAL_FILTER))
})

test('screenshots of the initial page', async ({ page }) => {
    await mockApi(page)
    for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 })
        await page.goto('/')
        await expect(page.getByText(/Выборка: 100|Всего участников/).first()).toBeVisible()
        if (width < 1224) {
            await expect(page.locator('.recharts-pie-labels')).toHaveCount(2)
            await expect(page.locator('.recharts-label-list')).toHaveCount(2)
        } else {
            // Карта и таблицы занимают ширину контейнера: страница не прокручивается по горизонтали.
            await expect(page.getByRole('columnheader', { name: 'Компания' })).toBeVisible()
            expect(await horizontalOverflow(page), `companies ${width}`).toBe(0)
            await page.getByRole('button', { name: 'Состав выборки' }).click()
            await expect(page.getByRole('columnheader', { name: 'Город' })).toBeVisible()
            expect(await horizontalOverflow(page), `sample ${width}`).toBe(0)
            await page.getByRole('button', { name: 'Компании', exact: true }).click()
        }
        await test.info().attach(`initial-${width}.png`, {
            body: await page.screenshot({ fullPage: true }),
            contentType: 'image/png'
        })
    }
})

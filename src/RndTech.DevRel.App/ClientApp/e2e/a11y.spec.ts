import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { companyResults } from '../src/test/fixtures'
import { INITIAL_FILTER, isCompanies, isMeta, mockApi } from './mockApi'

for (const [width, colorScheme] of [[390, 'light'], [390, 'dark'], [1440, 'light'], [1440, 'dark']] as const) {
    test(`accessible ${colorScheme} pages and filters at ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.emulateMedia({ colorScheme })
        const api = await mockApi(page)
        await page.route('**/api/results/known-and-wanted', route => route.fulfill({
            json: [...companyResults, ...Array.from({ length: 16 }, (_, i) => ({ ...companyResults[0], name: `Тестовая компания ${i}` }))]
        }))
        await page.goto('/?v=1&companies=[]&compareYear=2021')
        await expect(page.getByText('Выборка: 100 из 600')).toBeVisible()
        const scan = async (openCheckPicker = false) => {
            const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
            // RSuite 6 CheckPicker вкладывает checkbox в option; публичного API для устранения нет.
            // Исключение только для этих узлов открытого списка и только для nested-interactive.
            const failures = []
            for (const violation of result.violations) {
                for (const node of violation.nodes) {
                    const known = openCheckPicker && violation.id === 'nested-interactive'
                        && node.target.length === 1 && typeof node.target[0] === 'string'
                        && await page.locator(node.target[0]).evaluate(element =>
                            element.matches('[role="listbox"][aria-multiselectable="true"] > [role="option"]')
                            && element.querySelectorAll('input[type="checkbox"]').length === 1
                            && !element.querySelector('a, button, input:not([type="checkbox"]), [tabindex="0"]:not(input[type="checkbox"])'))
                    if (!known) failures.push({ id: violation.id, node })
                }
            }
            expect(failures).toEqual([])
        }
        for (const section of ['Компании', 'Состав выборки', 'О данных']) {
            await page.getByRole('navigation', { name: 'Разделы' }).getByRole('button', { name: section, exact: true }).click()
            await scan()
            if (section === 'Компании') {
                await page.getByRole('combobox', { name: 'Найти компанию', exact: true }).click()
                await expect(page.getByRole('searchbox')).toBeFocused()
                await scan()
                await page.getByRole('option', { name: 'Тинькофф', exact: true }).click()
                await expect(page.locator('[data-company] text')).toHaveText('Тинькофф')
                await expect(page.getByRole('complementary', { name: 'Карточка компании' })).toContainText('Ответили на вопрос о компании: 6')
                await scan()
                await page.getByRole('radiogroup', { name: 'Вид', exact: true }).getByText('Таблица').click()
                await scan()
            }
        }
        await page.getByRole('button', { name: 'Компании', exact: true }).click()
        if (width < 1224) {
            await page.getByRole('button', { name: 'Фильтры · 2' }).click()
            await expect(page.getByRole('dialog')).toBeVisible()
            await page.getByRole('dialog').evaluate(async element => {
                await Promise.all(element.getAnimations({ subtree: true }).map(animation => animation.finished))
            })
            await scan()
        }
        await page.getByRole('combobox', { name: 'Город', exact: true }).click()
        await expect(page.getByRole('textbox', { name: 'Поиск' })).toBeFocused()
        await scan(true)
        await page.keyboard.press('Escape')
        if (width < 1224) await page.keyboard.press('Escape')
        await page.unroute('**/api/results/known-and-wanted')
        await page.goto(`/?v=1&filter=${encodeURIComponent(JSON.stringify({ ...INITIAL_FILTER, cities: ['Нет-такого'] }))}`)
        await expect(page.getByText('Нет данных о компаниях за 2022 год')).toBeVisible()
        await scan()
        api.override(call => isCompanies(call) || isMeta(call), 500)
        await page.goto('/?v=1&companies=[]&compareYear=2021')
        await expect(page.getByText('Не удалось загрузить данные.').first()).toBeVisible()
        await scan()
    })
}

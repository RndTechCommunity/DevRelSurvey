import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { companyResults } from '../src/test/fixtures'
import { mockApi } from './mockApi'

for (const width of [390, 1440]) {
    test(`accessible pages and filters at ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await mockApi(page)
        await page.route('**/api/results/known-and-wanted', route => route.fulfill({
            json: [...companyResults, ...Array.from({ length: 16 }, (_, i) => ({ ...companyResults[0], name: `Тестовая компания ${i}` }))]
        }))
        await page.goto('/')
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
        }
        await page.getByRole('button', { name: 'Компании', exact: true }).click()
        if (width < 1224) {
            await page.getByRole('button', { name: 'Фильтры · 2' }).click()
            await expect(page.getByRole('dialog')).toBeVisible()
            await scan()
        }
        await page.getByRole('combobox', { name: 'Город', exact: true }).click()
        await expect(page.getByRole('textbox', { name: 'Поиск' })).toBeFocused()
        await scan(true)
    })
}

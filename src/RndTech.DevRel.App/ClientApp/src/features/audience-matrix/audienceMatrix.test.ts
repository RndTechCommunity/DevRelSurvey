import { DEFAULT_FILTER } from '../filters/model'
import { audienceMatrixFixture, MATRIX_COMPANY } from '../../test/fixtures'
import { effectiveMatrixMetric, matrixColor, matrixMaximum, matrixRows } from './audienceMatrix'

const data = audienceMatrixFixture({ year: 2022, filter: DEFAULT_FILTER, groupBy: 'professions', groupValues: ['Backend', 'Unknown'] })

test('company denominators, real zero, absent company and N0 stay distinct', () => {
    const rows = matrixRows(data, [MATRIX_COMPANY, 'AB', 'Только 2021'], 'wanted', { by: 'name', direction: 'asc' })
    expect(rows.find(row => row.name === MATRIX_COMPANY)).toMatchObject({
        cells: [{ votes: 1, companyN: 2, share: 0.5 }, null]
    })
    expect(rows.find(row => row.name === 'AB')?.cells[0]?.share).toBe(0)
    expect(rows.find(row => row.name === 'Только 2021')?.cells).toEqual([null, null])
    expect(matrixRows(data, [], 'wanted', { by: 'name', direction: 'desc' })).toHaveLength(18)
})

test('numeric sort uses unrounded shares, name ties and missing last in both directions', () => {
    const a = data.columns[0].companies[0]
    const modified = { ...data, columns: [{ ...data.columns[0], companies: [
        { ...a, name: 'B', selectionCount: 10000, wantedVotes: 5002 },
        { ...a, name: 'A', selectionCount: 10000, wantedVotes: 5001 },
        { ...a, name: 'C', selectionCount: 10000, wantedVotes: 5002 },
        { ...a, name: 'Invalid', selectionCount: 0 }
    ] }] }
    const selected = ['Missing', 'C', 'A', 'B', 'Invalid']
    for (const direction of ['asc', 'desc'] as const) {
        expect(matrixRows(modified, selected, 'wanted', { by: 'column', value: 'Backend', direction }).map(row => row.name))
            .toEqual(direction === 'asc' ? ['A', 'B', 'C', 'Invalid', 'Missing'] : ['B', 'C', 'A', 'Invalid', 'Missing'])
    }
    expect(matrixRows(data, ['B', 'A'], 'wanted', { by: 'name', direction: 'desc' }).map(row => row.name)).toEqual(['B', 'A'])
})

test('scale uses shown cells; zero, no data, invalid numbers and 2019 fallback', () => {
    expect(matrixMaximum(matrixRows(data, ['AB'], 'wanted', { by: 'name', direction: 'asc' }))).toBe(0)
    expect(matrixMaximum(matrixRows(data, ['Missing'], 'wanted', { by: 'name', direction: 'desc' }))).toBeNull()
    expect(matrixMaximum(matrixRows(data, [], 'wanted', { by: 'name', direction: 'desc' }))).toBe(0.5)
    for (const wantedVotes of [NaN, Infinity]) {
        const invalid = { ...data, columns: [{ ...data.columns[0], companies: [{ ...data.columns[0].companies[0], wantedVotes }] }] }
        expect(matrixRows(invalid, [MATRIX_COMPANY], 'wanted', { by: 'name', direction: 'desc' })[0].cells[0]).toBeNull()
    }
    expect(effectiveMatrixMetric('good', 2019)).toBe('wanted')
    expect(effectiveMatrixMetric('known', 2019)).toBe('known')
    expect(effectiveMatrixMetric('good', 2020)).toBe('good')
})

test('palette always uses black text with contrast at least 4.5', () => {
    for (let i = 0; i <= 65536; i++) {
        const style = matrixColor(i / 65536, 1)
        const channels = style.backgroundColor.match(/\d+/g)!.map(Number).map(value => {
            const x = value / 255
            return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
        })
        const l = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
        expect(style.color).toBe('#000')
        expect((l + 0.05) / 0.05).toBeGreaterThanOrEqual(4.5)
    }
    expect(matrixColor(0, 0)).toEqual(matrixColor(0, 1))
})

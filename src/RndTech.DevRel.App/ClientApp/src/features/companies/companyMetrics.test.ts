import { CompanyResult } from '../../api/types'
import { formatIndex } from '../../shared/format'
import { companyResults } from '../../test/fixtures'
import {
    chartY,
    selectCompanyRows,
    selectMapRows,
    toCompanyMetrics,
    yAxisMax
} from './companyMetrics'

const both = { showGood: true, showWanted: true }

function row(name: string, year: number): CompanyResult {
    const result = companyResults.find(r => r.name === name && r.year === year)
    if (!result) {
        throw new Error(`${name} ${year} is not in fixtures`)
    }
    return result
}

test('40 known, 10 good and 5 wanted of 100 respondents give the published values', () => {
    const metrics = toCompanyMetrics(row('IBS Dunice', 2022))

    expect(metrics.known).toBe(0.4)
    expect(metrics.good).toBe(0.1)
    expect(metrics.wanted).toBe(0.05)
    expect(metrics.goodAndWanted).toBeCloseTo(0.15, 10)
    expect(formatIndex(metrics.brandPower)).toBe('95')
    expect(formatIndex(metrics.brandRating)).toBe('60')
})

test('the brand rating is undefined when its denominator is not positive', () => {
    expect(toCompanyMetrics(row('Почтатех', 2022)).brandRating).toBeNull()
    expect(toCompanyMetrics(row('Тинькофф', 2022)).brandRating).toBeNull()
})

test('chartY sums enabled shares in 2022 and uses only wanted in 2019', () => {
    const company = row('IBS Dunice', 2022)
    const company2019 = { ...company, year: 2019 }

    expect(chartY(company, both)).toBeCloseTo(0.15, 10)
    expect(chartY(company2019, both)).toBe(0.05)
    expect(chartY(company2019, { showGood: true, showWanted: false })).toBe(0.05)
    expect(chartY(company, { showGood: false, showWanted: false })).toBe(0)
})

test('the 2019 axis domain still uses good + wanted', () => {
    expect(yAxisMax(selectCompanyRows(companyResults, 2019), both)).toBeCloseTo(0.2 + 0.24 + 0.05, 10)
})

test('the axis domain of a year without rows is finite', () => {
    expect(yAxisMax([], both)).toBe(0.05)
})

test('rows of a year keep absent companies absent and do not mutate the input', () => {
    expect(selectCompanyRows(companyResults, 2021).map(r => r.name)).toEqual(['IBS Dunice', 'Тинькофф', 'Zero Corp'])
})

test('map rows: an empty selection means all companies, names are the original identifiers', () => {
    const rows2022 = selectCompanyRows(companyResults, 2022)

    expect(selectMapRows(rows2022, [])).toEqual(rows2022)
    expect(selectMapRows(rows2022, ['ИТРУМ (ex Exceed Team)', 'Контур', 'Zero Corp']).map(r => r.name))
        .toEqual(['Контур', 'ИТРУМ (ex Exceed Team)'])
    expect(selectMapRows(rows2022, ['ИТРУМ\u00A0(ex\u00A0Exceed\u00A0Team)'])).toEqual([])
})

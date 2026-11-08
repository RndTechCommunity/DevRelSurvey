import { CompanyResult } from '../../api/types'
import { formatIndex, toPercent } from '../../shared/format'
import { companyResults } from '../../test/fixtures'
import {
    chartMetric,
    hasWantedOnlyYear,
    metricValue,
    nearbyCompanies,
    selectCompanyRows,
    restrictCompanies,
    toCompanyMetrics,
    yAxisScale
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

test('the metric respects the 2019 rule without changing the stored flags', () => {
    expect(chartMetric(both, [2022])).toBe('goodAndWanted')
    expect(chartMetric({ showGood: true, showWanted: false }, [2022])).toBe('good')
    expect(chartMetric({ showGood: false, showWanted: true }, [2022])).toBe('wanted')
    expect(chartMetric(both, [2019])).toBe('wanted')
    expect(chartMetric({ showGood: true, showWanted: false }, [2019])).toBe('wanted')
    expect(chartMetric(both, [2022, 2019])).toBe('wanted')
    expect(chartMetric({ showGood: false, showWanted: false }, [2019])).toBeNull()
    expect(chartMetric({ showGood: false, showWanted: false }, [2022])).toBeNull()
    expect(hasWantedOnlyYear([2022, 2019])).toBe(true)
    expect(hasWantedOnlyYear([2022])).toBe(false)
    const company = row('IBS Dunice', 2022)
    expect(metricValue(company, 'goodAndWanted')).toBeCloseTo(0.15, 10)
    expect(metricValue(company, 'good')).toBe(0.1)
    expect(metricValue(company, 'wanted')).toBe(0.05)
})

test('axis ticks are even, distinct and end strictly above the shown metric, including exact step multiples', () => {
    const rows2019 = selectCompanyRows(companyResults, 2019)
    expect(yAxisScale(rows2019, 'wanted').max).toBe(0.25)
    for (const maximum of [0.3, 0.24, 0, 4 / 3]) {
        const scale = yAxisScale([{ ...row('IBS Dunice', 2022), goodLevel: maximum / 2, wantedLevel: maximum / 2 }], 'goodAndWanted')
        expect(scale.max - maximum).toBeGreaterThan(1e-9)
        expect(scale.ticks.at(-1)).toBe(scale.max)
        expect(scale.ticks.length).toBeLessThanOrEqual(11)
        expect(new Set(scale.ticks.map(toPercent)).size).toBe(scale.ticks.length)
        scale.ticks.slice(1).forEach((tick, i) => expect(tick - scale.ticks[i]).toBeCloseTo(scale.ticks[1], 10))
    }
    expect(yAxisScale([{ ...row('IBS Dunice', 2022), wantedLevel: 0.3 }], 'wanted').max).toBeCloseTo(0.35, 10)
    expect(yAxisScale([], 'wanted')).toEqual({ max: 0.05, ticks: [0, 0.01, 0.02, 0.03, 0.04, 0.05] })
})

test('rows of a year keep absent companies absent and do not mutate the input', () => {
    expect(selectCompanyRows(companyResults, 2021).map(r => r.name)).toEqual(['IBS Dunice', 'Тинькофф', 'Zero Corp'])
})

test('company restriction: an empty selection means all companies, names are the original identifiers', () => {
    const rows2022 = selectCompanyRows(companyResults, 2022)

    expect(restrictCompanies(rows2022, [])).toEqual(rows2022)
    expect(restrictCompanies(rows2022, ['ИТРУМ (ex Exceed Team)', 'Контур', 'Zero Corp']).map(r => r.name))
        .toEqual(['Контур', 'ИТРУМ (ex Exceed Team)'])
    expect(restrictCompanies(rows2022, ['ИТРУМ\u00A0(ex\u00A0Exceed\u00A0Team)'])).toEqual([])
})

test('nearby companies keep the ellipse boundary and order by distance without mutating points', () => {
    const target = { knownLevel: 0, metricValue: 0 }
    const coincident = { ...target }
    const horizontal = { knownLevel: 2, metricValue: 0 }
    const vertical = { knownLevel: 0, metricValue: 1 }
    const diagonal = { knownLevel: 1.2, metricValue: 0.8 }
    const outside = { knownLevel: 1.21, metricValue: 0.8 }
    const near = { knownLevel: 0.4, metricValue: 0.1 }
    const farther = { knownLevel: 1, metricValue: 0.4 }
    const points = Object.freeze([horizontal, farther, outside, coincident, near, vertical, target, diagonal].map(point => Object.freeze(point)))
    expect(nearbyCompanies(points, target, { x: 2, y: 1 }))
        .toEqual([coincident, target, near, farther, horizontal, vertical, diagonal])
    expect(points).toEqual([horizontal, farther, outside, coincident, near, vertical, target, diagonal])
})

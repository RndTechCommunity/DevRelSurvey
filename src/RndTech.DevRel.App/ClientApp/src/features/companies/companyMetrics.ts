import { CompanyResult } from '../../api/types'

// Показатели компаний. Доли — 0…1 от selectionCount компании; умножение на 100 — при выводе.

export type ChartFlags = {
    readonly showGood: boolean,
    readonly showWanted: boolean
}

export type CompanyMetrics = {
    readonly name: string,
    readonly known: number,
    readonly good: number,
    readonly wanted: number,
    readonly goodAndWanted: number,
    readonly brandPower: number,
    // null — знаменатель не положителен, индекс не определён.
    readonly brandRating: number | null
}

export function selectCompanyRows(rows: readonly CompanyResult[], year: number): readonly CompanyResult[] {
    return rows.filter(row => row.year === year)
}

// Пустой список компаний означает «все компании».
export function restrictCompanies(yearRows: readonly CompanyResult[], companies: readonly string[]): readonly CompanyResult[] {
    return companies.length > 0
        ? yearRows.filter(row => companies.includes(row.name))
        : yearRows
}

export type ChartMetric = 'goodAndWanted' | 'good' | 'wanted'

export const METRIC_LABELS: Record<ChartMetric, string> = {
    goodAndWanted: 'Рекомендуют + хотят работать',
    good: 'Рекомендуют',
    wanted: 'Хотят работать'
}

export const hasWantedOnlyYear = (years: readonly number[]) => years.includes(2019)

export function chartMetric(flags: ChartFlags, years: readonly number[]): ChartMetric | null {
    if (!flags.showGood && !flags.showWanted) return null
    if (hasWantedOnlyYear(years)) return 'wanted'
    return flags.showGood ? (flags.showWanted ? 'goodAndWanted' : 'good') : 'wanted'
}

export function metricValue(row: CompanyResult, metric: ChartMetric): number {
    return metric === 'goodAndWanted' ? row.goodLevel + row.wantedLevel
        : metric === 'good' ? row.goodLevel : row.wantedLevel
}

export function yAxisScale(rows: readonly CompanyResult[], metric: ChartMetric): { max: number, ticks: number[] } {
    const dataMax = Math.max(0, ...rows.map(row => metricValue(row, metric)))
    const steps = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5]
    const step = steps.find(step => Math.floor(dataMax / step + 1e-9) + 1 <= 10) ?? 0.5
    const count = dataMax === 0 ? 5 : Math.floor(dataMax / step + 1e-9) + 1
    const ticks = Array.from({ length: count + 1 }, (_, i) => i * step)
    return { max: count * step, ticks }
}

export function toCompanyMetrics(row: CompanyResult): CompanyMetrics {
    const brandRatingDenominator = row.knownVotes - row.wantedVotes - row.goodVotes
    return {
        name: row.name,
        known: row.knownLevel,
        good: row.goodLevel,
        wanted: row.wantedLevel,
        goodAndWanted: row.wantedLevel + row.goodLevel,
        brandPower: row.knownLevel + row.goodLevel * 3 + row.wantedLevel * 5,
        brandRating: brandRatingDenominator > 0 ? (row.wantedVotes + row.goodVotes) / brandRatingDenominator : null
    }
}

export function companyNames(rows: readonly CompanyResult[]): string[] {
    return rows
        .map(row => row.name)
        .filter((name, index, names) => names.indexOf(name) === index)
        .sort()
}

export function nearbyCompanies<T extends { knownLevel: number, metricValue: number }>(
    points: readonly T[], target: T, tolerance: { x: number, y: number }
): T[] {
    const distance = (point: T) => ((point.knownLevel - target.knownLevel) / tolerance.x) ** 2
        + ((point.metricValue - target.metricValue) / tolerance.y) ** 2
    return points.filter(point => distance(point) <= 1)
        .sort((a, b) => distance(a) - distance(b))
}

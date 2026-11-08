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
export function selectMapRows(yearRows: readonly CompanyResult[], companies: readonly string[]): readonly CompanyResult[] {
    return companies.length > 0
        ? yearRows.filter(row => companies.includes(row.name))
        : yearRows
}

// В 2019 году ось Y показывает только «хотят работать»: любой включённый флаг даёт wantedLevel.
export function chartY(row: CompanyResult, flags: ChartFlags): number {
    return row.year === 2019
        ? (flags.showGood || flags.showWanted ? 1 : 0) * row.wantedLevel
        : (flags.showGood ? 1 : 0) * row.goodLevel + (flags.showWanted ? 1 : 0) * row.wantedLevel
}

// Для года без строк — конечная шкала вместо −Infinity.
export function yAxisMax(yearRows: readonly CompanyResult[], flags: ChartFlags): number {
    return Math.max(0, ...yearRows.map(row =>
        (flags.showGood ? 1 : 0) * row.goodLevel + (flags.showWanted ? 1 : 0) * row.wantedLevel)) + 0.05
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

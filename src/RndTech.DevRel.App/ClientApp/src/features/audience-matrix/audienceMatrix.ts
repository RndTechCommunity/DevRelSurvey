import { AudienceGroupBy, AudienceMatrixResponse, CompanyResult, MatrixValue, SurveyYear } from '../../api/types'
import { MatrixMetric, MatrixSort } from '../../app/surveyState'
import { sortRows } from '../../shared/sort'

export const MAX_MATRIX_COLUMNS = 256
export const GROUP_LABELS: Record<AudienceGroupBy, string> = {
    professions: 'Профессия', languages: 'Языки / технологии', ages: 'Возраст', cities: 'Город',
    educations: 'Образование', experiences: 'Грейд', isCommunity: 'Митапы или сообщество',
    communitySources: 'Источник информации о митапах'
}
export const MATRIX_METRICS: Record<MatrixMetric, string> = {
    wanted: 'Хотят работать', known: 'Знают компанию', good: 'Рекомендуют'
}
export function validMatrixValue(group: AudienceGroupBy, value: unknown): value is MatrixValue {
    if (value === null) return group === 'experiences'
    if (typeof value !== 'string') return false
    if (group === 'isCommunity') return value === 'true' || value === 'false'
    if (group !== 'ages') return true
    const start = Number(value)
    return Number.isInteger(start) && start >= -2147483648 && start <= 2147483643
        && start % 5 === 0 && String(start) === value
}
export function matrixValueLabel(group: AudienceGroupBy, value: MatrixValue): string {
    if (value === null) return 'Не указан'
    if (value === '') return 'Пустое значение'
    if (group === 'isCommunity') return value === 'true' ? 'Да' : 'Нет'
    if (group === 'ages') {
        const end = Number(value) + 4
        const age = Math.abs(end)
        const unit = age % 100 >= 11 && age % 100 <= 14 ? 'лет'
            : age % 10 === 1 ? 'год' : age % 10 >= 2 && age % 10 <= 4 ? 'года' : 'лет'
        return `${value}–${end} ${unit}`
    }
    return value
}
export function effectiveMatrixMetric(metric: MatrixMetric, year: SurveyYear): MatrixMetric {
    return year === 2019 && metric === 'good' ? 'wanted' : metric
}
export type MatrixCell = { readonly votes: number, readonly companyN: number, readonly share: number } | null
export type MatrixRow = { readonly name: string, readonly cells: readonly MatrixCell[] }
function cell(company: CompanyResult | undefined, peopleN: number, metric: MatrixMetric): MatrixCell {
    if (!company || peopleN <= 0 || company.selectionCount <= 0) return null
    const votes = company[`${metric}Votes`]
    const share = votes / company.selectionCount
    return Number.isFinite(votes) && Number.isFinite(company.selectionCount) && Number.isFinite(share)
        ? { votes, companyN: company.selectionCount, share } : null
}
export function matrixRows(data: AudienceMatrixResponse, companies: readonly string[], metric: MatrixMetric, sort: MatrixSort): MatrixRow[] {
    const columns = data.columns.map(column => new Map(column.companies.map(company => [company.name, company])))
    const rows = [...new Set(companies.length ? companies : data.companyNames)].map(name => ({
        name,
        cells: data.columns.map((column, i) => cell(columns[i].get(name), column.respondentCount, metric))
    }))
    if (sort.by === 'name') return sortRows(rows, row => row.name, sort.direction)
    const column = data.columns.findIndex(column => column.value === sort.value)
    return sortRows(sortRows(rows, row => row.name, 'asc'),
        row => row.cells[column]?.share ?? null, sort.direction)
}
export function matrixMaximum(rows: readonly MatrixRow[]): number | null {
    const shares = rows.flatMap(row => row.cells.flatMap(cell => cell === null ? [] : [cell.share]))
    return shares.length ? shares.reduce((max, value) => Math.max(max, value), 0) : null
}
export const matrixPercent = (share: number) => `${(100 * share).toFixed(1).replace('.', ',')}%`
export function matrixColor(share: number, max: number) {
    const from = [236, 246, 243]
    const to = [91, 184, 170]
    const q = max > 0 ? Math.max(0, Math.min(1, share / max)) : 0
    const rgb = from.map((value, index) => Math.round(value + q * (to[index] - value)))
    return { backgroundColor: `rgb(${rgb.join(', ')})`, color: '#000' }
}

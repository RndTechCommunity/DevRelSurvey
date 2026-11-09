import { AudienceGroupBy, LATEST_YEAR, SURVEY_YEARS, SurveyYear } from '../api/types'
import { DEFAULT_FILTER, parseRespondentFilter, RespondentFilter } from '../features/filters/model'
import { GROUP_LABELS, MAX_MATRIX_COLUMNS, validMatrixValue } from '../features/audience-matrix/audienceMatrix'
import { AudienceMatrixState, COMPANY_SORT_KEYS, DEFAULT_MATRIX, DEFAULT_STATE, LEGACY_COMPANIES, SurveyState } from './surveyState'

// v2 добавляет matrix; decoder v1 сохраняет прежние defaults.
// Старые ссылки: ?tab=<JSON-строка>&filter=<JSON-объект>.

// Лимит строки запроса Kestrel и nginx — 8 KB: более длинный адрес не откроется после перезагрузки.
export const MAX_URL_SEARCH_LENGTH = 8000

const LINK_DEFAULTS = { ...DEFAULT_STATE, companies: LEGACY_COMPANIES }

const LEGACY_YEAR_TABS = new Map<unknown, SurveyYear>([
    ['known-and-wanted', 2019],
    ['known-and-wanted-2019', 2019],
    ['known-and-wanted-2020', 2020],
    ['known-and-wanted-2021', 2021],
    ['known-and-wanted-2022', 2022]
])

const invalidParameter = (name: string) =>
    `Параметр ссылки «${name}» не распознан, использовано значение по умолчанию.`

function parseJson(text: string): unknown {
    try {
        return JSON.parse(text)
    } catch {
        return undefined
    }
}

function decodeFilter(text: string | null, warnings: string[]): RespondentFilter {
    if (text === null) {
        return DEFAULT_FILTER
    }
    const filter = parseRespondentFilter(parseJson(text))
    if (!filter) {
        warnings.push(invalidParameter('filter'))
    }
    return filter ?? DEFAULT_FILTER
}

function decodeLegacy(params: URLSearchParams, warnings: string[]): SurveyState {
    const state = { ...LINK_DEFAULTS, filter: decodeFilter(params.get('filter'), warnings) }
    const tabText = params.get('tab')
    if (tabText === null) {
        return state
    }
    const tab = parseJson(tabText)
    if (tab === 'data-meta') {
        return { ...state, page: 'sample' }
    }
    const year = LEGACY_YEAR_TABS.get(tab)
    if (year) {
        return { ...state, year }
    }
    warnings.push(invalidParameter('tab'))
    return state
}

function decodeVersion(params: URLSearchParams, warnings: string[], version: 1 | 2): SurveyState {
    function read<T>(name: string, fallback: T, parse: (text: string) => T | undefined): T {
        const text = params.get(name)
        if (text === null) {
            return fallback
        }
        const value = parse(text)
        if (value === undefined) {
            warnings.push(invalidParameter(name))
            return fallback
        }
        return value
    }

    const flag = (text: string) => text === '1' ? true : text === '0' ? false : undefined

    const sortKey = params.get('sort')
    const direction = params.get('direction')
    let sort = DEFAULT_STATE.sort
    if (sortKey !== null) {
        const key = COMPANY_SORT_KEYS.find(k => k === sortKey)
        if (key && (direction === 'asc' || direction === 'desc')) {
            sort = { key, direction }
        } else {
            warnings.push(invalidParameter('sort'))
        }
    }

    const year = read('year', LATEST_YEAR, text => SURVEY_YEARS.find(year => year === Number(text)))
    const compareYear = read<SurveyYear | null>('compareYear', null, text =>
        SURVEY_YEARS.find(candidate => candidate === Number(text) && (version === 2 || candidate !== year)))

    return {
        page: read('page', DEFAULT_STATE.page, text =>
            text === 'companies' || text === 'sample' || text === 'methodology' || version === 2 && text === 'audience-matrix' ? text : undefined),
        year,
        compareYear,
        filter: decodeFilter(params.get('filter'), warnings),
        companies: read('companies', version === 1 ? LINK_DEFAULTS.companies : DEFAULT_STATE.companies, text => {
            const companies = parseJson(text)
            return Array.isArray(companies) && companies.every(name => typeof name === 'string')
                ? companies
                : undefined
        }),
        showGood: read('good', DEFAULT_STATE.showGood, flag),
        showWanted: read('wanted', DEFAULT_STATE.showWanted, flag),
        view: read('view', DEFAULT_STATE.view, text => text === 'map' || text === 'table' ? text : undefined),
        sort,
        matrix: version === 2 ? decodeMatrix(params.get('matrix'), warnings) : DEFAULT_MATRIX
    }
}

function decodeMatrix(text: string | null, warnings: string[]): AudienceMatrixState {
    if (text === null) return DEFAULT_MATRIX
    const raw = parseJson(text)
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        warnings.push(invalidParameter('matrix'))
        return DEFAULT_MATRIX
    }
    const input = raw as Record<string, unknown>
    const validGroup = typeof input.groupBy === 'string' && Object.hasOwn(GROUP_LABELS, input.groupBy)
    if (!validGroup) warnings.push(invalidParameter('matrix.groupBy'))
    const groupBy = validGroup ? input.groupBy as AudienceGroupBy : DEFAULT_MATRIX.groupBy
    const values = input.groupValues
    const validValues = values === null || Array.isArray(values) && values.length <= MAX_MATRIX_COLUMNS
        && values.every(value => validMatrixValue(groupBy, value))
    if (!validValues) warnings.push(invalidParameter('matrix.groupValues'))
    const groupValues = validValues && Array.isArray(values) ? [...new Set(values)] : null
    const validMetric = input.metric === 'wanted' || input.metric === 'known' || input.metric === 'good'
    if (!validMetric) warnings.push(invalidParameter('matrix.metric'))
    const metric = validMetric ? input.metric as AudienceMatrixState['metric'] : DEFAULT_MATRIX.metric
    let sort = DEFAULT_MATRIX.sort
    let validSort = false
    const rawSort = input.sort
    if (rawSort && typeof rawSort === 'object' && !Array.isArray(rawSort)) {
        const candidate = rawSort as Record<string, unknown>
        const direction = candidate.direction
        if (direction === 'asc' || direction === 'desc') {
            if (candidate.by === 'name' || candidate.by === 'base') {
                sort = candidate.by === 'base' ? DEFAULT_MATRIX.sort : { by: 'name', direction }
                validSort = true
            }
            else if (candidate.by === 'column' && validMatrixValue(groupBy, candidate.value)) {
                sort = groupValues === null || groupValues.includes(candidate.value)
                    ? { by: 'column', value: candidate.value, direction } : { by: 'name', direction: 'asc' }
                validSort = sort.by === 'column'
            }
        }
    }
    if (!validSort) warnings.push(invalidParameter('matrix.sort'))
    return { groupBy, groupValues, metric, sort }
}

export function decodeSurveyUrl(search: string): { state: SurveyState, warnings: string[] } {
    const params = new URLSearchParams(search)
    const warnings: string[] = []
    let state = DEFAULT_STATE
    const version = params.get('v')
    if (version === '1') state = decodeVersion(params, warnings, 1)
    else if (version === '2') state = decodeVersion(params, warnings, 2)
    else if (version !== null) warnings.push(invalidParameter('v'))
    else if (params.has('tab') || params.has('filter')) state = decodeLegacy(params, warnings)
    return { state, warnings }
}

export function encodeSurveyUrl(state: SurveyState): string {
    const flag = (value: boolean) => value ? '1' : '0'
    const params = new URLSearchParams({
        v: '2',
        page: state.page,
        year: String(state.year),
        filter: JSON.stringify(state.filter),
        companies: JSON.stringify(state.companies),
        good: flag(state.showGood),
        wanted: flag(state.showWanted),
        view: state.view,
        matrix: JSON.stringify(state.matrix)
    })
    if (state.compareYear !== null) params.set('compareYear', String(state.compareYear))
    if (state.sort) {
        params.set('sort', state.sort.key)
        params.set('direction', state.sort.direction)
    }
    return `?${params}`
}

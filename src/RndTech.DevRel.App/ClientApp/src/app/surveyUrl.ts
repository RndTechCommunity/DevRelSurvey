import { LATEST_YEAR, SURVEY_YEARS, SurveyYear } from '../api/types'
import { DEFAULT_FILTER, parseRespondentFilter, RespondentFilter } from '../features/filters/model'
import { COMPANY_SORT_KEYS, DEFAULT_STATE, SurveyState } from './surveyState'

// v1: ?v=1&page&year&filter&companies&good&wanted&error[&sort&direction].
// Старые ссылки: ?tab=<JSON-строка>&filter=<JSON-объект>.

// Лимит строки запроса Kestrel и nginx — 8 KB: более длинный адрес не откроется после перезагрузки.
export const MAX_URL_SEARCH_LENGTH = 8000

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
    const state = { ...DEFAULT_STATE, filter: decodeFilter(params.get('filter'), warnings) }
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

function decodeV1(params: URLSearchParams, warnings: string[]): SurveyState {
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

    return {
        page: read('page', DEFAULT_STATE.page, text =>
            text === 'companies' || text === 'sample' ? text : undefined),
        year: read('year', LATEST_YEAR, text => SURVEY_YEARS.find(year => year === Number(text))),
        filter: decodeFilter(params.get('filter'), warnings),
        companies: read('companies', DEFAULT_STATE.companies, text => {
            const companies = parseJson(text)
            return Array.isArray(companies) && companies.every(name => typeof name === 'string')
                ? companies
                : undefined
        }),
        showGood: read('good', DEFAULT_STATE.showGood, flag),
        showWanted: read('wanted', DEFAULT_STATE.showWanted, flag),
        showLegacyError: read('error', DEFAULT_STATE.showLegacyError, flag),
        sort
    }
}

export function decodeSurveyUrl(search: string): { state: SurveyState, warnings: string[] } {
    const params = new URLSearchParams(search)
    const warnings: string[] = []
    const state = params.has('v') ? decodeV1(params, warnings)
        : params.has('tab') || params.has('filter') ? decodeLegacy(params, warnings)
            : DEFAULT_STATE
    return { state, warnings }
}

export function encodeSurveyUrl(state: SurveyState): string {
    const flag = (value: boolean) => value ? '1' : '0'
    const params = new URLSearchParams({
        v: '1',
        page: state.page,
        year: String(state.year),
        filter: JSON.stringify(state.filter),
        companies: JSON.stringify(state.companies),
        good: flag(state.showGood),
        wanted: flag(state.showWanted),
        error: flag(state.showLegacyError)
    })
    if (state.sort) {
        params.set('sort', state.sort.key)
        params.set('direction', state.sort.direction)
    }
    return `?${params}`
}

import { DEFAULT_FILTER, RespondentFilter } from '../features/filters/model'
import { LEGACY_COMPANIES, DEFAULT_STATE, SurveyState } from './surveyState'
import { decodeSurveyUrl, encodeSurveyUrl } from './surveyUrl'

const LINK_DEFAULTS = { ...DEFAULT_STATE, companies: LEGACY_COMPANIES }

const TAGANROG: RespondentFilter = { ...DEFAULT_FILTER, cities: ['Таганрог'] }

function legacyUrl(tab: string | null, filter: string | null) {
    const params = new URLSearchParams()
    if (tab !== null) {
        params.set('tab', tab)
    }
    if (filter !== null) {
        params.set('filter', filter)
    }
    return `?${params}`
}

describe('legacy links', () => {
    test.each([
        ['"known-and-wanted-2019"', 'companies', 2019],
        ['"known-and-wanted-2020"', 'companies', 2020],
        ['"known-and-wanted-2021"', 'companies', 2021],
        ['"known-and-wanted-2022"', 'companies', 2022],
        ['"known-and-wanted"', 'companies', 2019],
        ['"data-meta"', 'sample', 2022]
    ])('tab %s opens %s of %d with the linked filter', (tab, page, year) => {
        const { state, warnings } = decodeSurveyUrl(legacyUrl(tab, JSON.stringify(TAGANROG)))

        expect(state).toEqual({ ...LINK_DEFAULTS, page, year, filter: TAGANROG })
        expect(warnings).toEqual([])
    })

    test('a link with only a filter opens companies of 2022 without a warning', () => {
        expect(decodeSurveyUrl(legacyUrl(null, JSON.stringify(TAGANROG))))
            .toEqual({ state: { ...LINK_DEFAULTS, filter: TAGANROG }, warnings: [] })
    })

    test('values with %, «+» and Unicode are decoded once', () => {
        const filter = { ...DEFAULT_FILTER, cities: ['Ростов-на-Дону', '100% C++'] }
        const search = `?tab=%22known-and-wanted-2021%22&filter=${encodeURIComponent(JSON.stringify(filter))}`

        expect(decodeSurveyUrl(search).state.filter).toEqual(filter)
        expect(decodeSurveyUrl('?filter={"cities":["Ростов-на-Дону"],"educations":[],"languages":[],'
            + '"professions":["QA+тестировщик"],"experiences":[],"ages":[],"isCommunity":null}').state.filter.professions)
            .toEqual(['QA тестировщик'])
    })

    test('isCommunity «Неважно» and a missing isCommunity mean no restriction', () => {
        const withoutIsCommunity = { cities: ['Таганрог'], educations: [], languages: [], professions: [], experiences: [], ages: TAGANROG.ages }

        expect(decodeSurveyUrl(legacyUrl('"known-and-wanted-2020"', JSON.stringify({ ...TAGANROG, isCommunity: 'Неважно' }))))
            .toEqual({ state: { ...LINK_DEFAULTS, year: 2020, filter: TAGANROG }, warnings: [] })
        expect(decodeSurveyUrl(legacyUrl(null, JSON.stringify(withoutIsCommunity))))
            .toEqual({ state: { ...LINK_DEFAULTS, filter: TAGANROG }, warnings: [] })
    })
})

describe('invalid parameters fall back to defaults with a warning', () => {
    test.each([
        ['broken JSON filter', '?filter=not-json', 'filter'],
        ['a lone percent sign', '?filter=%25', 'filter'],
        ['an array of a wrong type', '?filter={"cities":[1],"educations":[],"languages":[],"professions":[],'
            + '"experiences":[],"ages":[],"isCommunity":null}', 'filter'],
        ['missing arrays', '?filter={"cities":[]}', 'filter'],
        ['an unknown age group', `?filter=${encodeURIComponent(JSON.stringify({ ...DEFAULT_FILTER, ages: ['20'] }))}`, 'filter'],
        ['an unknown tab', '?tab=%22selection-factors%22', 'tab'],
        ['a tab that is not JSON', '?tab=not-json', 'tab'],
        ['a year out of the catalog', '?v=1&year=2031', 'year'],
        ['a comparison outside the catalog', '?v=1&compareYear=2031', 'compareYear'],
        ['comparison with the main year', '?v=1&year=2022&compareYear=2022', 'compareYear'],
        ['a fractional comparison year', '?v=1&compareYear=2020.5', 'compareYear'],
        ['a fractional year', '?v=1&year=2020.5', 'year'],
        ['an unknown page', '?v=1&page=foo', 'page'],
        ['companies that are not a list', '?v=1&companies=oops', 'companies'],
        ['a flag other than 0 and 1', '?v=1&good=2', 'good'],
        ['an unknown view', '?v=1&view=other', 'view'],
        ['an unknown sort key', '?v=1&sort=revenue&direction=asc', 'sort']
    ])('%s', (_, search, parameter) => {
        const { state, warnings } = decodeSurveyUrl(search)

        expect(state).toEqual(LINK_DEFAULTS)
        expect(warnings).toHaveLength(1)
        expect(warnings[0]).toContain(`«${parameter}»`)
    })
})

describe('v1 links', () => {
    test('a non-default state survives a round trip', () => {
        const state: SurveyState = {
            page: 'sample',
            year: 2020,
            compareYear: 2021,
            filter: { ...TAGANROG, professions: ['QA'], isCommunity: 'Нет' },
            companies: ['IBS Dunice', 'Gamma%', 'ИТРУМ (ex Exceed Team)'],
            showGood: false,
            showWanted: true,
            view: 'table',
            sort: { key: 'brandPower', direction: 'desc' }
        }

        expect(decodeSurveyUrl(encodeSurveyUrl(state))).toEqual({ state, warnings: [] })
    })

    test('obsolete interval parameters are ignored and disabled flags remain disabled', () => {
        const { state, warnings } = decodeSurveyUrl('?v=1&error=1&good=0&wanted=0')
        expect(state).toEqual({ ...LINK_DEFAULTS, showGood: false, showWanted: false })
        expect(warnings).toEqual([])
        const params = new URLSearchParams(encodeSurveyUrl(state))
        expect(params.has('error')).toBe(false)
        expect(params.get('view')).toBe('map')
        expect(decodeSurveyUrl('?v=1&error=0').warnings).toEqual([])
        expect(decodeSurveyUrl('?v=1&error=2').warnings).toEqual([])
    })

    test('missing companies mean the legacy set, an empty list means all companies', () => {
        expect(decodeSurveyUrl('?v=1').state.companies).toEqual(LEGACY_COMPANIES)
        expect(decodeSurveyUrl('?v=1&companies=%5B%5D').state.companies).toEqual([])
    })

    test('an address without parameters opens all companies and the encoder makes this explicit', () => {
        expect(decodeSurveyUrl('').state.companies).toEqual([])
        expect(new URLSearchParams(encodeSurveyUrl(DEFAULT_STATE)).get('companies')).toBe('[]')
        expect(new URLSearchParams(encodeSurveyUrl(DEFAULT_STATE)).has('compareYear')).toBe(false)
        expect(decodeSurveyUrl('')).toEqual({ state: DEFAULT_STATE, warnings: [] })
    })
})

import { AudienceGroupBy, LATEST_YEAR, MatrixValue, SurveyYear } from '../api/types'
import { CompanyMetrics } from '../features/companies/companyMetrics'
import { DEFAULT_FILTER, RespondentFilter } from '../features/filters/model'
import { SortDirection } from '../shared/sort'

// Состояние исследования: единственный владелец — useSurveyState, адрес страницы — его копия.

export type SurveyPage = 'companies' | 'sample' | 'methodology' | 'audience-matrix'

export type CompanyView = 'map' | 'table'

export type CompanySortKey = keyof CompanyMetrics

export const COMPANY_SORT_KEYS: readonly CompanySortKey[] =
    ['name', 'known', 'good', 'wanted', 'goodAndWanted', 'brandPower', 'brandRating']

export type MatrixMetric = 'wanted' | 'known' | 'good'
export type MatrixSort =
    | { readonly by: 'name', readonly direction: SortDirection }
    | { readonly by: 'column', readonly value: MatrixValue, readonly direction: SortDirection }
export type AudienceMatrixState = {
    readonly groupBy: AudienceGroupBy,
    readonly groupValues: readonly MatrixValue[] | null,
    readonly metric: MatrixMetric,
    readonly sort: MatrixSort
}
export const DEFAULT_MATRIX: AudienceMatrixState = {
    groupBy: 'professions', groupValues: null, metric: 'wanted', sort: { by: 'name', direction: 'asc' }
}

export type SurveyState = {
    readonly matrix: AudienceMatrixState,
    readonly page: SurveyPage,
    readonly year: SurveyYear,
    readonly compareYear: SurveyYear | null,
    readonly filter: RespondentFilter,
    // Пустой список — все компании.
    readonly companies: readonly string[],
    readonly showGood: boolean,
    readonly showWanted: boolean,
    readonly view: CompanyView,
    readonly sort: { readonly key: CompanySortKey, readonly direction: SortDirection } | null
}

// Прежний набор компаний для совместимости ссылок.
export const LEGACY_COMPANIES: readonly string[] = [
    'OSSHelp',
    'Почтатех',
    'Mobyte',
    'Fusion Tech',
    'Lightmap',
    'DataArt',
    'INOSTUDIO',
    'A2SEVEN',
    'Usetech',
    'IntSpirit',
    'Justice IT',
    'Afterlogic',
    'IBS Dunice',
    'ИТРУМ (ex Exceed Team)',
    'Контур',
    'Axenix (ex Accenture)',
    'Аркадия',
    'Devexperts',
    'Distillery',
    'Oggetto',
    'РНДСОФТ',
    'НИИ "Спецвузавтоматика"',
    'Reksoft',
    'Центр-инвест',
    'MentalStack',
    'Вебпрактик',
    'Intellectika (Интеллектика)',
    'Auriga',
    'Тинькофф'
]

export const DEFAULT_STATE: SurveyState = {
    matrix: DEFAULT_MATRIX,
    page: 'companies',
    year: LATEST_YEAR,
    compareYear: null,
    filter: DEFAULT_FILTER,
    companies: [],
    showGood: true,
    showWanted: true,
    view: 'map',
    sort: null
}

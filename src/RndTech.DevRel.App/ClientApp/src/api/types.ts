import type { RespondentFilter } from '../features/filters/model'

export const SURVEY_YEARS = [2019, 2020, 2021, 2022] as const
export type SurveyYear = typeof SURVEY_YEARS[number]
export const LATEST_YEAR: SurveyYear = SURVEY_YEARS[SURVEY_YEARS.length - 1]

export type CompanyResult = {
    readonly name: string,
    readonly year: number,
    readonly knownLevel: number,
    readonly goodLevel: number,
    readonly wantedLevel: number,
    readonly knownVotes: number,
    readonly goodVotes: number,
    readonly wantedVotes: number,
    readonly selectionCount: number,
    readonly error: number
}

export type MetaRow = { readonly name: string } & { readonly [Y in SurveyYear as `count${Y}`]: number }

export type MetaSourceKey =
    'cities' |
    'ages' |
    'education' |
    'levels' |
    'professions' |
    'languages' |
    'isCommunity' |
    'communitySource'

export type SurveyMeta = {
    readonly total: MetaRow,
    readonly filtered: MetaRow,
    readonly sources: { readonly [K in MetaSourceKey]: readonly MetaRow[] }
}

export type FilterOptions = {
    readonly cities: readonly string[],
    readonly educations: readonly string[],
    readonly experienceLevels: readonly string[],
    readonly professions: readonly string[],
    readonly programmingLanguages: readonly string[]
}

export function countOf(row: MetaRow, year: SurveyYear): number {
    return row[`count${year}`]
}

export type AudienceGroupBy = 'professions' | 'languages' | 'ages' | 'cities' | 'educations'
    | 'experiences' | 'isCommunity' | 'communitySources'
export type MatrixValue = string | null
export type AudienceMatrixRequest = {
    readonly year: SurveyYear,
    readonly filter: RespondentFilter,
    readonly groupBy: AudienceGroupBy,
    readonly groupValues: readonly MatrixValue[] | null
}
export type AudienceGroupOption = {
    readonly value: MatrixValue,
    readonly label: string,
    readonly respondentCount: number
}
export type AudienceMatrixResponse = {
    readonly year: SurveyYear,
    readonly groupBy: AudienceGroupBy,
    readonly baseRespondentCount: number,
    readonly companyNames: readonly string[],
    readonly baseCompanies: readonly CompanyResult[],
    readonly availableValues: readonly AudienceGroupOption[],
    readonly columns: readonly (AudienceGroupOption & { readonly companies: readonly CompanyResult[] })[]
}

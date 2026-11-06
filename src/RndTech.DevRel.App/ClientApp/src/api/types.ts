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

export function countOf(row: MetaRow, year: SurveyYear): number {
    return row[`count${year}`]
}

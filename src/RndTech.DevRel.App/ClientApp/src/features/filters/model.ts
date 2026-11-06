// Фильтр группы респондентов. Пустой массив означает «все значения».

export type RespondentFilter = {
    readonly cities: readonly string[],
    readonly educations: readonly string[],
    readonly languages: readonly string[],
    readonly professions: readonly string[],
    readonly experiences: readonly string[],
    readonly ages: readonly string[],
    readonly isCommunity: 'Да' | 'Нет' | null
}

export const AGE_OPTIONS: readonly string[] = [15, 20, 25, 30, 35, 40, 45, 50, 55]
    .map(start => `${start} - ${start + 4} лет`)

const WORKING_AGES = ['20 - 24 лет', '25 - 29 лет', '30 - 34 лет', '35 - 39 лет', '40 - 44 лет']

export const DEFAULT_FILTER: RespondentFilter = {
    cities: ['Ростов-на-Дону'],
    educations: [],
    languages: [],
    professions: [],
    experiences: [],
    ages: WORKING_AGES,
    isCommunity: null
}

export const FILTER_PRESETS: readonly { readonly label: string, readonly filter: RespondentFilter }[] = [
    { label: 'Топ Ростова', filter: DEFAULT_FILTER },
    { label: 'Топ Таганрога', filter: { ...DEFAULT_FILTER, cities: ['Таганрог'] } },
    { label: 'Какие компании знают QA', filter: { ...DEFAULT_FILTER, cities: [], professions: ['QA'], ages: [] } },
    { label: 'Куда хотят фронтендеры', filter: { ...DEFAULT_FILTER, cities: [], professions: ['Frontend-разработчик'] } },
    { label: 'Известные студентам', filter: { ...DEFAULT_FILTER, cities: [], educations: ['Высшее, в процессе получения'], ages: [] } }
]

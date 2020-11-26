export interface Filter {
    cities: string[],
    educations: string[],
    languages: string[],
    professions: string[],
    experiences: string[],
    ages: string[],
    isCommunity: string | any
}

export const selectedCompanies = [
    'Контур',
    'Киноплан (Точка Кипения)',
    'Arcadia',
    'Devexperts',
    'Distillery',
    'Oggetto',
    'Rnd soft (+Winvestor)',
    'TradingView (eSignal)',
    'Umbrella IT',
    'WIS Software',
    'ЦентрИнвест',
    'uKit (uCoz)',
    'INOSTUDIO'
]

export const topRostovFilter: Filter = {
    cities: ['Ростов-на-Дону, Ростовская область, Россия'],
    educations: [],
    languages: [],
    professions: [],
    experiences: [],
    ages: [],
    isCommunity: null
}

export const topTaganrogFilter: Filter = {
    cities: ['Таганрог, Ростовская область, Россия'],
    educations: [],
    languages: [],
    professions: [],
    experiences: [],
    ages: [],
    isCommunity: null
}

export const topQAFilter: Filter = {
    cities: [],
    educations: [],
    languages: [],
    professions: ['QA, тестировщик'],
    experiences: [],
    ages: [],
    isCommunity: null
}

export const topFrontendFilter: Filter = {
    cities: [],
    educations: [],
    languages: [],
    professions: ['Frontend-разработчик'],
    experiences: [],
    ages: [],
    isCommunity: null
}

export const topStudentsFilter: Filter = {
    cities: [],
    educations: ['Высшее, в процессе получения'],
    languages: [],
    professions: [],
    experiences: [],
    ages: [],
    isCommunity: null
}
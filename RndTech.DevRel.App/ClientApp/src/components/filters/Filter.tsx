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
    'Accenture',
    'Arcadia',
    'Devexperts',
    'Distillery',
    'Oggetto',
    'Rnd soft (+Winvestor)',
    'Спецвузавтоматика',
    'Usetech',
    'Reksoft',
    'ЦентрИнвест',
    'uKit (uCoz)',
    'MentalStack',
    'WebAnt',
    'Вебпрактик',
    'Intellectika (Интеллектика)',
    'Auriga',
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
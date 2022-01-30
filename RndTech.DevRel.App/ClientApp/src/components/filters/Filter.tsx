export interface Filter {
    cities: string[],
    educations: string[],
    languages: string[],
    professions: string[],
    experiences: string[],
    ages: string[],
    year?: number,
    isCommunity: string | any
}

export const selectedCompanies = [
    'OSSHelp',
    'Почтатех',
    'Mobyte',
    'Fusion Tech',
    'Lightmap',
    'DataArt',
    'INOSTUDIO',
    'A2SEVEN',
    'IntSpirit',
    'Justice IT',
    'Afterlogic',
    'Dunice',
    'Exceed Team',
    'Контур',
    'Accenture',
    'Arcadia',
    'Devexperts',
    'Distillery',
    'Oggetto',
    'Rnd soft (+Winvestor)',
    'НИИ "Спецвузавтоматика"',
    'Reksoft',
    'ЦентрИнвест',
    'MentalStack',
    'Вебпрактик',
    'Intellectika (Интеллектика)',
    'Auriga',
]

export const topRostovFilter: Filter = {
    cities: ['Ростов-на-Дону'],
    educations: [],
    languages: [],
    professions: [],
    experiences: [],
    ages: ['20 - 24 лет', '25 - 29 лет', '30 - 34 лет', '35 - 39 лет', '40 - 44 лет'],
    isCommunity: null
}

export const topTaganrogFilter: Filter = {
    cities: ['Таганрог'],
    educations: [],
    languages: [],
    professions: [],
    experiences: [],
    ages: ['20 - 24 лет', '25 - 29 лет', '30 - 34 лет', '35 - 39 лет', '40 - 44 лет'],
    isCommunity: null
}

export const topQAFilter: Filter = {
    cities: [],
    educations: [],
    languages: [],
    professions: ['QA'],
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
    ages: ['20 - 24 лет', '25 - 29 лет', '30 - 34 лет', '35 - 39 лет', '40 - 44 лет'],
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
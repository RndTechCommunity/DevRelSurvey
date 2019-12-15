export interface Filter {
    cities: string[],
    educations: string[],
    languages: string[],
    professions: string[],
    experiences: string[],
    ages: string[],
    isCommunity: string
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
    'uKit (uCoz)'
]

export const defaultFilter: Filter = {
    cities: ['Ростов-на-Дону, Ростовская область, Россия'],
    educations: [],
    languages: [],
    professions: [],
    experiences: [],
    ages: [],
    isCommunity: 'Неважно'
}

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

const AGE_STARTS = [15, 20, 25, 30, 35, 40, 45, 50, 55]

export const AGE_OPTIONS: readonly string[] = AGE_STARTS.map(start => `${start} - ${start + 4} лет`)

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

export const NO_RESTRICTIONS: RespondentFilter = {
    cities: [], educations: [], languages: [], professions: [], experiences: [], ages: [], isCommunity: null
}

export const FILTER_PRESETS: readonly { readonly label: string, readonly filter: RespondentFilter }[] = [
    { label: 'Таганрог, 20–44 года', filter: { ...DEFAULT_FILTER, cities: ['Таганрог'] } },
    { label: 'QA: все города и возрасты', filter: { ...DEFAULT_FILTER, cities: [], professions: ['QA'], ages: [] } },
    { label: 'Frontend-разработчики: все города, 20–44 года', filter: { ...DEFAULT_FILTER, cities: [], professions: ['Frontend-разработчик'] } },
    { label: 'Студенты вузов: все города и возрасты', filter: { ...DEFAULT_FILTER, cities: [], educations: ['Высшее, в процессе получения'], ages: [] } }
]

const FILTER_ARRAY_KEYS = ['cities', 'educations', 'languages', 'professions', 'experiences', 'ages'] as const

function sameValues(a: readonly string[], b: readonly string[]) {
    const left = [...a].sort()
    const right = [...b].sort()
    return left.length === right.length && left.every((value, index) => value === right[index])
}

// Порядок значений внутри массива не влияет на группу респондентов (OR).
export function sameFilter(a: RespondentFilter, b: RespondentFilter): boolean {
    return a.isCommunity === b.isCommunity && FILTER_ARRAY_KEYS.every(key => sameValues(a[key], b[key]))
}

// Смежные группы объединяются: «20–44 года», «20–24, 30–34 года». Верхняя граница группы оканчивается на 4 или 9.
function formatAges(ages: readonly string[]) {
    const ranges: [number, number][] = []
    AGE_STARTS.forEach((start, index) => {
        if (ages.includes(AGE_OPTIONS[index])) {
            const last = ranges[ranges.length - 1]
            if (last?.[1] === start - 1) {
                last[1] = start + 4
            } else {
                ranges.push([start, start + 4])
            }
        }
    })
    const upper = ranges[ranges.length - 1][1]
    return `${ranges.map(([from, to]) => `${from}–${to}`).join(', ')} ${upper % 10 === 4 ? 'года' : 'лет'}`
}

// Полный список остаётся в поле фильтра; иначе «Выбрать все» городов дало бы строку из десятков названий.
const brief = (values: readonly string[]) => {
    const names = values.slice(0, 2).map(value => value.includes(',') ? `«${value}»` : value)
    return `${names.join(', ')}${values.length > 2 ? ` и ещё ${values.length - 2}` : ''}`
}

const FILTER_FIELDS: readonly { readonly key: typeof FILTER_ARRAY_KEYS[number], readonly label: string }[] = [
    { key: 'cities', label: 'Город' },
    { key: 'ages', label: 'Возраст' },
    { key: 'educations', label: 'Образование' },
    { key: 'experiences', label: 'Опыт' },
    { key: 'professions', label: 'Профессия' },
    { key: 'languages', label: 'Язык' }
]

type FilterRestriction = { readonly key: keyof RespondentFilter, readonly label: string, readonly value: string }

// Ограничения группы в порядке полей фильтра; пустой список — все участники.
export function describeFilter(filter: RespondentFilter): readonly FilterRestriction[] {
    const restrictions: FilterRestriction[] = FILTER_FIELDS
        .filter(({ key }) => filter[key].length > 0)
        .map(({ key, label }) => ({ key, label, value: key === 'ages' ? formatAges(filter.ages) : brief(filter[key]) }))
    if (filter.isCommunity !== null) {
        restrictions.push({
            key: 'isCommunity',
            label: 'Митапы или сообщество',
            value: filter.isCommunity === 'Да' ? 'посещает митапы или участвует в сообществе' : 'не посещает митапы и не участвует в сообществе'
        })
    }
    return restrictions
}

function stringArray(value: unknown): readonly string[] | null {
    return Array.isArray(value) && value.every(item => typeof item === 'string') ? value : null
}

// Фильтр из внешней ссылки. Невалидный → null; порядок элементов сохраняется.
export function parseRespondentFilter(value: unknown): RespondentFilter | null {
    if (typeof value !== 'object' || value === null) {
        return null
    }
    const source = value as { readonly [key: string]: unknown }
    const cities = stringArray(source.cities)
    const educations = stringArray(source.educations)
    const languages = stringArray(source.languages)
    const professions = stringArray(source.professions)
    const experiences = stringArray(source.experiences)
    const ages = stringArray(source.ages)
    const isCommunity = source.isCommunity
    if (!cities || !educations || !languages || !professions || !experiences || !ages
        || !ages.every(age => AGE_OPTIONS.includes(age))
        || (isCommunity !== undefined && isCommunity !== null && typeof isCommunity !== 'string')) {
        return null
    }
    return {
        cities,
        educations,
        languages,
        professions,
        experiences,
        ages,
        // Сервер ограничивает выборку только для «Да» и «Нет»; «Неважно» из ссылок 2019–2020 — без ограничения.
        isCommunity: isCommunity === 'Да' || isCommunity === 'Нет' ? isCommunity : null
    }
}

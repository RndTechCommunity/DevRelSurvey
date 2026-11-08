import type { AudienceGroupBy, AudienceMatrixRequest, AudienceMatrixResponse, CompanyResult, MatrixValue, MetaRow, SurveyMeta } from '../api/types'

// Синтетические ответы API для unit- и e2e-тестов. Не содержат данных production.

function deepFreeze<T>(value: T): T {
    if (value !== null && typeof value === 'object') {
        Object.values(value).forEach(deepFreeze)
        Object.freeze(value)
    }
    return value
}

function company(name: string, year: number, selectionCount: number,
                 knownVotes: number, goodVotes: number, wantedVotes: number): CompanyResult {
    return {
        name,
        year,
        knownLevel: knownVotes / selectionCount,
        goodLevel: goodVotes / selectionCount,
        wantedLevel: wantedVotes / selectionCount,
        knownVotes,
        goodVotes,
        wantedVotes,
        selectionCount,
        error: 0.0441
    }
}

function metaRow(name: string, count2019: number, count2020: number, count2021: number, count2022: number): MetaRow {
    return { name, count2019, count2020, count2021, count2022 }
}

export const filterOptions = deepFreeze({
    cities: ['Ростов-на-Дону', 'Таганрог'],
    educations: ['Высшее', 'Высшее, в процессе получения'],
    experienceLevels: ['Junior/начинающий', 'Middle/опытный'],
    professions: ['Backend-разработчик', 'Frontend-разработчик', 'QA'],
    programmingLanguages: ['C#', 'JavaScript', 'TypeScript']
})

// Разные N у компаний; «Контур» нет в 2021; у «Zero Corp» узнаваемость 0;
// знаменатель рейтинга бренда: «Почтатех» 2022 — 0, «Тинькофф» 2022 — −2;
// IBS Dunice 2019: good + wanted > known (пересечение отметок).
// В 2022 максимум selectionCount компаний исходного набора равен meta.filtered (100),
// в 2021 — 30 при meta.filtered = 60.
export const companyResults = deepFreeze([
    company('IBS Dunice', 2022, 100, 40, 10, 5),
    company('Контур', 2022, 90, 45, 9, 9),
    company('Тинькофф', 2022, 6, 6, 4, 4),
    company('ИТРУМ (ex Exceed Team)', 2022, 80, 20, 5, 0),
    company('Почтатех', 2022, 50, 5, 3, 2),
    company('Gamma%', 2022, 70, 35, 7, 7),
    company('IBS Dunice', 2021, 30, 15, 6, 3),
    company('Тинькофф', 2021, 20, 10, 2, 2),
    company('Zero Corp', 2021, 10, 0, 0, 0),
    company('IBS Dunice', 2020, 80, 40, 8, 8),
    company('Контур', 2020, 60, 30, 3, 6),
    company('IBS Dunice', 2019, 50, 20, 10, 12),
    company('Контур', 2019, 40, 10, 2, 1)
])

// Плотная карта: 40 компаний, длинные имена и две точки с одинаковыми координатами.
export const denseCompanyResults = deepFreeze(Array.from({ length: 40 }, (_, i) => {
    const name = ['Тинькофф', 'Почтатех', 'Пример'][i] ?? `Длинное название компании ${i}`
    const offset = i === 2 ? 0 : i
    return company(name, 2022, 100, i === 38 ? 0 : i === 39 ? 100 : 35 + offset % 7,
        i === 38 ? 0 : 10 + offset % 3, i === 38 ? 0 : 5 + offset % 4)
}))

// Языки допускают несколько ответов: сумма долей за 2022 больше 100 %.
export const surveyMeta: SurveyMeta = deepFreeze({
    total: metaRow('Всего', 300, 400, 500, 600),
    filtered: metaRow('Выбрано', 50, 80, 60, 100),
    sources: {
        cities: [metaRow('Ростов-на-Дону', 50, 80, 60, 100)],
        ages: [
            metaRow('20 - 24', 10, 20, 15, 30),
            metaRow('25 - 29', 20, 30, 25, 40),
            metaRow('30 - 34', 15, 20, 15, 20),
            metaRow('35 - 39', 5, 10, 5, 10)
        ],
        education: [
            metaRow('Высшее', 40, 60, 50, 80),
            metaRow('Высшее, в процессе получения', 10, 20, 10, 20)
        ],
        levels: [
            metaRow('Junior/начинающий', 20, 30, 20, 40),
            metaRow('Middle/опытный', 30, 50, 40, 60)
        ],
        professions: [
            metaRow('Backend-разработчик', 30, 50, 30, 60),
            metaRow('Frontend-разработчик', 10, 20, 20, 20),
            metaRow('QA', 10, 10, 10, 20)
        ],
        languages: [
            metaRow('C#', 20, 30, 20, 30),
            metaRow('JavaScript', 30, 50, 40, 70),
            metaRow('TypeScript', 0, 20, 30, 50)
        ],
        isCommunity: [
            metaRow('Да', 20, 30, 20, 40),
            metaRow('Нет', 30, 50, 40, 60)
        ],
        // Длина — как у самых длинных реальных названий источников (около 450 px).
        communitySource: [
            metaRow('Анонсы в телеграм-каналах и чатах профильных сообществ региона', 10, 20, 30, 40),
            metaRow('Митапы', 5, 0, 10, 20)
        ]
    }
})

// Группа есть только в 2022 году: в 2019–2021 meta.filtered = 0.
export const singleYearCompanyResults = deepFreeze([
    company('IBS Dunice', 2022, 1, 1, 0, 0)
])

export const singleYearMeta: SurveyMeta = deepFreeze({
    total: metaRow('Всего', 300, 400, 500, 600),
    filtered: metaRow('Выбрано', 0, 0, 0, 1),
    sources: {
        cities: [metaRow('Тбилиси', 0, 0, 0, 1)],
        ages: [metaRow('25 - 29', 0, 0, 0, 1)],
        education: [metaRow('Высшее', 0, 0, 0, 1)],
        levels: [metaRow('Middle/опытный', 0, 0, 0, 1)],
        professions: [metaRow('Backend-разработчик', 0, 0, 0, 1)],
        languages: [metaRow('JavaScript', 0, 0, 0, 1)],
        isCommunity: [metaRow('Нет', 0, 0, 0, 1)],
        communitySource: [metaRow('Telegram', 0, 0, 0, 1)]
    }
})

// Ни один респондент не подходит под фильтр.
export const emptyCompanyResults: readonly CompanyResult[] = deepFreeze([])

export const emptyMeta: SurveyMeta = deepFreeze({
    total: metaRow('Всего', 300, 400, 500, 600),
    filtered: metaRow('Выбрано', 0, 0, 0, 0),
    sources: {
        cities: [],
        ages: [],
        education: [],
        levels: [],
        professions: [],
        languages: [],
        isCommunity: [],
        communitySource: []
    }
})

export const MATRIX_COMPANY = 'Компания "А", 100%'
export const MATRIX_LONG_COMPANY = 'Компания с полным длинным названием для проверки переноса текста в строке матрицы'
const matrixCatalog: Record<AudienceGroupBy, readonly MatrixValue[]> = {
    professions: ['Backend', 'Frontend', 'QA', 'Только 2021'],
    languages: ['JavaScript', 'TypeScript', 'Python', 'C#'],
    ages: ['20', '25', '60'], cities: ['A B', 'AB', 'Редкий город'],
    educations: ['Высшее', 'Среднее'], experiences: [null, '', 'null', 'Middle'],
    isCommunity: ['false', 'true'],
    communitySources: ['Telegram', 'Митапы', 'Анонсы в телеграм-каналах и чатах профильных сообществ региона']
}
export function audienceMatrixFixture(request: AudienceMatrixRequest): AudienceMatrixResponse {
    const { year, groupBy, filter } = request
    const baseN = filter.cities.includes('Нет-такого') ? 0 : year === 2021 ? 1 : 3
    const label = (value: MatrixValue) => value === null ? 'Не указан' : value === '' ? 'Пустое значение'
        : groupBy === 'isCommunity' ? value === 'true' ? 'Да' : 'Нет'
            : groupBy === 'ages' ? `${value}–${Number(value) + 4} года` : value
    const availableValues = matrixCatalog[groupBy].map(value => ({
        value, label: label(value), respondentCount: !baseN || value === 'Только 2021' && year !== 2021
            || year === 2021 && value !== 'Только 2021' ? 0 : value === 'Backend' ? 2 : 1
    }))
    const selected = request.groupValues ?? availableValues.filter(option => option.respondentCount > 0)
        .sort((a, b) => b.respondentCount - a.respondentCount).slice(0, 6).map(option => option.value)
    const names = [MATRIX_COMPANY, 'AB', 'Только 2021', MATRIX_LONG_COMPANY,
        ...Array.from({ length: 14 }, (_, i) => `Компания ${i + 1}`)]
    const baseCompanies = baseN ? [company(MATRIX_COMPANY, year, 3, 3, 1, 1), company('AB', year, 2, 1, 0, 0),
        company(MATRIX_LONG_COMPANY, year, 2, 1, 1, 0)] : []
    return {
        year, groupBy, baseRespondentCount: baseN, companyNames: names, baseCompanies, availableValues,
        columns: selected.map(value => {
            const option = availableValues.find(option => option.value === value)
            const conflict = groupBy === 'professions' && filter.professions.length > 0 && !filter.professions.includes(value ?? '')
            const respondentCount = conflict ? 0 : option?.respondentCount ?? 0
            return { value, label: label(value), respondentCount,
                companies: respondentCount ? [company(MATRIX_COMPANY, year, 2, 2, 0, 1), company('AB', year, 1, 0, 0, 0),
                    company(MATRIX_LONG_COMPANY, year, 1, 1, 1, 0)] : [] }
        })
    }
}

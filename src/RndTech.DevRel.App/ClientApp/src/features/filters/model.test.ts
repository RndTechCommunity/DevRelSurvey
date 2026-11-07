import { DEFAULT_FILTER, describeFilter, FILTER_PRESETS, sameFilter } from './model'

test('sameFilter ignores the order of values and distinguishes null from «Нет»', () => {
    const taganrog = FILTER_PRESETS[0].filter
    const reordered = { ...taganrog, ages: [...taganrog.ages].reverse() }

    expect(sameFilter(Object.freeze(reordered), taganrog)).toBe(true)
    expect(sameFilter({ ...DEFAULT_FILTER, isCommunity: 'Нет' }, DEFAULT_FILTER)).toBe(false)
})

test('describeFilter merges adjacent age groups, shortens long lists and returns nothing without restrictions', () => {
    expect(describeFilter(DEFAULT_FILTER)).toEqual([
        { key: 'cities', label: 'Город', value: 'Ростов-на-Дону' },
        { key: 'ages', label: 'Возраст', value: '20–44 года' }
    ])
    expect(describeFilter({ ...DEFAULT_FILTER, cities: ['А', 'Б', 'В', 'Г'], ages: ['30 - 34 лет', '20 - 24 лет'] })
        .map(restriction => restriction.value)).toEqual(['А, Б и ещё 2', '20–24, 30–34 года'])
    expect(describeFilter({ ...DEFAULT_FILTER, cities: [], ages: [] })).toEqual([])
    expect(describeFilter({ ...DEFAULT_FILTER, educations: ['Высшее, в процессе получения'], isCommunity: 'Нет' })
        .slice(2)).toEqual([
        { key: 'educations', label: 'Образование', value: '«Высшее, в процессе получения»' },
        { key: 'isCommunity', label: 'Митапы или сообщество', value: 'не посещает митапы и не участвует в сообществе' }
    ])
})

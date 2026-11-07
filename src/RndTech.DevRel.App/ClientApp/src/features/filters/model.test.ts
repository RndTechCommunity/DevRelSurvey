import { DEFAULT_FILTER, FILTER_PRESETS, sameFilter } from './model'

test('sameFilter ignores the order of values and distinguishes null from «Нет»', () => {
    const taganrog = FILTER_PRESETS[1].filter
    const reordered = { ...taganrog, ages: [...taganrog.ages].reverse() }

    expect(sameFilter(Object.freeze(reordered), taganrog)).toBe(true)
    expect(sameFilter({ ...DEFAULT_FILTER, isCommunity: 'Нет' }, DEFAULT_FILTER)).toBe(false)
})

import { sortRows } from './sort'

const rows = Object.freeze([
    Object.freeze({ name: 'Контур', value: 0.2 }),
    Object.freeze({ name: 'Gamma%', value: null }),
    Object.freeze({ name: 'IBS Dunice', value: 0.15 }),
    Object.freeze({ name: 'Почтатех', value: NaN }),
    Object.freeze({ name: 'ИТРУМ (ex Exceed Team)', value: 1.5 })
])

test('numbers are sorted by value, missing values stay last in both directions', () => {
    expect(sortRows(rows, row => row.value, 'asc').map(row => row.value)).toEqual([0.15, 0.2, 1.5, null, NaN])
    expect(sortRows(rows, row => row.value, 'desc').map(row => row.value)).toEqual([1.5, 0.2, 0.15, null, NaN])
})

test('text ascending goes from smaller to larger code units', () => {
    expect(sortRows(rows, row => row.name, 'asc').map(row => row.name))
        .toEqual(['Gamma%', 'IBS Dunice', 'ИТРУМ (ex Exceed Team)', 'Контур', 'Почтатех'])
})

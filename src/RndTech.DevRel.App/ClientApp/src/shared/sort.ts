export type SortDirection = 'asc' | 'desc'

type SortValue = string | number | null

const isMissing = (value: SortValue) => value === null || Number.isNaN(value)

// Сортирует копию по исходным значениям; строки — по кодовым единицам, отсутствующие значения — в конце.
export function sortRows<T>(rows: readonly T[], value: (row: T) => SortValue, direction: SortDirection): T[] {
    const sign = direction === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
        const x = value(a)
        const y = value(b)
        if (x === null || y === null || isMissing(x) || isMissing(y)) {
            return Number(isMissing(x)) - Number(isMissing(y))
        }
        return x === y ? 0 : sign * (x < y ? -1 : 1)
    })
}

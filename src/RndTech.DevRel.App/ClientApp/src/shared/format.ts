export function toPercent(fraction: number) {
    return `${Math.round(fraction * 100)} %`
}

export function toPercentWithTenths(fraction: number) {
    return Math.round(fraction * 1000) / 10
}

export function formatIndex(value: number | null): string {
    return value === null || !Number.isFinite(value) ? '—' : String(toPercentWithTenths(value))
}

export function formatShare(count: number, total: number): string {
    return total > 0 ? `${count} (${toPercentWithTenths(count / total)}%)` : `${count} (—)`
}

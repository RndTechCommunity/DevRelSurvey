export function toPercent(fraction: number) {
    return `${Math.round(fraction * 100)} %`
}

export function toPercentWithTenths(fraction: number) {
    return Math.round(fraction * 1000) / 10
}

export function formatIndex(value: number | null): string {
    return value === null || !Number.isFinite(value) ? '—' : String(toPercentWithTenths(value))
}

// Нулевой знаменатель — доля не определена, а не 0.
export function shareOf(count: number, total: number): number | null {
    return total > 0 ? count / total : null
}

export function formatShare(count: number, total: number): string {
    const share = shareOf(count, total)
    return share === null ? `${count} (—)` : `${count} (${toPercentWithTenths(share)}%)`
}

export function formatDelta(value: number | null, percentagePoints: boolean): string {
    if (value === null || !Number.isFinite(value)) return '—'
    const rounded = toPercentWithTenths(value)
    return `Δ ${rounded > 0 ? '+' : ''}${rounded}${percentagePoints ? ' п. п.' : ''}`
}

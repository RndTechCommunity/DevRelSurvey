export function toPercent(fraction: number) {
    return `${Math.round(fraction * 100)} %`
}

export function toPercentWithTenths(fraction: number) {
    return `${Math.round(fraction * 1000) / 10}`
}
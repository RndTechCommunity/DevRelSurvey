import { formatDelta, formatIndex, formatShare, toPercentWithTenths } from './format'

test('toPercentWithTenths rounds a share to tenths of a percent', () => {
    expect(toPercentWithTenths(0.1234)).toBe(12.3)
})

test('an undefined share or index is shown as a dash', () => {
    expect(formatShare(0, 0)).toBe('0 (—)')
    expect(formatIndex(null)).toBe('—')
})

test('deltas show their sign and units without turning missing values into zero', () => {
    expect(formatDelta(0.075, true)).toBe('Δ +7.5 п. п.')
    expect(formatDelta(-0.1, true)).toBe('Δ -10 п. п.')
    expect(formatDelta(0.123, false)).toBe('Δ +12.3')
    expect(formatDelta(0, true)).toBe('Δ 0 п. п.')
    expect(formatDelta(null, false)).toBe('—')
    expect(formatDelta(Infinity, true)).toBe('—')
})

import { formatIndex, formatShare, toPercentWithTenths } from './format'

test('toPercentWithTenths rounds a share to tenths of a percent', () => {
    expect(toPercentWithTenths(0.1234)).toBe(12.3)
})

test('an undefined share or index is shown as a dash', () => {
    expect(formatShare(0, 0)).toBe('0 (—)')
    expect(formatIndex(null)).toBe('—')
})

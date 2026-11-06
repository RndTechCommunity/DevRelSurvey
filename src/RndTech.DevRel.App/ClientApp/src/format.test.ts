import { toPercentWithTenths } from './format'

test('toPercentWithTenths rounds a share to tenths of a percent', () => {
    expect(toPercentWithTenths(0.1234)).toBe(12.3)
})

import { parseScannedText } from '@/utils/scan-parser'

describe('parseScannedText', () => {
  it('detects percentage discounts and ISO date', () => {
    const text = 'SAVE20 at Amazon 20% Expires 2025-12-31 CODE: SAVE20'
    const res = parseScannedText(text)
    expect(res.discount).toContain('%')
    expect(res.expiryDate).toBe('2025-12-31')
    expect(res.code?.toUpperCase()).toContain('SAVE20')
  })

  it('detects euro amount and EU date', () => {
    const text = 'Bij Bol.com €15 geldig t/m 31/10/2026 CODE 15EURODEAL'
    const res = parseScannedText(text)
    expect(res.discount?.includes('€') || res.discount?.includes('EUR')).toBeTruthy()
    expect(res.expiryDate).toBe('2026-10-31')
  })
})

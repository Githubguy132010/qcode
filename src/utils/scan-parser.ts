export interface ParsedScanResult {
  code?: string
  store?: string
  discount?: string
  expiryDate?: string
  tags?: string[]
}

// Very lightweight heuristics; can be improved later
export function parseScannedText(input: string): ParsedScanResult {
  const text = input.trim()
  const result: ParsedScanResult = { tags: [] }

  // Discount detection: percentage or currency (€, $)
  const percentMatch = text.match(/(\d{1,2}|100)\s?%/)
  const euroMatch = text.match(/€\s?\d+[\.,]?\d*/)
  const dollarMatch = text.match(/\$\s?\d+[\.,]?\d*/)
  if (percentMatch) result.discount = percentMatch[0].replace(/\s+/g, '')
  else if (euroMatch) result.discount = euroMatch[0].replace(/\s+/g, '')
  else if (dollarMatch) result.discount = dollarMatch[0].replace(/\s+/g, '')

  // Expiry detection: simple DD/MM/YYYY or YYYY-MM-DD or text like Expires 2025-12-31
  const isoDate = text.match(/\b(20\d{2})-(0[1-9]|1[0-2])-(3[01]|[12]\d|0[1-9])\b/)
  const euDate = text.match(/\b(3[01]|[12]\d|0[1-9])[\/-](0[1-9]|1[0-2])[\/-](20\d{2})\b/)
  if (isoDate) result.expiryDate = isoDate[0]
  else if (euDate) {
    const [d, m, y] = euDate[0].split(/[\/-]/)
    // Convert to ISO
    result.expiryDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  // Code heuristic: common alphanumeric blocks of length >= 6 excluding obvious date/price
  const tokens = text.split(/\s|[\n,;:]/).filter(Boolean)
  const codeCandidate = tokens.find(tok => /[A-Z0-9]{6,}/i.test(tok) && !/(%|€|\$)/.test(tok))
  if (codeCandidate) result.code = codeCandidate.replace(/[^A-Z0-9]/gi, '')

  // Store heuristic: look for known keywords preceding a capitalized word
  const storeMatch = text.match(/(?:at|bij|for|store|shop):?\s*([A-Z][A-Za-z0-9&'\- ]{2,})/i)
  if (storeMatch) result.store = storeMatch[1].trim()

  // Tags
  if (/online only/i.test(text)) result.tags?.push('online')
  if (/in[- ]store/i.test(text)) result.tags?.push('in-store')
  if (/student/i.test(text)) result.tags?.push('student')

  return result
}

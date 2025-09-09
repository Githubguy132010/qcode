export interface DiscountCode {
  id: string
  code: string
  store: string
  discount: string // "10%" of "€5"
  originalPrice?: number // Original price for percentage discounts
  expiryDate?: Date
  category: string
  description?: string
  termsAndConditions?: string
  isFavorite: boolean
  isArchived: boolean
  dateAdded: Date
  timesUsed: number
  qrCode?: string
  // Usage tracking for better analytics
  usageHistory?: Array<{ date: Date; estimatedSavings?: number }>
}

export interface DiscountCodeFormData {
  code: string
  store: string
  discount: string
  originalPrice?: string // Optional original price for percentage discounts
  expiryDate?: string
  category: string
  description?: string
  termsAndConditions?: string
}

export type SortOption = 'dateAdded' | 'expiryDate' | 'store' | 'category' | 'timesUsed'
export type FilterOption = 'all' | 'active' | 'expired' | 'favorites' | 'archived'

export interface SearchFilters {
  searchTerm: string
  category: string
  sortBy: SortOption
  filterBy: FilterOption
}

export const DISCOUNT_CATEGORIES = [
  'Kleding',
  'Elektronica',
  'Eten & Drinken',
  'Sport & Fitness',
  'Boeken & Media',
  'Reizen',
  'Beauty & Verzorging',
  'Wonen & Tuin',
  'Speelgoed',
  'Anders'
] as const

// Category keys for translation (keep in sync with DISCOUNT_CATEGORIES)
export const CATEGORY_TRANSLATION_KEYS = DISCOUNT_CATEGORIES.reduce((acc, category) => {
  acc[category] = `categories.${category}`
  return acc
}, {} as Record<string, string>)

export type DiscountCategory = typeof DISCOUNT_CATEGORIES[number]

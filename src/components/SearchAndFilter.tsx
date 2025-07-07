import { Search, Filter, SortAsc } from 'lucide-react'
import type { SearchFilters } from '@/types/discount-code'
import { DISCOUNT_CATEGORIES, CATEGORY_TRANSLATION_KEYS } from '@/types/discount-code'
import { useTranslation } from 'react-i18next'

interface SearchAndFilterProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

export function SearchAndFilter({ filters, onFiltersChange }: SearchAndFilterProps) {
  const { t } = useTranslation()
  
  const handleSearchChange = (searchTerm: string) => {
    onFiltersChange({ ...filters, searchTerm })
  }

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category })
  }

  const handleSortChange = (sortBy: SearchFilters['sortBy']) => {
    onFiltersChange({ ...filters, sortBy })
  }

  const handleFilterChange = (filterBy: SearchFilters['filterBy']) => {
    onFiltersChange({ ...filters, filterBy })
  }

  return (
    <div className="sticky top-4 z-30 bg-[var(--filter-bg)]/80 dark:bg-[var(--filter-bg)]/80 backdrop-blur-md rounded-2xl px-4 py-3 mb-2 flex flex-col gap-3 shadow-none border-none">
      {/* Search */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
        <input
          type="text"
          placeholder={t('filters.searchPlaceholder')}
          value={filters.searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200 font-medium bg-white/80 dark:bg-[var(--input-bg)] border border-[var(--input-border)] dark:border-[var(--input-border)] text-[var(--text-primary)] dark:text-[var(--text-primary)] shadow-sm"
        />
      </div>
      {/* Filters Row */}
      <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide">
        {/* Category Filter */}
        <div className="flex items-center gap-2 bg-transparent border-none px-0 py-0">
          <button className="p-2 rounded-full bg-[var(--filter-bg)] dark:bg-[var(--filter-bg)] border border-[var(--filter-border)] dark:border-[var(--filter-border)]" tabIndex={-1} disabled>
            <Filter size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
          <select
            value={filters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="bg-transparent text-[var(--text-primary)] dark:text-[var(--text-primary)] text-sm focus:ring-0 focus:outline-none font-medium cursor-pointer px-2 py-1 rounded-lg"
          >
            <option value="all">{t('filters.category.all')}</option>
            {DISCOUNT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {t(CATEGORY_TRANSLATION_KEYS[category])}
              </option>
            ))}
          </select>
        </div>
        {/* Sort */}
        <div className="flex items-center gap-2 bg-transparent border-none px-0 py-0">
          <button className="p-2 rounded-full bg-[var(--filter-bg)] dark:bg-[var(--filter-bg)] border border-[var(--filter-border)] dark:border-[var(--filter-border)]" tabIndex={-1} disabled>
            <SortAsc size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value as SearchFilters['sortBy'])}
            className="bg-transparent text-[var(--text-primary)] dark:text-[var(--text-primary)] text-sm focus:ring-0 focus:outline-none font-medium cursor-pointer px-2 py-1 rounded-lg"
          >
            <option value="dateAdded">{t('filters.sortBy.dateAdded')}</option>
            <option value="expiryDate">{t('filters.sortBy.expiryDate')}</option>
            <option value="store">{t('filters.sortBy.store')}</option>
            <option value="category">{t('filters.category.label')}</option>
            <option value="timesUsed">{t('filters.sortBy.timesUsed')}</option>
          </select>
        </div>
        {/* Status Filter */}
        <div className="flex items-center gap-2 bg-transparent border-none px-0 py-0">
          <select
            value={filters.filterBy}
            onChange={(e) => handleFilterChange(e.target.value as SearchFilters['filterBy'])}
            className="bg-[var(--filter-bg)] dark:bg-[var(--filter-bg)] border border-[var(--filter-border)] dark:border-[var(--filter-border)] text-[var(--text-primary)] dark:text-[var(--text-primary)] text-sm focus:ring-0 focus:outline-none font-medium cursor-pointer px-3 py-2 rounded-full"
          >
            <option value="all">{t('filters.filterBy.all')}</option>
            <option value="active">{t('filters.filterBy.active')}</option>
            <option value="expired">{t('filters.filterBy.expired')}</option>
            <option value="favorites">{t('filters.category.favorites')}</option>
            <option value="archived">{t('filters.filterBy.archived')}</option>
          </select>
        </div>
      </div>
    </div>
  )
}

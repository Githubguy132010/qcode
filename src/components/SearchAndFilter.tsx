import { Search, Filter, SortAsc, RotateCcw } from 'lucide-react'
import type { SearchFilters } from '@/types/discount-code'
import { DISCOUNT_CATEGORIES, CATEGORY_TRANSLATION_KEYS } from '@/types/discount-code'
import { useTranslation } from 'react-i18next'

interface SearchAndFilterProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onReset?: () => void
}

export function SearchAndFilter({ filters, onFiltersChange, onReset }: SearchAndFilterProps) {
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
    <div className="theme-card rounded-xl shadow-lg border p-6 space-y-6 transition-all duration-300 card-hover">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold theme-text-primary">{t('filters.title', 'Search & Filter')}</h3>
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-1.5 text-sm theme-text-secondary hover:theme-text-primary theme-filter hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            title={t('filters.reset', 'Reset filters')}
          >
            <RotateCcw size={14} />
            <span>{t('filters.reset', 'Reset')}</span>
          </button>
        )}
      </div>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={t('filters.searchPlaceholder')}
          value={filters.searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="theme-input w-full pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200 font-medium"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4">
        {/* Category Filter */}
        <div className="flex items-center gap-3 theme-filter rounded-lg px-4 py-2" data-tutorial="categories">
          <Filter size={16} className="text-gray-500 dark:text-gray-400" />
          <select
            value={filters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="border-0 bg-transparent theme-text-primary text-sm focus:ring-0 focus:outline-none font-medium cursor-pointer"
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
        <div className="flex items-center gap-3 theme-filter rounded-lg px-4 py-2">
          <SortAsc size={16} className="text-gray-500 dark:text-gray-400" />
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value as SearchFilters['sortBy'])}
            className="border-0 bg-transparent theme-text-primary text-sm focus:ring-0 focus:outline-none font-medium cursor-pointer"
          >
            <option value="dateAdded">{t('filters.sortBy.dateAdded')}</option>
            <option value="expiryDate">{t('filters.sortBy.expiryDate')}</option>
            <option value="store">{t('filters.sortBy.store')}</option>
            <option value="category">{t('filters.category.label')}</option>
            <option value="timesUsed">{t('filters.sortBy.timesUsed')}</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3 theme-filter rounded-lg px-4 py-2">
          <select
            value={filters.filterBy}
            onChange={(e) => handleFilterChange(e.target.value as SearchFilters['filterBy'])}
            className="border-0 bg-transparent theme-text-primary text-sm focus:ring-0 focus:outline-none font-medium cursor-pointer"
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

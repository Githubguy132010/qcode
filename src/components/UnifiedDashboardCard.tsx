import { useState } from 'react'
import { BarChart3, Search, Bell, Filter, SortAsc, RotateCcw, AlertTriangle, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { SearchFilters, DiscountCode } from '@/types/discount-code'
import { DISCOUNT_CATEGORIES, CATEGORY_TRANSLATION_KEYS } from '@/types/discount-code'

interface UnifiedDashboardCardProps {
  // Overview tab props
  stats: {
    total: number
    active: number
    expired: number
    favorites: number
    archived: number
    totalUsages: number
    expiringSoon: number
  }
  onStatClick?: (filterType: 'expired' | 'favorites' | 'expiringSoon') => void
  
  // Search tab props
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onReset?: () => void
  
  // Notifications tab props
  expiringSoon: DiscountCode[]
  onCodeClick?: (codeId: string) => void
  showNotificationBanner?: boolean
}

type TabType = 'overview' | 'search' | 'notifications'

export function UnifiedDashboardCard({
  stats,
  onStatClick,
  filters,
  onFiltersChange,
  onReset,
  expiringSoon,
  onCodeClick,
  showNotificationBanner = false
}: UnifiedDashboardCardProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    // Auto-switch to notifications tab if there are expiring codes and banner should show
    return showNotificationBanner && expiringSoon.length > 0 ? 'notifications' : 'overview'
  })

  const tabs = [
    {
      id: 'overview' as const,
      label: t('dashboard.tabs.overview', 'Overview'),
      icon: BarChart3,
      badge: null
    },
    {
      id: 'search' as const,
      label: t('dashboard.tabs.search', 'Search'),
      icon: Search,
      badge: null
    },
    {
      id: 'notifications' as const,
      label: t('dashboard.tabs.notifications', 'Notifications'),
      icon: Bell,
      badge: expiringSoon.length > 0 ? expiringSoon.length : null
    }
  ]

  return (
    <div className="theme-card rounded-xl shadow-lg border transition-all duration-300 card-hover">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200/50 dark:border-[var(--card-border)]">
        <nav className="flex space-x-2 sm:space-x-8 px-4 sm:px-6 pt-6 overflow-x-auto" aria-label="Dashboard tabs" data-tutorial="dashboard-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 py-3 px-2 sm:px-1 text-sm font-medium transition-all duration-300 border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 rounded-t-lg'
                }`}
                aria-selected={isActive}
                role="tab"
                tabIndex={isActive ? 0 : -1}
                data-tutorial={`dashboard-tab-${tab.id}`}
              >
                <Icon size={16} className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                {tab.badge && (
                  <span className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse">
                    {tab.badge}
                  </span>
                )}
                {/* Active tab indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        <div className="min-h-[200px]">
          {activeTab === 'overview' && (
            <div className="animate-fadeIn" data-tutorial="dashboard-overview">
              <OverviewTabContent stats={stats} onStatClick={onStatClick} />
            </div>
          )}

          {activeTab === 'search' && (
            <div className="animate-fadeIn" data-tutorial="dashboard-search">
              <SearchTabContent
                filters={filters}
                onFiltersChange={onFiltersChange}
                onReset={onReset}
              />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-fadeIn" data-tutorial="dashboard-notifications">
              <NotificationsTabContent
                expiringSoon={expiringSoon}
                onCodeClick={onCodeClick}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Overview Tab Component - migrated from StatsOverview
function OverviewTabContent({ stats, onStatClick }: {
  stats: UnifiedDashboardCardProps['stats']
  onStatClick?: UnifiedDashboardCardProps['onStatClick']
}) {
  const { t } = useTranslation()

  /**
   * Mapping object for filter types to their translation keys
   * Used for cleaner aria-label construction
   */
  const filterTypeToTranslationKey = {
    expired: 'stats.viewExpired',
    favorites: 'stats.viewFavorites',
    expiringSoon: 'stats.viewExpiringSoon'
  } as const

  /**
   * Configuration array for all stat cards
   * Defines which cards are clickable and their associated filter types
   */
  const statItems = [
    {
      label: t('stats.activeCodes'),
      value: stats.active,
      gradientClass: 'stat-gradient-green',
      bgClass: 'stat-bg-green',
      clickable: false // Active codes are not clickable as they show all non-expired codes
    },
    {
      label: t('stats.expiredCodes'),
      value: stats.expired,
      gradientClass: 'stat-gradient-red',
      bgClass: 'stat-bg-red',
      clickable: true,
      filterType: 'expired' as const
    },
    {
      label: t('stats.favoriteCodes'),
      value: stats.favorites,
      gradientClass: 'stat-gradient-yellow',
      bgClass: 'stat-bg-yellow',
      clickable: true,
      filterType: 'favorites' as const
    },
    {
      label: t('stats.expiringSoon', { count: stats.expiringSoon }),
      value: stats.expiringSoon,
      gradientClass: 'stat-gradient-orange',
      bgClass: 'stat-bg-orange',
      clickable: true,
      filterType: 'expiringSoon' as const
    },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statItems.map((item) => (
          <div key={item.label} className="text-center group">
            {/*
              Interactive stat card button
              - Handles click events for filter navigation
              - Provides full keyboard accessibility
              - Includes hover/focus/active states
              - Disabled when value is 0 or not clickable
            */}
            <button
              type="button"
              className={`theme-stat-card border rounded-xl p-4 mb-3 transition-all duration-300 w-full relative overflow-hidden group ${
                item.clickable
                  ? 'cursor-pointer hover:shadow-xl hover:scale-105 hover:border-blue-400/50 active:scale-95 active:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[var(--card-bg)]'
                  : 'cursor-default opacity-75'
              } ${item.value === 0 ? 'opacity-60' : ''}`}
              onClick={() => item.clickable && onStatClick?.(item.filterType!)}
              disabled={!item.clickable || item.value === 0}
              aria-label={`${item.label}: ${item.value} ${item.clickable && item.filterType ? t('stats.clickToView', { type: t(filterTypeToTranslationKey[item.filterType]) }) : ''}`}
            >
              {/* Hover overlay effect - provides subtle visual feedback */}
              {item.clickable && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              )}

              {/* Click indicator icon - shows actionability on hover */}
              {item.clickable && item.value > 0 && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-75">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2z" />
                  </svg>
                </div>
              )}

              {/* Gradient circle with value - scales on hover for clickable items */}
              <div className={`${item.gradientClass} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg transition-all duration-300 ${item.clickable ? 'group-hover:shadow-xl group-hover:scale-110' : ''} ${item.value === 0 ? 'opacity-50' : ''}`}>
                <span className="text-white font-bold text-lg transition-transform duration-300 group-hover:scale-110">
                  {item.value}
                </span>
              </div>

              {/* Label text - changes color on hover for clickable items */}
              <p className="text-sm font-medium theme-text-secondary transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {item.label}
              </p>

              {/* Subtle pulse animation for clickable items - adds visual interest */}
              {item.clickable && item.value > 0 && (
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 rounded-xl animate-pulse bg-blue-500/5" />
                </div>
              )}
            </button>
          </div>
        ))}
      </div>
      <div className="pt-4 border-t border-gray-200/50 dark:border-[var(--card-border)] flex justify-between text-sm">
        <span className="theme-text-secondary font-medium">
          {t('stats.totalCodes')}: <span className="theme-text-primary font-semibold">{stats.total}</span>
        </span>
        <span className="theme-text-secondary font-medium">
          {t('codeCard.timesUsed', { count: stats.totalUsages })}
        </span>
      </div>
    </div>
  )
}

// Search Tab Component - migrated from SearchAndFilter
function SearchTabContent({ filters, onFiltersChange, onReset }: {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onReset?: () => void
}) {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
      <div className="relative" data-tutorial="search-filter">
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

// Notifications Tab Component - migrated from NotificationBanner
function NotificationsTabContent({ expiringSoon, onCodeClick }: {
  expiringSoon: DiscountCode[]
  onCodeClick?: (codeId: string) => void
}) {
  const { t } = useTranslation()
  const [dismissedCodes, setDismissedCodes] = useState<Set<string>>(new Set())

  const visibleCodes = expiringSoon.filter(code => !dismissedCodes.has(code.id))

  const handleDismissCode = (codeId: string) => {
    const newDismissed = new Set(dismissedCodes)
    newDismissed.add(codeId)
    setDismissedCodes(newDismissed)
  }

  const handleDismissAll = () => {
    const newDismissed = new Set(dismissedCodes)
    visibleCodes.forEach(code => newDismissed.add(code.id))
    setDismissedCodes(newDismissed)
  }

  if (visibleCodes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <Bell className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold theme-text-primary mb-2">
          {t('notifications.noExpiring', 'All caught up!')}
        </h3>
        <p className="theme-text-secondary">
          {t('notifications.noExpiringDescription', 'No discount codes are expiring soon.')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4" data-tutorial="dashboard-notifications">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 dark:from-orange-500 dark:to-amber-500 p-2 rounded-lg shadow-md">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold theme-text-primary leading-tight">
              {visibleCodes.length === 1
                ? t('notifications.singleExpiring', 'Discount code expiring soon')
                : t('notifications.multipleExpiring', '{{count}} discount codes expiring soon', { count: visibleCodes.length })
              }
            </h3>
          </div>
        </div>
        {visibleCodes.length > 1 && (
          <button
            onClick={handleDismissAll}
            className="text-sm theme-text-secondary hover:theme-text-primary px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {t('notifications.dismissAll', 'Dismiss all')}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {visibleCodes.map((code) => {
          const daysUntilExpiry = code.expiryDate
            ? Math.ceil((code.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : 0

          return (
            <div
              key={code.id}
              className={`flex items-center justify-between py-3 px-4 theme-code-display border rounded-xl ${
                onCodeClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors' : ''
              }`}
              onClick={() => onCodeClick?.(code.id)}
              title={onCodeClick ? t('notifications.clickToJump', 'Click to jump to this code') : undefined}
            >
              <span className="text-sm theme-text-primary">
                <strong className="font-semibold">{code.store}</strong>
                <span className="font-mono text-xs ml-1">({code.code})</span> -
                <span className="ml-1">
                  {daysUntilExpiry === 0 ? t('notifications.expiryToday', ' expires today') :
                   daysUntilExpiry === 1 ? t('notifications.expiryTomorrow', ' expires tomorrow') :
                   t('notifications.expiryDays', ' expires in {{days}} days', { days: daysUntilExpiry })}
                </span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDismissCode(code.id)
                }}
                className="ml-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/30 p-1 rounded transition-colors"
                title={t('notifications.dismiss', 'Dismiss')}
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

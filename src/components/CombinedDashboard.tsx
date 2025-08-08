import { useState } from 'react'
import { Search, Bell, BarChart2, Filter, SortAsc, RotateCcw, X, List, Grid } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { LucideIcon } from 'lucide-react'
import type { SearchFilters, DiscountCode } from '@/types/discount-code'
import { DISCOUNT_CATEGORIES, CATEGORY_TRANSLATION_KEYS } from '@/types/discount-code'

type TabId = 'search' | 'stats' | 'notifications'

interface CombinedDashboardProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onReset?: () => void
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
  expiringSoon: DiscountCode[]
  onCodeClick?: (codeId: string) => void
  initialTab?: 'search' | 'stats' | 'notifications'
  viewMode?: 'list' | 'grid'
  onViewModeChange?: (viewMode: 'list' | 'grid') => void
}

export function CombinedDashboard({
  filters,
  onFiltersChange,
  onReset,
  stats,
  onStatClick,
  expiringSoon,
  onCodeClick,
  initialTab = 'search',
  viewMode = 'list',
  onViewModeChange,
}: CombinedDashboardProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set())

  const visibleNotifications = expiringSoon.filter(c => !dismissedNotifications.has(c.id))
  const notificationCount = visibleNotifications.length

  const handleDismissNotification = (codeId: string) => {
    setDismissedNotifications(prev => new Set(prev).add(codeId))
  }

  const handleDismissAllNotifications = () => {
    const allIds = new Set(expiringSoon.map(c => c.id))
    setDismissedNotifications(allIds)
  }
  
  const TABS: { id: TabId; icon: LucideIcon; label: string; count?: number }[] = [
    { id: 'search', icon: Search, label: t('dashboard.tabs.search', 'Search') },
    { id: 'stats', icon: BarChart2, label: t('dashboard.tabs.stats', 'Stats') },
    { id: 'notifications', icon: Bell, label: t('dashboard.tabs.notifications', 'Notifications'), count: notificationCount },
  ]

  return (
    <div className="theme-card rounded-2xl shadow-lg border p-2 sm:p-4 transition-all duration-300 card-hover mb-8">
      {/* Tabs */}
      <div className="flex justify-between items-center bg-gray-100/50 dark:bg-gray-800/20 rounded-lg p-1 mb-4">
        <div className="flex space-x-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700/50 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'theme-text-secondary hover:bg-gray-200/50 dark:hover:bg-gray-700/30'
              }`}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'search' && onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-3 py-1.5 text-sm theme-text-secondary hover:theme-text-primary theme-filter hover:bg-gray-200/50 dark:hover:bg-gray-700/30 rounded-lg transition-all duration-200"
              title={t('filters.reset', 'Reset filters')}
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">{t('filters.reset', 'Reset')}</span>
            </button>
          )}
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 theme-filter rounded-lg px-1" data-tutorial="view-toggle">
            <button
              onClick={() => onViewModeChange?.('list')}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700/50 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'theme-text-secondary hover:bg-gray-200/50 dark:hover:bg-gray-700/30'
              }`}
              title={t('view.listView', 'List View')}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => onViewModeChange?.('grid')}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700/50 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'theme-text-secondary hover:bg-gray-200/50 dark:hover:bg-gray-700/30'
              }`}
              title={t('view.gridView', 'Grid View')}
            >
              <Grid size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-2" data-tutorial="search-filter">
        {/* Search & Filter Content */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('filters.searchPlaceholder')}
                value={filters.searchTerm}
                onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
                className="theme-input w-full pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200 font-medium"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 theme-filter rounded-lg px-3 py-1.5" data-tutorial="categories">
                <Filter size={14} className="text-gray-500 dark:text-gray-400" />
                <select
                  value={filters.category}
                  onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
                  className="bg-transparent theme-text-primary text-sm focus:ring-0 focus:outline-none font-medium cursor-pointer"
                >
                  <option value="all">{t('filters.category.all')}</option>
                  {DISCOUNT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{t(CATEGORY_TRANSLATION_KEYS[cat])}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 theme-filter rounded-lg px-3 py-1.5">
                <SortAsc size={14} className="text-gray-500 dark:text-gray-400" />
                <select
                  value={filters.sortBy}
                  onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as SearchFilters['sortBy'] })}
                  className="bg-transparent theme-text-primary text-sm focus:ring-0 focus:outline-none font-medium cursor-pointer"
                >
                  <option value="dateAdded">{t('filters.sortBy.dateAdded')}</option>
                  <option value="expiryDate">{t('filters.sortBy.expiryDate')}</option>
                  <option value="store">{t('filters.sortBy.store')}</option>
                  <option value="category">{t('filters.category.label')}</option>
                  <option value="timesUsed">{t('filters.sortBy.timesUsed')}</option>
                </select>
              </div>
              <div className="flex items-center gap-2 theme-filter rounded-lg px-3 py-1.5">
                <select
                  value={filters.filterBy}
                  onChange={(e) => onFiltersChange({ ...filters, filterBy: e.target.value as SearchFilters['filterBy'] })}
                  className="bg-transparent theme-text-primary text-sm focus:ring-0 focus:outline-none font-medium cursor-pointer"
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
        )}

        {/* Stats Content */}
        {activeTab === 'stats' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              {[
                { label: t('stats.activeCodes'), value: stats.active, filter: 'active' as const, grad: 'stat-gradient-green' },
                { label: t('stats.expiredCodes'), value: stats.expired, filter: 'expired' as const, grad: 'stat-gradient-red' },
                { label: t('stats.favoriteCodes'), value: stats.favorites, filter: 'favorites' as const, grad: 'stat-gradient-yellow' },
                { label: t('stats.expiringSoon', { count: stats.expiringSoon }), value: stats.expiringSoon, filter: 'expiringSoon' as const, grad: 'stat-gradient-orange' },
              ].map(stat => (
                <button
                  key={stat.label}
                  disabled={stat.value === 0 || !onStatClick || stat.filter === 'active'}
                  onClick={() => onStatClick?.(stat.filter as 'expired' | 'favorites' | 'expiringSoon')}
                  className={`p-3 rounded-lg transition-all duration-200 group disabled:opacity-60 disabled:cursor-default ${stat.filter !== 'active' ? 'hover:shadow-lg hover:scale-105' : ''}`}
                >
                  <div className={`${stat.grad} w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md group-hover:shadow-lg transition-all`}>
                    <span className="text-white font-bold text-base">{stat.value}</span>
                  </div>
                  <p className="text-xs font-medium theme-text-secondary group-hover:theme-text-primary transition-colors">{stat.label}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--card-border)]/50 flex justify-between text-xs">
              <span className="theme-text-secondary">{t('stats.totalCodes')}: <span className="font-semibold theme-text-primary">{stats.total}</span></span>
              <span className="theme-text-secondary">{t('codeCard.timesUsed', { count: stats.totalUsages })}</span>
            </div>
          </div>
        )}

        {/* Notifications Content */}
        {activeTab === 'notifications' && (
          <div>
            {notificationCount === 0 ? (
              <div className="text-center py-8">
                <Bell size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="font-semibold theme-text-primary">{t('dashboard.notifications.allClear', 'All clear!')}</p>
                <p className="text-sm theme-text-secondary">{t('dashboard.notifications.noExpiring', 'No codes are expiring soon.')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold theme-text-primary">{t('dashboard.notifications.title', 'Expiring Soon')}</h4>
                  <button onClick={handleDismissAllNotifications} className="text-xs theme-text-secondary hover:theme-text-primary">{t('dashboard.notifications.dismissAll', 'Dismiss all')}</button>
                </div>
                {visibleNotifications.slice(0, 4).map(code => {
                  const days = code.expiryDate ? Math.ceil((code.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
                  return (
                    <div
                      key={code.id}
                      className="flex items-center justify-between p-2 theme-code-display rounded-lg"
                    >
                      <div className="flex-grow" onClick={() => onCodeClick?.(code.id)} role="button">
                        <p className="font-semibold text-sm">{code.store}</p>
                        <p className="text-xs theme-text-secondary">
                          {days <= 0 ? t('notifications.expiryToday') : t('notifications.expiryDays', { days })}
                        </p>
                      </div>
                       <button
                        onClick={(e) => { e.stopPropagation(); handleDismissNotification(code.id); }}
                        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                       >
                         <X size={14} />
                      </button>
                    </div>
                  )
                })}
                {visibleNotifications.length > 4 && (
                    <p className="text-xs theme-text-secondary text-center pt-2">
                        {t('notifications.andMore', { count: visibleNotifications.length - 4 })}
                    </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
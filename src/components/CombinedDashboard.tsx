import { useState } from 'react'
import { Search, Bell, BarChart2, Filter, SortAsc, RotateCcw, X, List, Grid } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { LucideIcon } from 'lucide-react'
import type { SearchFilters, DiscountCode } from '@/types/discount-code'
import { DISCOUNT_CATEGORIES, CATEGORY_TRANSLATION_KEYS } from '@/types/discount-code'
import { AnimatedTab } from '@/components/AnimatedTab'
import { AnimatedStatCard } from '@/components/AnimatedStatCard'

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
      <div className="flex justify-between items-center theme-filter rounded-lg p-1 mb-4">
        <div className="flex space-x-1">
          {TABS.map(tab => (
            <AnimatedTab
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              isActive={activeTab === tab.id}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 relative ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'theme-text-secondary theme-menu-hover'
              }`}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {tab.count}
                </span>
              )}
            </AnimatedTab>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'search' && onReset && (
            <motion.button
              onClick={onReset}
              className="flex items-center gap-2 px-3 py-1.5 text-sm theme-text-secondary hover:theme-text-primary theme-filter theme-menu-hover rounded-lg transition-all duration-200"
              title={t('filters.reset', 'Reset filters')}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 30, mass: 1 }}
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">{t('filters.reset', 'Reset')}</span>
            </motion.button>
          )}
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 theme-filter rounded-lg px-1" data-tutorial="view-toggle">
            <motion.button
              onClick={() => onViewModeChange?.('list')}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                viewMode === 'list'
                  ? 'text-white'
                  : 'theme-text-secondary theme-menu-hover'
              }`}
              title={t('view.listView', 'List View')}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 30, mass: 1 }}
            >
              <List size={16} />
            </motion.button>
            <motion.button
              onClick={() => onViewModeChange?.('grid')}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'text-white'
                  : 'theme-text-secondary theme-menu-hover'
              }`}
              title={t('view.gridView', 'Grid View')}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 30, mass: 1 }}
            >
              <Grid size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="p-2" data-tutorial="search-filter">
        {/* Search & Filter Content */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 theme-text-muted" size={20} />
              <input
                type="text"
                placeholder={t('filters.searchPlaceholder')}
                value={filters.searchTerm}
                onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
                className="theme-input w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder:theme-text-muted transition-all duration-200 font-medium"
              />
            </motion.div>
            <div className="flex flex-wrap gap-3">
              <motion.div 
                className="flex items-center gap-2 theme-filter rounded-lg px-3 py-1.5"
                data-tutorial="categories"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Filter size={14} className="theme-text-muted" />
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
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 theme-filter rounded-lg px-3 py-1.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SortAsc size={14} className="theme-text-muted" />
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
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 theme-filter rounded-lg px-3 py-1.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
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
              </motion.div>
            </div>
          </div>
        )}

        {/* Stats Content */}
        {activeTab === 'stats' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <AnimatedStatCard
                label={t('stats.activeCodes')}
                value={stats.active}
                gradientClass="stat-gradient-green"
                disabled
              />
              <AnimatedStatCard
                label={t('stats.expiredCodes')}
                value={stats.expired}
                gradientClass="stat-gradient-red"
                onClick={() => onStatClick?.('expired')}
                disabled={stats.expired === 0 || !onStatClick}
              />
              <AnimatedStatCard
                label={t('stats.favoriteCodes')}
                value={stats.favorites}
                gradientClass="stat-gradient-yellow"
                onClick={() => onStatClick?.('favorites')}
                disabled={stats.favorites === 0 || !onStatClick}
              />
              <AnimatedStatCard
                label={t('stats.expiringSoon', { count: stats.expiringSoon })}
                value={stats.expiringSoon}
                gradientClass="stat-gradient-orange"
                onClick={() => onStatClick?.('expiringSoon')}
                disabled={stats.expiringSoon === 0 || !onStatClick}
              />
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
                <Bell size={40} className="mx-auto theme-text-muted mb-2" />
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
                        className="ml-2 theme-text-muted hover:theme-text-primary p-1 rounded-full theme-menu-hover"
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
import { useTranslation } from 'react-i18next'

interface StatsOverviewProps {
  stats: {
    total: number
    active: number
    expired: number
    favorites: number
    archived: number
    totalUsages: number
    expiringSoon: number
  }
  /**
   * Callback function triggered when a clickable stat card is clicked
   * @param filterType - Determines which filter to apply: 'expired', 'favorites', or 'expiringSoon'
   */
  onStatClick?: (filterType: 'expired' | 'favorites' | 'expiringSoon') => void
}

export function StatsOverview({ stats, onStatClick }: StatsOverviewProps) {
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
    <div className="theme-card rounded-xl shadow-lg border p-6 mb-6 transition-all duration-300 card-hover">
      <h2 className="text-lg font-semibold theme-text-primary mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
        {t('stats.title', 'Overview')}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-[var(--card-border)] flex justify-between text-sm">
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

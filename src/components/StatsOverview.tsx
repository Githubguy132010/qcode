import { useTranslation } from 'react-i18next'
import type { DiscountCode } from '@/types/discount-code'
import { useState } from 'react'

interface StatsOverviewProps {
  stats: {
    total: number
    active: number
    expired: number
    favorites: number
    archived: number
    totalUsages: number
    expiringSoon: number
  },
  expiringSoon: DiscountCode[]
}

export function StatsOverview({ stats, expiringSoon }: StatsOverviewProps) {
  const { t } = useTranslation()
  
  const statItems = [
    { 
      label: t('stats.activeCodes'), 
      value: stats.active, 
      gradientClass: 'bg-gradient-to-br from-green-400 to-emerald-600',
    },
    { 
      label: t('stats.expiredCodes'), 
      value: stats.expired, 
      gradientClass: 'bg-gradient-to-br from-red-400 to-red-600',
    },
    { 
      label: t('stats.favoriteCodes'), 
      value: stats.favorites, 
      gradientClass: 'bg-gradient-to-br from-yellow-300 to-yellow-500',
    },
  ]

  return (
    <div className="rounded-xl shadow-lg border p-6 mb-6 transition-all duration-300 bg-white dark:bg-[var(--card-bg)] dark:border-[var(--card-border)]">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)] dark:text-[var(--text-primary)]">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
        {t('stats.title', 'Overview')}
      </h2>
      <div className="grid grid-cols-3 gap-4 w-full">
        {statItems.map((item) => (
          <div key={item.label}>
            <div className="bg-gradient-to-br border rounded-xl p-4 transition-all duration-200 flex flex-col items-center justify-center h-full w-full bg-[var(--stat-card-bg)] dark:bg-[var(--stat-card-bg)] border-[var(--stat-card-border)] dark:border-[var(--stat-card-border)]">
              <div className={`${item.gradientClass} w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-lg`}>
                <span className="text-white font-bold text-lg">{item.value}</span>
              </div>
              <p className="text-sm font-medium text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Expiring Soon Notification Section */}
      <div className="mt-4">
        <div className="rounded-xl border-2 border-orange-400 dark:border-orange-500 bg-white dark:bg-[var(--card-bg)] px-4 py-3 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="text-orange-600 dark:text-orange-500"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] dark:text-[var(--text-primary)]">
              {t('stats.expiringSoon', { count: expiringSoon.length })}
            </h3>
          </div>
          {expiringSoon.length > 0 ? (
            <ul className="space-y-1">
              {expiringSoon.map(code => {
                const daysUntilExpiry = code.expiryDate
                  ? Math.ceil((code.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  : 0
                return (
                  <li key={code.id} className="flex items-center gap-2 text-xs text-[var(--text-primary)] dark:text-[var(--text-primary)]">
                    <span className="font-semibold truncate max-w-[80px]">{code.store}</span>
                    <span className="font-mono bg-orange-100 border border-orange-300 text-[var(--text-primary)] dark:bg-orange-900/40 dark:border-orange-800 dark:text-[var(--text-primary)] px-2 py-0.5 rounded">
                      {code.code}
                    </span>
                    <span className="whitespace-nowrap">
                      {daysUntilExpiry === 0
                        ? t('notifications.expiryToday', 'expires today')
                        : daysUntilExpiry === 1
                        ? t('notifications.expiryTomorrow', 'expires tomorrow')
                        : t('notifications.expiryDays', 'expires in {{days}} days', { days: daysUntilExpiry })}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="text-xs text-[var(--text-secondary)] dark:text-gray-500">
              {t('notifications.noExpiring', 'No discount codes expiring soon')}
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-[var(--card-border)] flex justify-between text-sm">
        <span className="text-[var(--text-secondary)] dark:text-[var(--text-secondary)] font-medium">
          {t('stats.totalCodes')}: <span className="text-[var(--text-primary)] dark:text-[var(--text-primary)] font-semibold">{stats.total}</span>
        </span>
        <span className="text-[var(--text-secondary)] dark:text-[var(--text-secondary)] font-medium">
          {t('codeCard.timesUsed', { count: stats.totalUsages })}
        </span>
      </div>
    </div>
  )
}

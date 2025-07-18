'use client'

import { useState } from 'react'
import { useDiscountCodes } from '@/hooks/useDiscountCodes'
import { calculateAnalytics } from '@/utils/analytics'
import { Header } from '@/components/Header'
import { UsageAnalyticsCard } from '@/components/analytics/UsageAnalyticsCard'
import { SavingsAnalyticsCard } from '@/components/analytics/SavingsAnalyticsCard'
import { LifecycleAnalyticsCard } from '@/components/analytics/LifecycleAnalyticsCard'
import { PerformanceAnalyticsCard } from '@/components/analytics/PerformanceAnalyticsCard'
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview'
import { useTranslation } from 'react-i18next'
import { BarChart3, TrendingUp, Calendar, Target } from 'lucide-react'

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const { codes, isLoading } = useDiscountCodes()
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'savings' | 'lifecycle' | 'performance'>('overview')
  
  // Handler functions for Header component
  const handleNotificationClick = () => {
    // Analytics page doesn't need notification functionality currently
  }
  
  const handleSettingsClick = () => {
    // Analytics page doesn't need settings functionality currently
  }
  
  const handleSyncClick = () => {
    // Analytics page doesn't need sync functionality currently
  }

  const handleChangelogClick = () => {
    // Analytics page doesn't need changelog functionality currently
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="theme-text-secondary font-medium">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  const analytics = calculateAnalytics(codes)

  const tabs = [
    { id: 'overview' as const, label: t('analytics.tabs.overview', 'Overview'), icon: BarChart3 },
    { id: 'usage' as const, label: t('analytics.tabs.usage', 'Usage'), icon: TrendingUp },
    { id: 'savings' as const, label: t('analytics.tabs.savings', 'Savings'), icon: Target },
    { id: 'lifecycle' as const, label: t('analytics.tabs.lifecycle', 'Lifecycle'), icon: Calendar },
    { id: 'performance' as const, label: t('analytics.tabs.performance', 'Performance'), icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen transition-colors">
      <Header 
        onNotificationClick={handleNotificationClick}
        onSettingsClick={handleSettingsClick}
        onSyncClick={handleSyncClick}
        onChangelogClick={handleChangelogClick}
      />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold theme-text-primary mb-2">
            {t('analytics.title', 'Analytics Dashboard')}
          </h1>
          <p className="theme-text-secondary">
            {t('analytics.subtitle', 'Insights into your discount code usage and savings')}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 p-1 theme-card rounded-xl shadow-sm border overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'theme-text-secondary hover:theme-text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <IconComponent size={18} />
                  <span className="text-sm">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <AnalyticsOverview analytics={analytics} codes={codes} />
          )}
          
          {activeTab === 'usage' && (
            <UsageAnalyticsCard analytics={analytics.usage} />
          )}
          
          {activeTab === 'savings' && (
            <SavingsAnalyticsCard analytics={analytics.savings} />
          )}
          
          {activeTab === 'lifecycle' && (
            <LifecycleAnalyticsCard analytics={analytics.lifecycle} />
          )}
          
          {activeTab === 'performance' && (
            <PerformanceAnalyticsCard analytics={analytics.performance} />
          )}
        </div>

        {/* No Data State */}
        {codes.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 size={64} className="mx-auto theme-text-secondary mb-4" />
            <h3 className="text-xl font-semibold theme-text-primary mb-2">
              {t('analytics.noData.title', 'No Data Available')}
            </h3>
            <p className="theme-text-secondary mb-6">
              {t('analytics.noData.description', 'Add some discount codes to see analytics insights.')}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
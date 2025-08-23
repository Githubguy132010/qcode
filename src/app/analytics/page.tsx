'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { tabVariants } from '@/lib/animations'

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const { codes, isLoading } = useDiscountCodes()
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'savings' | 'lifecycle' | 'performance'>('overview')
  
  // Handler functions for Header component
  const handleSettingsClick = () => {
    // Analytics page doesn't need settings functionality currently
  }
  

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="theme-text-secondary font-medium">
            <span suppressHydrationWarning>{t('common.loading')}</span>
          </p>
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
        onSettingsClick={handleSettingsClick}
      />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div 
          className="mb-8"
          variants={tabVariants}
        >
          <h1 className="text-3xl font-bold theme-text-primary mb-2">
            {t('analytics.title', 'Analytics Dashboard')}
          </h1>
          <p className="theme-text-secondary">
            {t('analytics.subtitle', 'Insights into your discount code usage and savings')}
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          className="mb-8"
          variants={tabVariants}
        >
          <div className="flex space-x-1 p-1 theme-card rounded-xl shadow-sm border overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'theme-text-secondary hover:theme-text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  whileHover={{ y: activeTab === tab.id ? 0 : -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <IconComponent size={18} />
                  <span className="text-sm">{tab.label}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div 
          className="space-y-6"
          variants={tabVariants}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <AnalyticsOverview analytics={analytics} codes={codes} />
              </motion.div>
            )}
            
            {activeTab === 'usage' && (
              <motion.div
                key="usage"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <UsageAnalyticsCard analytics={analytics.usage} />
              </motion.div>
            )}
            
            {activeTab === 'savings' && (
              <motion.div
                key="savings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <SavingsAnalyticsCard analytics={analytics.savings} />
              </motion.div>
            )}
            
            {activeTab === 'lifecycle' && (
              <motion.div
                key="lifecycle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <LifecycleAnalyticsCard analytics={analytics.lifecycle} />
              </motion.div>
            )}
            
            {activeTab === 'performance' && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <PerformanceAnalyticsCard analytics={analytics.performance} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* No Data State */}
        {codes.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BarChart3 size={64} className="mx-auto theme-text-secondary mb-4" />
            <h3 className="text-xl font-semibold theme-text-primary mb-2">
              {t('analytics.noData.title', 'No Data Available')}
            </h3>
            <p className="theme-text-secondary mb-6">
              {t('analytics.noData.description', 'Add some discount codes to see analytics insights.')}
            </p>
          </motion.div>
        )}
      </main>
    </div>
  )
}
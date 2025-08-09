'use client'

import { useMemo, useRef, useState, createRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDiscountCodes } from '@/hooks/useDiscountCodes'
import { calculateAnalytics } from '@/utils/analytics'
import { Header } from '@/components/Header'
import { UsageAnalyticsCard } from '@/components/analytics/UsageAnalyticsCard'
import { SavingsAnalyticsCard } from '@/components/analytics/SavingsAnalyticsCard'
import { LifecycleAnalyticsCard } from '@/components/analytics/LifecycleAnalyticsCard'
import { PerformanceAnalyticsCard } from '@/components/analytics/PerformanceAnalyticsCard'
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview'
import { CombinedDashboard } from '@/components/CombinedDashboard'
import { DiscountCodeCard } from '@/components/DiscountCodeCard'
import { AddCodeModal } from '@/components/AddCodeModal'
import { EmptyState } from '@/components/EmptyState'
import { useTranslation } from 'react-i18next'
import type { SearchFilters, DiscountCodeFormData } from '@/types/discount-code'
import { BarChart3, TrendingUp, Calendar, Target, Home } from 'lucide-react'

export default function RootPage() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const initialTabParam = searchParams.get('tab')
  const [activeSection, setActiveSection] = useState<'home' | 'analytics'>(initialTabParam === 'analytics' ? 'analytics' : 'home')

  // Shared header handlers
  const handleNotificationClick = () => {}
  const handleSettingsClick = () => {}

  return (
    <div className="min-h-screen transition-colors">
      <Header onNotificationClick={handleNotificationClick} onSettingsClick={handleSettingsClick} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Top-level tabs to switch between Home and Analytics without route navigation */}
        <div className="mb-6">
          <div className="flex gap-2 p-1 theme-card rounded-xl shadow-sm border overflow-x-auto">
            <button
              onClick={() => setActiveSection('home')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                activeSection === 'home' ? 'bg-blue-500 text-white shadow-md' : 'theme-text-secondary hover:theme-text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              aria-label={t('navigation.home')}
            >
              <Home size={18} />
              <span className="text-sm">{t('navigation.home')}</span>
            </button>
            <button
              onClick={() => setActiveSection('analytics')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                activeSection === 'analytics' ? 'bg-blue-500 text-white shadow-md' : 'theme-text-secondary hover:theme-text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              aria-label={t('navigation.analytics')}
            >
              <BarChart3 size={18} />
              <span className="text-sm">{t('navigation.analytics')}</span>
            </button>
          </div>
        </div>

        {activeSection === 'home' ? <HomeSection /> : <AnalyticsSection />}
      </main>
    </div>
  )
}

function HomeSection() {
  const { t } = useTranslation()
  const {
    codes,
    isLoading,
    addCode,
    deleteCode,
    toggleFavorite,
    toggleArchived,
    incrementUsage,
    isExpired,
    filterCodes,
    getStats,
    getExpiringSoon,
  } = useDiscountCodes()

  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    category: 'all',
    sortBy: 'dateAdded',
    filterBy: 'all',
  })
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [quickAddInitialData, setQuickAddInitialData] = useState<Partial<DiscountCodeFormData> | undefined>(undefined)

  // Refs to scroll to a specific code card
  const codeRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement | null> }>({})
  const getCodeRef = (codeId: string) => {
    if (!codeRefs.current[codeId]) {
      codeRefs.current[codeId] = createRef<HTMLDivElement | null>()
    }
    return codeRefs.current[codeId]
  }

  const handleStatClick = (filterType: 'expired' | 'favorites' | 'expiringSoon') => {
    switch (filterType) {
      case 'expired':
        setFilters({ searchTerm: '', category: 'all', sortBy: 'expiryDate', filterBy: 'expired' })
        break
      case 'favorites':
        setFilters({ searchTerm: '', category: 'all', sortBy: 'dateAdded', filterBy: 'favorites' })
        break
      case 'expiringSoon':
        setFilters({ searchTerm: '', category: 'all', sortBy: 'expiryDate', filterBy: 'active' })
        break
    }
  }

  const filteredCodes = useMemo(() => filterCodes(filters), [filterCodes, filters])
  const stats = useMemo(() => getStats(), [getStats])
  const expiringSoon = useMemo(() => getExpiringSoon(), [getExpiringSoon])

  // Basic clipboard-based quick add (optional)
  const parseClipboardText = (text: string): Partial<DiscountCodeFormData> => {
    const result: Partial<DiscountCodeFormData> = {}
    const urlMatch = text.match(/https?:\/\/[^\s)]+/i)
    if (urlMatch) {
      try {
        const u = new URL(urlMatch[0])
        const host = u.hostname.replace(/^www\./, '')
        result.store = host.split('.')[0]
      } catch {}
    }
    const percentMatch = text.match(/(\d{1,3})\s?%/)
    if (percentMatch) {
      result.discount = `${percentMatch[1]}%`
    }
    return result
  }

  const handleOpenAdd = async () => {
    try {
      if ('clipboard' in navigator && 'readText' in navigator.clipboard) {
        const text = await navigator.clipboard.readText()
        const parsed = parseClipboardText(text)
        setQuickAddInitialData(Object.keys(parsed).length > 0 ? parsed : undefined)
      } else {
        setQuickAddInitialData(undefined)
      }
    } catch {
      setQuickAddInitialData(undefined)
    } finally {
      setIsAddModalOpen(true)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="theme-text-secondary font-medium">
            <span suppressHydrationWarning>{t('common.loading')}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold theme-text-primary mb-2">{t('common.appName')}</h1>
        <p className="theme-text-secondary">{t('common.tagline')}</p>
      </div>

      <CombinedDashboard
        filters={filters}
        onFiltersChange={setFilters}
        onReset={() => setFilters({ searchTerm: '', category: 'all', sortBy: 'dateAdded', filterBy: 'all' })}
        stats={stats}
        onStatClick={handleStatClick}
        expiringSoon={expiringSoon}
        onCodeClick={(codeId) => {
          const ref = getCodeRef(codeId)
          if (ref?.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
          }
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="mb-8">
        <button
          onClick={handleOpenAdd}
          data-tutorial="add-button"
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          <span className="text-lg">{t('homePage.addNewCode')}</span>
        </button>
      </div>

      {filteredCodes.length === 0 ? (
        <EmptyState hasAnyCodes={codes.length > 0} onAddCode={handleOpenAdd} onResetFilters={() => setFilters({ searchTerm: '', category: 'all', sortBy: 'dateAdded', filterBy: 'all' })} />
      ) : (
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-6'}`} data-codes-list>
          {filteredCodes.map((code) => (
            <DiscountCodeCard
              key={code.id}
              ref={getCodeRef(code.id)}
              code={code}
              isExpired={isExpired(code)}
              onToggleFavorite={() => toggleFavorite(code.id)}
              onToggleArchived={() => toggleArchived(code.id)}
              onIncrementUsage={() => incrementUsage(code.id)}
              onDelete={() => deleteCode(code.id)}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      <AddCodeModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setQuickAddInitialData(undefined) }}
        onAdd={addCode}
        initialData={quickAddInitialData}
        prefillSource={quickAddInitialData ? 'clipboard' : undefined}
      />
    </div>
  )
}

function AnalyticsSection() {
  const { t } = useTranslation()
  const { codes, isLoading } = useDiscountCodes()
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'savings' | 'lifecycle' | 'performance'>('overview')

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold theme-text-primary mb-2">
          {t('analytics.title', 'Analytics Dashboard')}
        </h1>
        <p className="theme-text-secondary">
          {t('analytics.subtitle', 'Insights into your discount code usage and savings')}
        </p>
      </div>

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
    </div>
  )
}

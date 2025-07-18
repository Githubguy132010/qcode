'use client'

import { useState, useRef, createRef } from 'react'
import { Plus } from 'lucide-react'
import { useDiscountCodes } from '@/hooks/useDiscountCodes'
import { Header } from '@/components/Header'
import { SearchAndFilter } from '@/components/SearchAndFilter'
import { DiscountCodeCard } from '@/components/DiscountCodeCard'
import { AddCodeModal } from '@/components/AddCodeModal'
import { StatsOverview } from '@/components/StatsOverview'
import { EmptyState } from '@/components/EmptyState'
import { NotificationBanner } from '@/components/NotificationBanner'
import { InstallPrompt } from '@/components/InstallPrompt'
import { SettingsModal } from '@/components/SettingsModal'
import { OnlineStatusBanner } from '@/components/OfflineIndicator'
import { CloudSync } from '@/components/CloudSync'
import { ChangelogModal } from '@/components/ChangelogModal'
import { useTranslation } from 'react-i18next'
import type { SearchFilters } from '@/types/discount-code'
import { hasNewChangelog } from '@/utils/changelog'

export default function HomePage() {
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
    manualSync,
  } = useDiscountCodes()

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: '',
    category: 'all',
    sortBy: 'dateAdded',
    filterBy: 'all',
  })

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false)
  const [isChangelogOpen, setIsChangelogOpen] = useState(false)
  const [showNotificationBanner, setShowNotificationBanner] = useState(true)

  // Create refs for each discount code for scrolling
  const codeRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement | null> }>({})

  // Function to get or create a ref for a code
  const getCodeRef = (codeId: string) => {
    if (!codeRefs.current[codeId]) {
      codeRefs.current[codeId] = createRef<HTMLDivElement | null>()
    }
    return codeRefs.current[codeId]
  }

  // Function to scroll to a specific code
  const scrollToCode = (codeId: string) => {
    const ref = codeRefs.current[codeId]
    if (ref?.current) {
      ref.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      })
      // Add a subtle highlight effect
      ref.current.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)'
      setTimeout(() => {
        if (ref.current) {
          ref.current.style.boxShadow = ''
        }
      }, 2000)
    }
  }

  const filteredCodes = filterCodes(searchFilters)
  const stats = getStats()
  const expiringSoon = getExpiringSoon()

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

  return (
    <div className="min-h-screen transition-colors">
      {/* Offline Status Banner */}
      <OnlineStatusBanner />
      
      <Header 
        onNotificationClick={() => setShowNotificationBanner(!showNotificationBanner)}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        onSyncClick={() => setIsCloudSyncOpen(true)}
        onChangelogClick={() => setIsChangelogOpen(true)}
      />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Install Prompt */}
        <InstallPrompt />

        {/* Notification Banner */}
        {showNotificationBanner && (
          <NotificationBanner 
            expiringSoon={expiringSoon} 
            onCodeClick={scrollToCode}
          />
        )}

        {/* Statistics Overview */}
        <StatsOverview stats={stats} />

        {/* Search and Filter */}
        <div className="mb-8">
          <SearchAndFilter
            filters={searchFilters}
            onFiltersChange={setSearchFilters}
          />
        </div>

        {/* Add Button */}
        <div className="mb-8">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] group"
          >
            <Plus size={24} className="group-hover:rotate-90 transition-transform duration-200" />
            <span className="text-lg">{t('homePage.addNewCode')}</span>
          </button>
        </div>

        {/* Codes List */}
        {filteredCodes.length === 0 ? (
          <EmptyState 
            hasAnyCodes={codes.length > 0}
            onAddCode={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="space-y-6">
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
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Code Modal */}
      <AddCodeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addCode}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Cloud Sync Modal */}
      <CloudSync
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        onManualSync={manualSync}
      />

      {/* Changelog Modal */}
      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
        showNewBadge={hasNewChangelog()}
      />
    </div>
  )
}

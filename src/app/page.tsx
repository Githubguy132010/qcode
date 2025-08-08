'use client'

import { useState, useRef, createRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useDiscountCodes } from '@/hooks/useDiscountCodes'
import { Header } from '@/components/Header'
import { DiscountCodeCard } from '@/components/DiscountCodeCard'
import { AddCodeModal } from '@/components/AddCodeModal'
import { EmptyState } from '@/components/EmptyState'
import { InstallPrompt } from '@/components/InstallPrompt'
import { CombinedDashboard } from '@/components/CombinedDashboard'
import { UnifiedSettingsModal } from '@/components/UnifiedSettingsModal'
import { OnlineStatusBanner } from '@/components/OfflineIndicator'
import { ChangelogPopup } from '@/components/ChangelogPopup'
import { ReleaseNotesModal } from '@/components/ReleaseNotesModal'
import { OnboardingTutorial } from '@/components/OnboardingTutorial'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useTranslation } from 'react-i18next'
import type { SearchFilters } from '@/types/discount-code'

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
  } = useDiscountCodes()
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [isClient, setIsClient] = useState(false)

  // Onboarding tutorial state
  const {
    state: tutorialState,
    startTutorial,
    skipTutorial,
    completeTutorial,
    closeTutorial,
    resetTutorial,
    shouldShowTutorial,
    isInitialized
  } = useOnboarding()

  // Handle restart tutorial from settings
  const handleRestartTutorial = () => {
    setIsUnifiedModalOpen(false)
    resetTutorial()
    // Small delay to let modal close
    setTimeout(() => {
      startTutorial()
    }, 300)
  }

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: '',
    category: 'all',
    sortBy: 'dateAdded',
    filterBy: 'all',
  })

  // State to track when user specifically clicked on "expiring soon" stat card
  const [showOnlyExpiringSoon, setShowOnlyExpiringSoon] = useState(false)

  // State to trigger scrolling to codes list after filter changes
  const [shouldScrollToList, setShouldScrollToList] = useState(false)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isUnifiedModalOpen, setIsUnifiedModalOpen] = useState(false)
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false)
  const [initialTab, setInitialTab] = useState<'general' | 'data' | 'appearance' | 'advanced'>('general')

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

  // Function to scroll to the codes list
  const scrollToCodesList = () => {
    const codesList = document.querySelector('[data-codes-list]')
    if (codesList) {
      codesList.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      })
    }
  }

  /**
   * Handles click events from StatsOverview component
   * Applies appropriate filters based on the clicked stat card
   * @param filterType - The type of filter to apply based on which stat card was clicked
   */
  const handleStatClick = (filterType: 'expired' | 'favorites' | 'expiringSoon') => {
    let newFilters: SearchFilters
    
    switch (filterType) {
      case 'expired':
        newFilters = {
          searchTerm: '',
          category: 'all',
          sortBy: 'expiryDate',
          filterBy: 'expired',
        }
        setShowOnlyExpiringSoon(false)
        break
      case 'favorites':
        newFilters = {
          searchTerm: '',
          category: 'all',
          sortBy: 'dateAdded',
          filterBy: 'favorites',
        }
        setShowOnlyExpiringSoon(false)
        break
      case 'expiringSoon':
        newFilters = {
          searchTerm: '',
          category: 'all',
          sortBy: 'expiryDate',
          filterBy: 'active',
        }
        setShowOnlyExpiringSoon(true)
        break
    }
    
    setSearchFilters(newFilters)
    
    // Trigger scrolling to codes list through useEffect
    setShouldScrollToList(true)
  }

  /**
   * Reset function to clear all search filters back to default values
   * Also resets the "expiring soon" filter state
   */
  const resetFilters = () => {
    setSearchFilters({
      searchTerm: '',
      category: 'all',
      sortBy: 'dateAdded',
      filterBy: 'all',
    })
    setShowOnlyExpiringSoon(false)
  }

  /**
   * Custom filter function that handles special cases for stat card filtering
   * Specifically handles the "expiring soon" case which requires additional filtering
   * beyond the standard filterCodes function
   * @returns Filtered array of discount codes based on current filters
   */
  const getFilteredCodes = () => {
    // Check if we should show only expiring soon codes
    if (showOnlyExpiringSoon) {
      const expiringSoonCodes = getExpiringSoon()
      return expiringSoonCodes
    }
    
    // Otherwise, use normal filtering
    return filterCodes(searchFilters)
  }

  const filteredCodes = getFilteredCodes()
  const stats = getStats()
  const expiringSoon = getExpiringSoon()

  // Set client flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load view mode preference from localStorage
  useEffect(() => {
    if (!isClient) return
    
    try {
      const savedViewMode = localStorage.getItem('qcode-view-mode')
      if (savedViewMode === 'list' || savedViewMode === 'grid') {
        setViewMode(savedViewMode)
      }
    } catch (error) {
      console.error('Error loading view mode preference:', error)
    }
  }, [isClient])

  // Save view mode preference to localStorage
  useEffect(() => {
    if (!isClient) return
    
    try {
      localStorage.setItem('qcode-view-mode', viewMode)
    } catch (error) {
      console.error('Error saving view mode preference:', error)
    }
  }, [viewMode, isClient])

  // useEffect to handle scrolling to codes list after state changes
  useEffect(() => {
    if (shouldScrollToList) {
      scrollToCodesList()
      setShouldScrollToList(false)
    }
  }, [shouldScrollToList])

  // Show tutorial for new users (after loading is complete and onboarding hook is initialized)
  useEffect(() => {
    if (!isLoading && isInitialized && codes.length === 0 && shouldShowTutorial) {
      // Small delay to ensure page is fully rendered
      const timer = setTimeout(() => {
        startTutorial()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isLoading, isInitialized, codes.length, shouldShowTutorial, startTutorial])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="theme-text-secondary font-medium" suppressHydrationWarning>
            {t('common.loading')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen transition-colors">
      {/* Offline Status Banner */}
      <OnlineStatusBanner />
      
      <Header
        onNotificationClick={() => {
          // This can be repurposed or removed if no longer needed
          console.log('Notification icon clicked')
        }}
        onSettingsClick={() => {
          setInitialTab('general')
          setIsUnifiedModalOpen(true)
        }}
      />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Install Prompt */}
        <InstallPrompt />

        <CombinedDashboard
          filters={searchFilters}
          onFiltersChange={(newFilters) => {
            setSearchFilters(newFilters);
            setShowOnlyExpiringSoon(false);
          }}
          onReset={resetFilters}
          stats={stats}
          onStatClick={handleStatClick}
          expiringSoon={expiringSoon}
          onCodeClick={scrollToCode}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Add Button */}
        <div className="mb-8">
          <button
            onClick={() => setIsAddModalOpen(true)}
            data-tutorial="add-button"
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
            onResetFilters={resetFilters}
          />
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
      </main>

      {/* Add Code Modal */}
      <AddCodeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addCode}
      />

      {/* Unified Settings Modal */}
      <UnifiedSettingsModal
        isOpen={isUnifiedModalOpen}
        onClose={() => setIsUnifiedModalOpen(false)}
        onRestartTutorial={handleRestartTutorial}
        initialTab={initialTab}
      />

      {/* Changelog Popup */}
      <ChangelogPopup
        onAdvancedReleaseNotes={() => setIsReleaseNotesOpen(true)}
      />

      {/* Release Notes Modal */}
      <ReleaseNotesModal
        isOpen={isReleaseNotesOpen}
        onClose={() => setIsReleaseNotesOpen(false)}
      />

      {/* Onboarding Tutorial */}
      <OnboardingTutorial
        isOpen={tutorialState.isActive}
        onClose={closeTutorial}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
      />
    </div>
  )
}

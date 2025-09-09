'use client'

import { useState, useRef, createRef, useEffect } from 'react'
import { Plus, Database } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { useStorePreferences } from '@/hooks/useStorePreferences'
import { useTranslation } from 'react-i18next'
import { staggerContainer } from '@/lib/animations'
import { AnimatedPage } from '@/components/AnimatedPage'
import type { SearchFilters, DiscountCodeFormData } from '@/types/discount-code'

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
  const { selectedStores, toggleStore, supportedStores } = useStorePreferences()

  const [isFetching, setIsFetching] = useState(false)
  
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
  const [quickAddInitialData, setQuickAddInitialData] = useState<Partial<DiscountCodeFormData> | undefined>(undefined)

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

  // Parse clipboard text for likely discount code data
  const parseClipboardText = (text: string): Partial<DiscountCodeFormData> => {
    const result: Partial<DiscountCodeFormData> = {}

    // Try to derive store from URL if present
    const urlMatch = text.match(/https?:\/\/[^\s)]+/i)
    if (urlMatch) {
      try {
        const u = new URL(urlMatch[0])
        const host = u.hostname.replace(/^www\./, '')
        // Use domain (without TLD) as store hint, e.g., nike.com -> nike
        result.store = host.split('.')[0]
      } catch {}
    }

    // Discount: percentage or currency
    const percentMatch = text.match(/(\d{1,3})\s?%/)
    if (percentMatch) {
      result.discount = `${percentMatch[1]}%`
    } else {
      const euroMatch = text.match(/(?:€|eur|euro)\s?(\d+(?:[.,]\d{1,2})?)/i)
      if (euroMatch) {
        const amount = euroMatch[1].replace(',', '.')
        result.discount = `€${amount}`
      }
    }

    // Code: look for explicit labels first
    const labeled = text.match(/\b(?:code|coupon|promo|voucher)\s*:?\s*([A-Z0-9-]{4,20})\b/i)
    if (labeled) {
      result.code = labeled[1].toUpperCase()
    } else {
      // Fallback: find the first strong token that looks like a code
      const tokens = text.toUpperCase().match(/\b[A-Z0-9][A-Z0-9-]{3,19}\b/g) || []
      const token = tokens.find(tok => {
        // Avoid picking dates or pure numbers
        const hasLetter = /[A-Z]/.test(tok)
        const notDate = !/\d{2,4}-\d{1,2}-\d{1,2}/.test(tok)
        const notPrice = !/(?:EUR|€)\d/.test(tok)
        return hasLetter && notDate && notPrice
      })
      if (token) result.code = token
    }

    // Heuristic: if the code contains a number and no discount was found yet,
    // interpret that number as a percentage (e.g., WELCOME25 -> 25%).
    if (result.code && !result.discount) {
      const nums = result.code.match(/\d{1,3}/g)
      if (nums && nums.length > 0) {
        const last = parseInt(nums[nums.length - 1]!, 10)
        // Only use sensible percentages to avoid false positives
        if (!Number.isNaN(last) && last >= 1 && last <= 95) {
          result.discount = `${last}%`
        }
      }
    }

    return result
  }

  // Open Add modal; try to prefill from clipboard if possible
  const handleOpenAdd = async () => {
    try {
      if ('clipboard' in navigator && 'readText' in navigator.clipboard) {
        const text = await navigator.clipboard.readText()
        const parsed = parseClipboardText(text)
        if (parsed.code) {
          setQuickAddInitialData(parsed)
        } else {
          setQuickAddInitialData(undefined)
        }
      } else {
        setQuickAddInitialData(undefined)
      }
    } catch (err) {
      console.warn('Clipboard read skipped/failed:', err)
      setQuickAddInitialData(undefined)
    } finally {
      setIsAddModalOpen(true)
    }
  }

  const handleFetchCoupons = async () => {
    if (selectedStores.length === 0) {
      alert('Please select stores to fetch from in the settings.')
      return
    }

    setIsFetching(true)
    let newCouponsCount = 0

    for (const store of selectedStores) {
      try {
        const response = await fetch(`/api/scrape?store=${store.toLowerCase()}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch coupons for ${store}`)
        }
        const newCoupons: DiscountCodeFormData[] = await response.json()

        for (const newCoupon of newCoupons) {
          const isDuplicate = codes.some(
            (existingCode) =>
              existingCode.code === newCoupon.code && existingCode.store.toLowerCase() === newCoupon.store.toLowerCase()
          )

          if (!isDuplicate) {
            addCode(newCoupon)
            newCouponsCount++
          }
        }
      } catch (error) {
        console.error(`Error fetching coupons for ${store}:`, error)
        alert(`Could not fetch coupons for ${store}.`)
      }
    }

    setIsFetching(false)
    alert(`Finished fetching. Added ${newCouponsCount} new coupons.`)
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
      <motion.div 
        className="min-h-screen flex items-center justify-center transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            className="rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
          <motion.p 
            className="theme-text-secondary font-medium" 
            suppressHydrationWarning
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t('common.loading')}
          </motion.p>
        </div>
      </motion.div>
    )
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen transition-colors">
        {/* Offline Status Banner */}
        <OnlineStatusBanner />
        
        <Header
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

          {/* Action Buttons */}
          {codes.length > 0 && (
            <motion.div
              className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={handleOpenAdd}
                data-tutorial="add-button"
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg group"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.2), 0 8px 10px -6px rgba(59, 130, 246, 0.2)'
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 500, damping: 30, mass: 1 }}
              >
                <motion.div
                  animate={{ rotate: [0, 0, 0, 90] }}
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <Plus size={24} />
                </motion.div>
                <span className="text-lg">{t('homePage.addNewCode')}</span>
              </motion.button>

              <motion.button
                onClick={handleFetchCoupons}
                disabled={isFetching}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 20px 25px -5px rgba(168, 85, 247, 0.2), 0 8px 10px -6px rgba(168, 85, 247, 0.2)'
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 500, damping: 30, mass: 1 }}
              >
                {isFetching ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Database size={24} />
                  </motion.div>
                ) : (
                  <Database size={24} />
                )}
                <span className="text-lg">{isFetching ? 'Fetching...' : 'Fetch Coupons'}</span>
              </motion.button>
            </motion.div>
          )}

          {/* Codes List */}
          {filteredCodes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <EmptyState
                hasAnyCodes={codes.length > 0}
                onAddCode={handleOpenAdd}
                onResetFilters={resetFilters}
              />
            </motion.div>
          ) : (
            <motion.div 
              className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-6'}`} 
              data-codes-list
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
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
              </AnimatePresence>
            </motion.div>
          )}
        </main>

        {/* Add Code Modal */}
        <AddCodeModal
          isOpen={isAddModalOpen}
          onClose={() => { setIsAddModalOpen(false); setQuickAddInitialData(undefined) }}
          onAdd={addCode}
          initialData={quickAddInitialData}
          prefillSource={quickAddInitialData ? 'clipboard' : undefined}
        />

        {/* Unified Settings Modal */}
        <UnifiedSettingsModal
          isOpen={isUnifiedModalOpen}
          onClose={() => setIsUnifiedModalOpen(false)}
          onRestartTutorial={handleRestartTutorial}
          initialTab={initialTab}
          selectedStores={selectedStores}
          toggleStore={toggleStore}
          supportedStores={supportedStores}
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
    </AnimatedPage>
  )
}

'use client'

import { useState } from 'react'
import { Header } from './Header'
import { UnifiedSettingsModal } from './UnifiedSettingsModal'
import { useStorePreferences } from '@/hooks/useStorePreferences'

export function HeaderWrapper() {
  const { selectedStores, toggleStore, supportedStores } = useStorePreferences()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [initialTab, setInitialTab] = useState<'general' | 'data' | 'appearance' | 'advanced'>('general')

  const handleSettingsClick = () => {
    setInitialTab('general')
    setIsSettingsOpen(true)
  }



  const handleRestartTutorial = () => {
    // Reset tutorial state
    localStorage.removeItem('qcode-tutorial-completed')
    localStorage.removeItem('qcode-tutorial-skipped')
    // Reload to trigger tutorial
    window.location.reload()
  }

  return (
    <>
      <Header
        onSettingsClick={handleSettingsClick}
      />
      <UnifiedSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRestartTutorial={handleRestartTutorial}
        initialTab={initialTab}
        selectedStores={selectedStores}
        toggleStore={toggleStore}
        supportedStores={supportedStores}
      />
    </>
  )
}
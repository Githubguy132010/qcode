'use client'

import { useState } from 'react'
import { Header } from './Header'
import { UnifiedSettingsModal } from './UnifiedSettingsModal'

export function HeaderWrapper() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [initialTab, setInitialTab] = useState<'general' | 'data' | 'cloud' | 'appearance' | 'advanced'>('general')

  const handleSettingsClick = () => {
    setInitialTab('general')
    setIsSettingsOpen(true)
  }

  const handleSyncClick = () => {
    setInitialTab('cloud')
    setIsSettingsOpen(true)
  }

  const handleManualSync = async () => {
    // Implement manual sync logic
    return true
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
        onSyncClick={handleSyncClick}
      />
      <UnifiedSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onManualSync={handleManualSync}
        onRestartTutorial={handleRestartTutorial}
        initialTab={initialTab}
      />
    </>
  )
}
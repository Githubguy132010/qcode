'use client'

import { useState } from 'react'
import { Header } from './Header'
import { UnifiedSettingsModal } from './UnifiedSettingsModal'

export function HeaderWrapper() {
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

  const safeInitialTab = initialTab === 'appearance' ? 'languages' : initialTab

  return (
    <>
      <Header
        onNotificationClick={() => console.log('Notification clicked')}
        onSettingsClick={handleSettingsClick}
      />
      <UnifiedSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRestartTutorial={handleRestartTutorial}
        initialTab={safeInitialTab}
      />
    </>
  )
}
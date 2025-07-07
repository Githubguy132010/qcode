'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { DiscountCode } from '@/types/discount-code'
import { SyncStatus, SyncEvent, SyncConflict, ConflictResolution, SyncSettings, CloudSyncData } from '@/types/cloud-sync'
import { CloudProvider, availableProviders, createGitHubGistProvider } from '@/utils/cloud-providers'
import { 
  createSyncData, 
  validateSyncData, 
  detectConflicts, 
  resolveConflicts,
  createSyncBackup,
  getDeviceId 
} from '@/utils/sync-utils'

const SYNC_SETTINGS_KEY = 'qcode-sync-settings'
const LAST_SYNC_KEY = 'qcode-last-sync'

const defaultSyncSettings: SyncSettings = {
  autoSync: true,
  syncInterval: 30, // 30 minutes
  enabledProviders: ['local-cloud'],
  conflictResolution: 'merge',
  lastDeviceSync: {}
}

export function useCloudSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    conflictCount: 0
  })
  
  const [syncSettings, setSyncSettings] = useState<SyncSettings>(defaultSyncSettings)
  const [conflicts, setConflicts] = useState<SyncConflict[]>([])
  const [providers, setProviders] = useState<CloudProvider[]>([])
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([])

  // Initialize providers on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setProviders(availableProviders)
    }
  }, [])
  const addSyncEvent = useCallback((event: SyncEvent) => {
    setSyncEvents(prev => [event, ...prev.slice(0, 49)]) // Keep last 50 events
  }, [])

  // Load sync settings on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(SYNC_SETTINGS_KEY)
      if (stored) {
        const settings = JSON.parse(stored)
        setSyncSettings({ ...defaultSyncSettings, ...settings })
      }
    } catch (error) {
      console.error('Error loading sync settings:', error)
    }
  }, [])

  // Save sync settings
  const saveSyncSettings = useCallback((settings: SyncSettings) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(settings))
      setSyncSettings(settings)
    } catch (error) {
      console.error('Error saving sync settings:', error)
    }
  }, [])

  // Monitor online status
  const handleOnline = useCallback(() => {
    setSyncStatus(prev => ({ ...prev, isOnline: true }))
    addSyncEvent({ type: 'sync_start', message: 'Back online' })
  }, [addSyncEvent])

  const handleOffline = useCallback(() => {
    setSyncStatus(prev => ({ ...prev, isOnline: false }))
    addSyncEvent({ type: 'offline', message: 'Gone offline' })
  }, [addSyncEvent])

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  // Get enabled providers
  const getEnabledProviders = useCallback(() => {
    return providers.filter(provider => 
      syncSettings.enabledProviders.includes(provider.id) && 
      provider.isAvailable()
    )
  }, [providers, syncSettings.enabledProviders])

  // Add GitHub provider with token
  const addGitHubProvider = useCallback((token: string, gistId?: string) => {
    const githubProvider = createGitHubGistProvider(token, gistId)
    setProviders(prev => {
      const filtered = prev.filter(p => p.id !== 'github-gist')
      return [...filtered, githubProvider]
    })
    
    // Enable GitHub provider if not already enabled
    if (!syncSettings.enabledProviders.includes('github-gist')) {
      const newSettings = {
        ...syncSettings,
        enabledProviders: [...syncSettings.enabledProviders, 'github-gist']
      }
      saveSyncSettings(newSettings)
    }
  }, [syncSettings, saveSyncSettings])

  // Remove provider
  const removeProvider = useCallback((providerId: string) => {
    setProviders(prev => prev.filter(p => p.id !== providerId))
    
    // Remove from enabled providers
    const newSettings = {
      ...syncSettings,
      enabledProviders: syncSettings.enabledProviders.filter(id => id !== providerId)
    }
    saveSyncSettings(newSettings)
  }, [syncSettings, saveSyncSettings])

  // Sync to cloud
  const syncToCloud = useCallback(async (codes: DiscountCode[]): Promise<boolean> => {
    if (!syncStatus.isOnline || syncStatus.isSyncing) {
      return false
    }

    const enabledProviders = getEnabledProviders()
    if (enabledProviders.length === 0) {
      addSyncEvent({ type: 'sync_error', message: 'No enabled providers available' })
      return false
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: undefined }))
    addSyncEvent({ type: 'sync_start', message: 'Starting sync to cloud...' })

    try {
      const syncData = createSyncData(codes)
      const backup = createSyncBackup(codes)
      
      // Store backup before sync
      localStorage.setItem('qcode-sync-backup', backup)

      let success = false
      const errors: string[] = []

      for (const provider of enabledProviders) {
        try {
          await provider.upload(syncData)
          success = true
          addSyncEvent({ 
            type: 'sync_success', 
            message: `Synced to ${provider.name}`,
            data: { provider: provider.id, codeCount: codes.length }
          })
        } catch (error) {
          const errorMessage = `${provider.name}: ${(error as Error).message}`
          errors.push(errorMessage)
          console.error(`Sync error for ${provider.name}:`, error)
        }
      }

      if (success) {
        const now = new Date()
        localStorage.setItem(LAST_SYNC_KEY, now.toISOString())
        setSyncStatus(prev => ({ 
          ...prev, 
          isSyncing: false, 
          lastSync: now,
          error: errors.length > 0 ? `Partial sync: ${errors.join(', ')}` : undefined
        }))
        
        // Update device sync timestamp
        const newSettings = {
          ...syncSettings,
          lastDeviceSync: {
            ...syncSettings.lastDeviceSync,
            [getDeviceId()]: now
          }
        }
        saveSyncSettings(newSettings)
        
        return true
      } else {
        throw new Error(errors.join('; '))
      }
    } catch (error) {
      const errorMessage = (error as Error).message
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false, 
        error: errorMessage 
      }))
      addSyncEvent({ 
        type: 'sync_error', 
        message: `Sync failed: ${errorMessage}` 
      })
      return false
    }
  }, [syncStatus, getEnabledProviders, syncSettings, saveSyncSettings, addSyncEvent])

  // Sync from cloud
  const syncFromCloud = useCallback(async (): Promise<DiscountCode[] | null> => {
    if (!syncStatus.isOnline || syncStatus.isSyncing) {
      return null
    }

    const enabledProviders = getEnabledProviders()
    if (enabledProviders.length === 0) {
      addSyncEvent({ type: 'sync_error', message: 'No enabled providers available' })
      return null
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: undefined }))
    addSyncEvent({ type: 'sync_start', message: 'Syncing from cloud...' })

    try {
      let latestData: CloudSyncData | null = null
      let latestTimestamp = new Date(0)

      // Download from all providers and get the most recent
      for (const provider of enabledProviders) {
        try {
          const data = await provider.download()
          if (data && validateSyncData(data)) {
            const dataTimestamp = new Date(data.lastModified)
            if (dataTimestamp > latestTimestamp) {
              latestData = data
              latestTimestamp = dataTimestamp
            }
            addSyncEvent({
              type: 'sync_success',
              message: `Downloaded from ${provider.name}`,
              data: { provider: provider.id, timestamp: dataTimestamp }
            })
          }
        } catch (error) {
          console.error(`Download error for ${provider.name}:`, error)
          addSyncEvent({
            type: 'sync_error',
            message: `Download failed from ${provider.name}: ${(error as Error).message}`
          })
        }
      }

      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        lastSync: new Date()
      }))

      if (latestData) {
        return latestData.codes as DiscountCode[]
      } else {
        addSyncEvent({ type: 'sync_error', message: 'No valid data found in cloud' })
        return null
      }
    } catch (error) {
      const errorMessage = (error as Error).message
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false, 
        error: errorMessage 
      }))
      addSyncEvent({ 
        type: 'sync_error', 
        message: `Sync from cloud failed: ${errorMessage}` 
      })
      return null
    }
  }, [syncStatus, getEnabledProviders, addSyncEvent])

  // Perform full sync (up and down with conflict resolution)
  const performFullSync = useCallback(async (
    localCodes: DiscountCode[],
    onCodesUpdate: (codes: DiscountCode[]) => void
  ): Promise<boolean> => {
    if (!syncStatus.isOnline || syncStatus.isSyncing) {
      return false
    }

    try {
      addSyncEvent({ type: 'sync_start', message: 'Starting full sync...' })
      
      // First, try to get remote data
      const remoteCodes = await syncFromCloud()
      
      if (!remoteCodes) {
        // No remote data, just upload local data
        return await syncToCloud(localCodes)
      }

      // Detect conflicts
      const detectedConflicts = detectConflicts(localCodes, remoteCodes)
      
      if (detectedConflicts.length > 0) {
        setConflicts(detectedConflicts)
        setSyncStatus(prev => ({ 
          ...prev, 
          conflictCount: detectedConflicts.length 
        }))
        
        addSyncEvent({
          type: 'conflict_detected',
          message: `${detectedConflicts.length} conflicts detected`,
          data: { conflictCount: detectedConflicts.length }
        })
        
        // Auto-resolve based on settings
        const resolvedCodes = resolveConflicts(
          detectedConflicts,
          syncSettings.conflictResolution,
          localCodes,
          remoteCodes
        )
        
        onCodesUpdate(resolvedCodes)
        
        // Clear conflicts after resolution
        setConflicts([])
        setSyncStatus(prev => ({ ...prev, conflictCount: 0 }))
        
        // Upload resolved data
        return await syncToCloud(resolvedCodes)
      } else {
        // No conflicts, merge and update
        const { mergeCodes } = await import('@/utils/sync-utils')
        const mergedCodes = mergeCodes(localCodes, remoteCodes)
        
        onCodesUpdate(mergedCodes)
        return await syncToCloud(mergedCodes)
      }
    } catch (error) {
      console.error('Full sync error:', error)
      addSyncEvent({
        type: 'sync_error',
        message: `Full sync failed: ${(error as Error).message}`
      })
      return false
    }
  }, [syncStatus, syncFromCloud, syncToCloud, syncSettings.conflictResolution, addSyncEvent])

  // Resolve conflicts manually
  const resolveConflict = useCallback((
    conflictId: string, 
    resolution: ConflictResolution,
    localCodes: DiscountCode[],
    onCodesUpdate: (codes: DiscountCode[]) => void
  ) => {
    const conflict = conflicts.find(c => c.id === conflictId)
    if (!conflict) return

    const updatedConflicts = conflicts.filter(c => c.id !== conflictId)
    setConflicts(updatedConflicts)
    
    // Apply resolution
    const updatedCodes = [...localCodes]
    const localCode = conflict.localData as DiscountCode
    const remoteCode = conflict.remoteData as DiscountCode
    
    const codeIndex = updatedCodes.findIndex(c => c.id === conflictId)
    
    switch (resolution) {
      case 'local':
        // Keep local version (no change needed)
        break
      case 'remote':
        if (codeIndex >= 0) {
          updatedCodes[codeIndex] = remoteCode
        }
        break
      case 'merge':
        if (codeIndex >= 0) {
          updatedCodes[codeIndex] = {
            ...remoteCode,
            timesUsed: Math.max(localCode.timesUsed, remoteCode.timesUsed),
            isFavorite: localCode.isFavorite || remoteCode.isFavorite,
            dateAdded: localCode.dateAdded > remoteCode.dateAdded ? localCode.dateAdded : remoteCode.dateAdded
          }
        }
        break
    }
    
    onCodesUpdate(updatedCodes)
    setSyncStatus(prev => ({ ...prev, conflictCount: updatedConflicts.length }))
  }, [conflicts])

  // Auto-sync setup
  useEffect(() => {
    if (!syncSettings.autoSync || !syncStatus.isOnline) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
      return
    }

    const interval = syncSettings.syncInterval * 60 * 1000 // Convert to milliseconds
    syncIntervalRef.current = setInterval(() => {
      if (syncStatus.isOnline && !syncStatus.isSyncing) {
        addSyncEvent({ type: 'sync_start', message: 'Auto-sync triggered' })
        // Note: Auto-sync would need access to codes and update function
        // This should be triggered from the main component
      }
    }, interval)

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [syncSettings.autoSync, syncSettings.syncInterval, syncStatus.isOnline, syncStatus.isSyncing, addSyncEvent])

  // Get last sync time
  const getLastSyncTime = useCallback(() => {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(LAST_SYNC_KEY)
      return stored ? new Date(stored) : null
    } catch {
      return null
    }
  }, [])

  return {
    syncStatus,
    syncSettings,
    conflicts,
    providers: providers.filter(p => p.isAvailable()),
    syncEvents: syncEvents.slice(0, 10), // Return last 10 events
    
    // Actions
    saveSyncSettings,
    addGitHubProvider,
    removeProvider,
    syncToCloud,
    syncFromCloud,
    performFullSync,
    resolveConflict,
    getLastSyncTime,
    
    // Utils
    getEnabledProviders,
    clearSyncEvents: () => setSyncEvents([])
  }
}

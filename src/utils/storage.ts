import type { DiscountCode } from '@/types/discount-code'

interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync: {
    register(tag: string): Promise<void>
  }
}

const STORAGE_KEY = 'qcode-discount-codes'
const SETTINGS_KEY = 'qcode-settings'
const PENDING_SYNC_KEY = 'qcode-pending-sync'

export interface AppSettings {
  theme: 'dark' // Dark-only app: theme is fixed
  notifications: boolean
  expiryWarningDays: number
  autoArchiveExpired: boolean
}

export interface PendingSync {
  type: 'add' | 'update' | 'delete'
  data: DiscountCode
  timestamp: number
}

export const defaultSettings: AppSettings = {
  theme: 'dark',
  notifications: true,
  expiryWarningDays: 7,
  autoArchiveExpired: false,
}

// Background Sync Support
export const addToPendingSync = (type: PendingSync['type'], data: DiscountCode): void => {
  try {
    if (typeof window === 'undefined') return
    
    const pending = getPendingSync()
    const newPending: PendingSync = {
      type,
      data,
      timestamp: Date.now()
    }
    
    pending.push(newPending)
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending))
    
    // Register background sync if available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        const syncRegistration = registration as ServiceWorkerRegistrationWithSync
        return syncRegistration.sync.register('discount-codes-sync')
      }).catch(console.error)
    }
  } catch (error) {
    console.error('Error adding to pending sync:', error)
  }
}

export const getPendingSync = (): PendingSync[] => {
  try {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(PENDING_SYNC_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error getting pending sync:', error)
    return []
  }
}

export const clearPendingSync = (): void => {
  try {
    if (typeof window === 'undefined') return
    localStorage.removeItem(PENDING_SYNC_KEY)
  } catch (error) {
    console.error('Error clearing pending sync:', error)
  }
}

// Discount Codes Storage
export const loadDiscountCodes = (): DiscountCode[] => {
  try {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const codes = JSON.parse(stored)
    return codes.map((code: Record<string, unknown>) => ({
      ...code,
      dateAdded: new Date(code.dateAdded as string),
      expiryDate: code.expiryDate ? new Date(code.expiryDate as string) : undefined,
    }))
  } catch (error) {
    console.error('Error loading discount codes:', error)
    return []
  }
}

export const saveDiscountCodes = (codes: DiscountCode[], syncType?: PendingSync['type'], changedCode?: DiscountCode): void => {
  try {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(codes))
    
    // Add to background sync queue if specified
    if (syncType && changedCode) {
      addToPendingSync(syncType, changedCode)
    }
  } catch (error) {
    console.error('Error saving discount codes:', error)
  }
}

// Settings Storage
export const loadSettings = (): AppSettings => {
  try {
    if (typeof window === 'undefined') return defaultSettings
    
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (!stored) return defaultSettings
    
    // Dark-only app: force theme to 'dark' regardless of stored value
    return { ...defaultSettings, ...JSON.parse(stored), theme: 'dark' }
  } catch (error) {
    console.error('Error loading settings:', error)
    return defaultSettings
  }
}

export const saveSettings = (settings: AppSettings): void => {
  try {
    if (typeof window === 'undefined') return
    
    // Dark-only app: ensure we always store theme as 'dark'
    const toSave: AppSettings = { ...settings, theme: 'dark' }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(toSave))
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

// Export/Import functionality
export const exportCodes = (codes: DiscountCode[]): string => {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    codes: codes,
  }
  
  return JSON.stringify(exportData, null, 2)
}

export const importCodes = (jsonData: string): DiscountCode[] => {
  try {
    const importData = JSON.parse(jsonData)
    
    if (!importData.codes || !Array.isArray(importData.codes)) {
      throw new Error('Invalid import format')
    }
    
    return importData.codes.map((code: Record<string, unknown>) => ({
      ...code,
      dateAdded: new Date((code.dateAdded as string) || new Date()),
      expiryDate: code.expiryDate ? new Date(code.expiryDate as string) : undefined,
    }))
  } catch (error) {
    console.error('Error importing codes:', error)
    throw new Error('Could not import codes. Please check the file format.')
  }
}

// Backup functionality
export const createBackup = (): string => {
  const codes = loadDiscountCodes()
  const settings = loadSettings()
  
  const backup = {
    version: '1.0',
    backupDate: new Date().toISOString(),
    codes,
    settings,
  }
  
  return JSON.stringify(backup, null, 2)
}

export const restoreBackup = (backupData: string): void => {
  try {
    const backup = JSON.parse(backupData)
    
    if (backup.codes) {
      const codes = backup.codes.map((code: Record<string, unknown>) => ({
        ...code,
        dateAdded: new Date((code.dateAdded as string) || new Date()),
        expiryDate: code.expiryDate ? new Date(code.expiryDate as string) : undefined,
      }))
      saveDiscountCodes(codes)
    }
    
    if (backup.settings) {
      // Dark-only app: always coerce theme to 'dark' on restore
      saveSettings({ ...defaultSettings, ...backup.settings, theme: 'dark' })
    }
  } catch (error) {
    console.error('Error restoring backup:', error)
    throw new Error('Could not restore backup. Please check the file format.')
  }
}

// Cleanup expired codes
export const cleanupExpiredCodes = (): number => {
  const codes = loadDiscountCodes()
  const now = new Date()
  
  const cleanedCodes = codes.filter(code => {
    if (!code.expiryDate) return true
    if (code.isArchived) return true
    
    // Remove codes expired more than 30 days ago
    const daysSinceExpiry = Math.floor(
      (now.getTime() - code.expiryDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    return daysSinceExpiry <= 30
  })
  
  const removedCount = codes.length - cleanedCodes.length
  
  if (removedCount > 0) {
    saveDiscountCodes(cleanedCodes)
  }
  
  return removedCount
}

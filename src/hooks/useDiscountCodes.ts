'use client'

import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { DiscountCode, DiscountCodeFormData, SearchFilters } from '@/types/discount-code'

const STORAGE_KEY = 'qcode-discount-codes'

export function useDiscountCodes() {
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Set client flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load codes from localStorage
  useEffect(() => {
    if (!isClient) return
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedCodes = JSON.parse(stored).map((code: Record<string, unknown>) => ({
          ...code,
          dateAdded: new Date(code.dateAdded as string),
          expiryDate: code.expiryDate ? new Date(code.expiryDate as string) : undefined,
          usedAt: code.usedAt ? new Date(code.usedAt as string) : null,
          usageHistory: code.usageHistory ? (code.usageHistory as Array<{ date: string | Date; estimatedSavings?: number }>).map(usage => ({
            ...usage,
            date: new Date(usage.date)
          })) : undefined,
        }))
        setCodes(parsedCodes)
      }
    } catch (error) {
      console.error('Error loading discount codes:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isClient])

  // Save codes to localStorage
  const saveCodes = useCallback((newCodes: DiscountCode[]) => {
    if (!isClient) return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCodes))
      setCodes(newCodes)
    } catch (error) {
      console.error('Error saving discount codes:', error)
    }
  }, [isClient])

  // Add new discount code
  const addCode = useCallback((formData: DiscountCodeFormData) => {
    const newCode: DiscountCode = {
      id: uuidv4(),
      code: formData.code.trim(),
      store: formData.store.trim(),
      discount: formData.discount.trim(),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      category: formData.category,
      description: formData.description?.trim() || '',
      isFavorite: false,
      isArchived: false,
      dateAdded: new Date(),
      timesUsed: 0,
      source: formData.source ?? 'manual',
      barcodeData: formData.barcodeData,
      tags: formData.tags ?? [],
      usedAt: null,
    }

    const updatedCodes = [newCode, ...codes]
    saveCodes(updatedCodes)
    return newCode
  }, [codes, saveCodes])

  // Update existing discount code
  const updateCode = useCallback((id: string, updates: Partial<DiscountCode>) => {
    const updatedCodes = codes.map(code =>
      code.id === id ? {
        ...code,
        ...updates
      } : code
    )
    saveCodes(updatedCodes)
  }, [codes, saveCodes])

  // Delete discount code
  const deleteCode = useCallback((id: string) => {
    const updatedCodes = codes.filter(code => code.id !== id)
    saveCodes(updatedCodes)
  }, [codes, saveCodes])

  // Toggle favorite status
  const toggleFavorite = useCallback((id: string) => {
    updateCode(id, { isFavorite: !codes.find(c => c.id === id)?.isFavorite })
  }, [codes, updateCode])

  // Toggle archived status
  const toggleArchived = useCallback((id: string) => {
    updateCode(id, { isArchived: !codes.find(c => c.id === id)?.isArchived })
  }, [codes, updateCode])

  // Increment usage count
  const incrementUsage = useCallback((id: string) => {
    const code = codes.find(c => c.id === id)
    if (code) {
      const now = new Date()
      const usageHistory = code.usageHistory || []
      
      // Calculate actual savings for this usage
      let actualSavings: number | undefined = undefined
      if (code.discount.includes('€')) {
        actualSavings = parseFloat(code.discount.replace('€', '')) || 0
      } else if (code.discount.includes('%') && code.originalPrice) {
        const percentage = parseFloat(code.discount.replace('%', '')) || 0
        actualSavings = (percentage / 100) * code.originalPrice
      }
      
      const newUsageEntry = { 
        date: now,
        estimatedSavings: actualSavings
      }
      
      updateCode(id, { 
        timesUsed: code.timesUsed + 1,
        usageHistory: [...usageHistory, newUsageEntry],
        usedAt: now,
      })
    }
  }, [codes, updateCode])

  // Check if code is expired
  const isExpired = useCallback((code: DiscountCode) => {
    if (!code.expiryDate) return false
    return new Date() > code.expiryDate
  }, [])

  // Filter and search codes
  const filterCodes = useCallback((filters: SearchFilters) => {
    return codes.filter(code => {
      // Search term filter
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase()
        const matchesSearch = 
          code.code.toLowerCase().includes(term) ||
          code.store.toLowerCase().includes(term) ||
          code.description?.toLowerCase().includes(term) ||
          code.category.toLowerCase().includes(term)
        
        if (!matchesSearch) return false
      }

      // Category filter
      if (filters.category && filters.category !== 'all') {
        if (code.category !== filters.category) return false
      }

      // Status filter
      switch (filters.filterBy) {
        case 'active':
          return !isExpired(code) && !code.isArchived
        case 'expired':
          return isExpired(code) && !code.isArchived
        case 'favorites':
          return code.isFavorite && !code.isArchived
        case 'archived':
          return code.isArchived
        case 'all':
        default:
          return !code.isArchived
      }
    }).sort((a, b) => {
      // Sort by selected option
      switch (filters.sortBy) {
        case 'store':
          return a.store.localeCompare(b.store)
        case 'category':
          return a.category.localeCompare(b.category)
        case 'expiryDate':
          if (!a.expiryDate && !b.expiryDate) return 0
          if (!a.expiryDate) return 1
          if (!b.expiryDate) return -1
          return a.expiryDate.getTime() - b.expiryDate.getTime()
        case 'timesUsed':
          return b.timesUsed - a.timesUsed
        case 'dateAdded':
        default:
          return b.dateAdded.getTime() - a.dateAdded.getTime()
      }
    })
  }, [codes, isExpired])

  // Get codes expiring soon (within 7 days)
  const getExpiringSoon = useCallback(() => {
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    
    return codes.filter(code => 
      code.expiryDate && 
      !isExpired(code) && 
      !code.isArchived &&
      code.expiryDate <= sevenDaysFromNow
    )
  }, [codes, isExpired])

  // Schedule local notifications for upcoming expiries (best-effort)
  useEffect(() => {
    // only in browser
    if (typeof window === 'undefined') return
    // avoid spamming: throttle to once per day
    const todayKey = new Date().toISOString().split('T')[0]
    const lastKey = localStorage.getItem('qcode-last-expiry-notify')
    if (lastKey === todayKey) return

    try {
      const soon = codes.filter(c => c.expiryDate && !isExpired(c) && !c.isArchived)
      const now = new Date()
      const inThreeDays = new Date(now)
      inThreeDays.setDate(now.getDate() + 3)

      const due = soon.filter(c => (c.expiryDate as Date) <= inThreeDays)

      if (due.length === 0) return

      if ('Notification' in window) {
        const permission = Notification.permission
        if (permission === 'granted') {
          const title = due.length === 1 
            ? 'Discount code expiring soon'
            : `${due.length} discount codes expiring soon`
          const body = due.slice(0, 3).map(c => `${c.store}: ${c.code}`).join('\n') + (due.length > 3 ? `\n+${due.length - 3} more...` : '')
          new Notification(title, { body, icon: '/icon-192x192.png', badge: '/icon-192x192.png' })
          localStorage.setItem('qcode-last-expiry-notify', todayKey)
        } else if (permission === 'default') {
          // Ask once; user can decide.
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
              const title = due.length === 1 
                ? 'Discount code expiring soon'
                : `${due.length} discount codes expiring soon`
              const body = due.slice(0, 3).map(c => `${c.store}: ${c.code}`).join('\n') + (due.length > 3 ? `\n+${due.length - 3} more...` : '')
              new Notification(title, { body, icon: '/icon-192x192.png', badge: '/icon-192x192.png' })
              localStorage.setItem('qcode-last-expiry-notify', todayKey)
            }
          })
        }
      }
    } catch (e) {
      console.warn('Expiry notification skipped:', e)
    }
  }, [codes, isExpired])

  // Get statistics
  const getStats = useCallback(() => {
    const activeCodes = codes.filter(code => !isExpired(code) && !code.isArchived)
    const expiredCodes = codes.filter(code => isExpired(code) && !code.isArchived)
    const favorites = codes.filter(code => code.isFavorite && !code.isArchived)
    const archived = codes.filter(code => code.isArchived)
    const totalUsages = codes.reduce((sum, code) => sum + code.timesUsed, 0)

    return {
      total: codes.length,
      active: activeCodes.length,
      expired: expiredCodes.length,
      favorites: favorites.length,
      archived: archived.length,
      totalUsages,
      expiringSoon: getExpiringSoon().length,
    }
  }, [codes, isExpired, getExpiringSoon])

  return {
    codes,
    isLoading,
    addCode,
    updateCode,
    deleteCode,
    toggleFavorite,
    toggleArchived,
    incrementUsage,
    isExpired,
    filterCodes,
    getExpiringSoon,
    getStats,
  }
}

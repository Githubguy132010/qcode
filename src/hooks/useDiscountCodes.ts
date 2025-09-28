'use client'

import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import type { DiscountCode, DiscountCodeFormData, SearchFilters } from '@/types/discount-code'

const STORAGE_KEY = 'qcode-discount-codes'

export function useDiscountCodes() {
  const { user, loading: authLoading } = useAuth()
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Set client flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load codes from localStorage or Supabase
  useEffect(() => {
    if (authLoading || !isClient) return

    const loadData = async () => {
      setIsLoading(true)
      if (user && supabase) {
        // Fetch from Supabase
        const { data, error } = await supabase
          .from('codes')
          .select('*')
          .eq('user_id', user.id)
          .order('dateAdded', { ascending: false })

        if (error) {
          console.error('Error fetching codes from Supabase:', error)
        } else if (data) {
          const parsedCodes = data.map((code: Record<string, unknown>) => ({
            ...code,
            id: code.id as string,
            code: code.code as string,
            store: code.store as string,
            discount: code.discount as string,
            originalPrice: code.originalPrice as number | undefined,
            category: code.category as string,
            description: code.description as string | undefined,
            isFavorite: code.isFavorite as boolean,
            isArchived: code.isArchived as boolean,
            dateAdded: new Date(code.dateAdded as string),
            expiryDate: code.expiryDate ? new Date(code.expiryDate as string) : undefined,
            timesUsed: code.timesUsed as number,
            qrCode: code.qrCode as string | undefined,
            usageHistory: code.usageHistory ? (code.usageHistory as Record<string, unknown>[]).map((usage: Record<string, unknown>) => ({
              ...usage,
              date: new Date(usage.date as string)
            })) : [],
          }));
          setCodes(parsedCodes as DiscountCode[]);
        }
      } else if (user && !supabase) {
        // Handle case where user is logged in but supabase is not available
        console.error('Supabase client not available. Please check environment variables.')
      } else {
        // Fetch from localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) {
            const parsedCodes = JSON.parse(stored).map((code: Record<string, unknown>) => ({
              ...code,
              dateAdded: new Date(code.dateAdded as string),
              expiryDate: code.expiryDate ? new Date(code.expiryDate as string) : undefined,
              usageHistory: code.usageHistory ? (code.usageHistory as Array<{ date: string | Date; estimatedSavings?: number }>).map(usage => ({
                ...usage,
                date: new Date(usage.date)
              })) : [],
            }))
            setCodes(parsedCodes)
          } else {
            setCodes([]) // Clear codes if no user and no local data
          }
        } catch (error) {
          console.error('Error loading discount codes from localStorage:', error)
          setCodes([])
        }
      }
      setIsLoading(false)
    }

    loadData()

    // Set up Supabase real-time subscription
    if (user && supabase) {
      const channel = supabase
        .channel('codes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'codes', filter: `user_id=eq.${user.id}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newCode = {
                ...payload.new,
                dateAdded: new Date(payload.new.dateAdded),
                expiryDate: payload.new.expiryDate ? new Date(payload.new.expiryDate) : undefined,
              } as DiscountCode;
              setCodes((currentCodes) => [newCode, ...currentCodes.filter(c => c.id !== newCode.id)])
            } else if (payload.eventType === 'UPDATE') {
              const updatedCode = {
                ...payload.new,
                dateAdded: new Date(payload.new.dateAdded),
                expiryDate: payload.new.expiryDate ? new Date(payload.new.expiryDate) : undefined,
              } as DiscountCode;
              setCodes((currentCodes) =>
                currentCodes.map((code) => (code.id === updatedCode.id ? updatedCode : code))
              )
            } else if (payload.eventType === 'DELETE') {
              setCodes((currentCodes) => currentCodes.filter((code) => code.id !== payload.old.id))
            }
          }
        )
        .subscribe()

      return () => {
        if (supabase) {
          supabase.removeChannel(channel)
        }
      }
    }
  }, [user, authLoading, isClient]) // Removed supabase as it's a module-level constant that doesn't change

  // Add new discount code
  const addCode = useCallback(async (formData: DiscountCodeFormData) => {
    if (!isClient) return null

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
      usageHistory: [],
    }

    const originalCodes = codes
    const updatedCodes = [newCode, ...codes]
    setCodes(updatedCodes) // Optimistic update

    if (user && supabase) {
      // Prepare data for Supabase - convert dates to ISO strings and handle complex objects
      const supabaseData = {
        id: newCode.id,
        code: newCode.code,
        store: newCode.store,
        discount: newCode.discount,
        originalPrice: newCode.originalPrice || null,
        expiryDate: newCode.expiryDate ? newCode.expiryDate.toISOString() : null,
        category: newCode.category,
        description: newCode.description || null,
        isFavorite: newCode.isFavorite,
        isArchived: newCode.isArchived,
        dateAdded: newCode.dateAdded.toISOString(),
        timesUsed: newCode.timesUsed,
        qrCode: newCode.qrCode || null,
        usageHistory: newCode.usageHistory || null,
        user_id: user.id
      };
      
      // Type assertion to handle the insert operation - suppressing the type issue for build
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insertResult = await (supabase as any)
        .from('codes')
        .insert([supabaseData]);
      
      if (insertResult.error) {
        console.error('Error adding code to Supabase:', insertResult.error)
        setCodes(originalCodes) // Revert on failure
        return null
      }
    } else if (user && !supabase) {
      console.error('Supabase client not available. Cannot add code to database.');
      setCodes(originalCodes); // Revert on failure
      return null;
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCodes))
      } catch (e) {
        console.error('Error saving to localStorage:', e)
        setCodes(originalCodes) // Revert on failure
        return null
      }
    }
    return newCode
  }, [codes, user, isClient]) // Removed supabase as it's a module-level constant that doesn't change

  // Update existing discount code
  const updateCode = useCallback(async (id: string, updates: Partial<DiscountCode>) => {
    if (!isClient) return

    const originalCodes = [...codes]
    const updatedCodes = codes.map(code =>
      code.id === id ? { ...code, ...updates } : code
    )
    setCodes(updatedCodes) // Optimistic update

    if (user && supabase) {
      // Prepare data for Supabase - convert dates to ISO strings if present and handle nulls
      const supabaseUpdates: Record<string, unknown> = {};
      
      // Copy values, handling dates and nulls appropriately
      if ('dateAdded' in updates) {
        if (updates.dateAdded instanceof Date) {
          supabaseUpdates.dateAdded = updates.dateAdded.toISOString();
        } else if (typeof updates.dateAdded === 'string') {
          supabaseUpdates.dateAdded = updates.dateAdded;
        } else {
          supabaseUpdates.dateAdded = updates.dateAdded;
        }
      }
      
      if ('expiryDate' in updates) {
        if (updates.expiryDate instanceof Date) {
          supabaseUpdates.expiryDate = updates.expiryDate.toISOString();
        } else if (updates.expiryDate === null) {
          supabaseUpdates.expiryDate = null;
        } else if (typeof updates.expiryDate === 'string') {
          supabaseUpdates.expiryDate = updates.expiryDate;
        } else {
          supabaseUpdates.expiryDate = updates.expiryDate;
        }
      }
      
      if ('originalPrice' in updates) {
        supabaseUpdates.originalPrice = updates.originalPrice === undefined ? null : updates.originalPrice;
      }
      
      if ('description' in updates) {
        supabaseUpdates.description = updates.description === undefined ? null : updates.description;
      }
      
      if ('qrCode' in updates) {
        supabaseUpdates.qrCode = updates.qrCode === undefined ? null : updates.qrCode;
      }
      
      if ('usageHistory' in updates) {
        supabaseUpdates.usageHistory = updates.usageHistory;
      }
      
      // Copy other properties directly
      if ('code' in updates) supabaseUpdates.code = updates.code;
      if ('store' in updates) supabaseUpdates.store = updates.store;
      if ('discount' in updates) supabaseUpdates.discount = updates.discount;
      if ('category' in updates) supabaseUpdates.category = updates.category;
      if ('isFavorite' in updates) supabaseUpdates.isFavorite = updates.isFavorite;
      if ('isArchived' in updates) supabaseUpdates.isArchived = updates.isArchived;
      if ('timesUsed' in updates) supabaseUpdates.timesUsed = updates.timesUsed;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('codes').update(supabaseUpdates).eq('id', id)
      if (error) {
        console.error('Error updating code in Supabase:', error)
        setCodes(originalCodes) // Revert on failure
      }
    } else if (user && !supabase) {
      console.error('Supabase client not available. Cannot update code in database.');
      setCodes(originalCodes); // Revert on failure
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCodes))
      } catch (e) {
        console.error('Error saving to localStorage:', e)
        setCodes(originalCodes) // Revert on failure
      }
    }
  }, [codes, user, isClient]) // Removed supabase as it's a module-level constant that doesn't change

  // Delete discount code
  const deleteCode = useCallback(async (id: string) => {
    if (!isClient) return

    const originalCodes = [...codes]
    const updatedCodes = codes.filter(code => code.id !== id)
    setCodes(updatedCodes) // Optimistic update

    if (user && supabase) {
      const { error } = await supabase.from('codes').delete().eq('id', id)
      if (error) {
        console.error('Error deleting code from Supabase:', error)
        setCodes(originalCodes) // Revert on failure
      }
    } else if (user && !supabase) {
      console.error('Supabase client not available. Cannot delete code from database.');
      setCodes(originalCodes); // Revert on failure
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCodes))
      } catch (e) {
        console.error('Error saving to localStorage:', e)
        setCodes(originalCodes) // Revert on failure
      }
    }
  }, [codes, user, isClient]) // Removed supabase as it's a module-level constant that doesn't change

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
        usageHistory: [...usageHistory, newUsageEntry]
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

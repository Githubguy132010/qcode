import { renderHook, act } from '@testing-library/react'
import { useStorePreferences, SUPPORTED_STORES } from '@/hooks/useStorePreferences'

describe('useStorePreferences', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with an empty array', () => {
    const { result } = renderHook(() => useStorePreferences())
    expect(result.current.selectedStores).toEqual([])
  })

  it('should load preferences from localStorage', () => {
    localStorage.setItem('qcode-store-preferences', JSON.stringify(['Amazon']))
    const { result } = renderHook(() => useStorePreferences())
    expect(result.current.selectedStores).toEqual(['Amazon'])
  })

  it('should toggle a store selection', () => {
    const { result } = renderHook(() => useStorePreferences())

    act(() => {
      result.current.toggleStore('Amazon')
    })

    expect(result.current.selectedStores).toEqual(['Amazon'])
    expect(localStorage.getItem('qcode-store-preferences')).toBe(JSON.stringify(['Amazon']))

    act(() => {
      result.current.toggleStore('Coolblue')
    })

    expect(result.current.selectedStores).toEqual(['Amazon', 'Coolblue'])
    expect(localStorage.getItem('qcode-store-preferences')).toBe(JSON.stringify(['Amazon', 'Coolblue']))

    act(() => {
      result.current.toggleStore('Amazon')
    })

    expect(result.current.selectedStores).toEqual(['Coolblue'])
    expect(localStorage.getItem('qcode-store-preferences')).toBe(JSON.stringify(['Coolblue']))
  })

  it('should return the list of supported stores', () => {
    const { result } = renderHook(() => useStorePreferences())
    expect(result.current.supportedStores).toEqual(SUPPORTED_STORES)
  })
})

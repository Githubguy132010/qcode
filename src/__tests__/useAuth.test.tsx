import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'

jest.mock('@/lib/supabaseClient')

describe('useAuth', () => {
  beforeEach(() => {
    // Reset mocks and provide a default implementation for getSession
    jest.clearAllMocks();
    if (supabase) {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
      });
    }
  });

  it('should handle sign in with GitHub', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    await act(async () => {
      await result.current.signInWithGitHub()
    })

    if (supabase) {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: {
          redirectTo: window.location.origin,
        },
      })
    }
  })

  it('should handle sign out', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    await act(async () => {
      await result.current.signOut()
    })

    if (supabase) {
      expect(supabase.auth.signOut).toHaveBeenCalled()
    }
  })

  it('should provide the session and user', async () => {
    const mockSession = {
      user: { id: '123', email: 'test@example.com' },
      access_token: 'abc',
      refresh_token: 'def',
    }
    // Manually mock getSession for this specific test
    if (supabase) {
      ;(supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: mockSession },
      })
    }

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.session).not.toBeNull();
    })

    expect(result.current.session).toBeDefined()
    expect(result.current.user).toBeDefined()
    expect(result.current.user?.id).toBe('123')
  })
})
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDiscountCodes } from '@/hooks/useDiscountCodes';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

// Mock the entire context module to avoid conflicts with provider wrapping
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the supabase client
jest.mock('@/lib/supabaseClient');

const mockUseAuth = useAuth as jest.Mock;

describe('useDiscountCodes', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset all mocks before each test to ensure isolation
    jest.clearAllMocks();
  });

  // --- Tests for unauthenticated users ---
  describe('when user is not authenticated', () => {
    beforeEach(() => {
      // For this block of tests, the user is always logged out.
      mockUseAuth.mockReturnValue({ user: null, loading: false, isClient: true });
    });

    it('should load codes from localStorage', async () => {
      const initialCodes = [{ id: '1', code: 'TEST', store: 'Test Store', dateAdded: new Date().toISOString() }];
      localStorage.setItem('qcode-discount-codes', JSON.stringify(initialCodes));

      const { result } = renderHook(() => useDiscountCodes());

      // Wait for the hook to finish its initial data loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.codes).toHaveLength(1);
      expect(result.current.codes[0].code).toBe('TEST');
    });

    it('should add a code to localStorage', async () => {
      const { result } = renderHook(() => useDiscountCodes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addCode({ code: 'NEW', store: 'New Store', category: 'other', discount: '10%' });
      });

      expect(result.current.codes).toHaveLength(1);
      expect(result.current.codes[0].code).toBe('NEW');
      expect(JSON.parse(localStorage.getItem('qcode-discount-codes')!)).toHaveLength(1);
    });
  });

  // --- Tests for authenticated users ---
  describe('when user is authenticated', () => {
    const mockUser = { id: '123', email: 'test@example.com' };

    beforeEach(() => {
      // For this block, the user is always logged in.
      mockUseAuth.mockReturnValue({ user: mockUser, loading: false, isClient: true });

      // Set up a comprehensive mock for all supabase calls used in the hook
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ error: null }),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });
      // Mock the real-time channel functionality
      (supabase.channel as jest.Mock).mockReturnValue({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
      });
    });

    it('should fetch codes from Supabase on initial load', async () => {
      const mockData = [{ id: '1', code: 'SUPABASE', store: 'Supabase Store', user_id: mockUser.id, dateAdded: new Date().toISOString() }];
      // Override the default 'order' mock for this specific test case
      (supabase.from('codes').order as jest.Mock).mockResolvedValueOnce({ data: mockData, error: null });

      const { result } = renderHook(() => useDiscountCodes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(supabase.from).toHaveBeenCalledWith('codes');
      expect(result.current.codes).toHaveLength(1);
      expect(result.current.codes[0].code).toBe('SUPABASE');
    });

    it('should add a code to Supabase', async () => {
      const { result } = renderHook(() => useDiscountCodes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addCode({ code: 'NEW', store: 'New Store', category: 'other', discount: '10%' });
      });

      expect(supabase.from).toHaveBeenCalledWith('codes');
      expect(supabase.from('codes').insert).toHaveBeenCalled();
      // Test optimistic update
      expect(result.current.codes).toHaveLength(1);
      expect(result.current.codes[0].code).toBe('NEW');
    });
  });
});
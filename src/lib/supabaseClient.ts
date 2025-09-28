import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseInstance: SupabaseClient<Record<string, unknown>, string> | null = null;

if (!supabaseUrl) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('NEXT_PUBLIC_SUPABASE_URL is required but not set')
  }
} else if (!supabaseAnonKey) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY is required but not set')
  }
} else {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to create Supabase client:', error)
    }
  }
}

export { supabaseInstance as supabase };

// Export function for cases where you want to get the client with explicit error handling
export function getSupabaseClient() {
  if (!supabaseInstance) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Supabase client is not available - environment variables may not be set correctly');
    }
    return null;
  }
  return supabaseInstance;
}
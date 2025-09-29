'use client'

import { createContext, useState, useEffect, useContext, ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  signInWithGitHub: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let subscription: { unsubscribe?: () => void } | null = null;

    const initializeAuth = async () => {
      if (!supabase) {
        console.warn('Supabase client not available. Authentication will not work.');
        setLoading(false);
        return;
      }

      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Set up auth state change listener
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
      });
      
      subscription = authSubscription;
    };

    initializeAuth();

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [])

  const signInWithGitHub = async () => {
    if (!supabase) {
      console.error('Supabase client not available. Cannot sign in.');
      return Promise.reject(new Error('Supabase client not available'));
    }
    
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  const signInWithGoogle = async () => {
    if (!supabase) {
      console.error('Supabase client not available. Cannot sign in.');
      return Promise.reject(new Error('Supabase client not available'));
    }

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  const signOut = async () => {
    if (!supabase) {
      console.error('Supabase client not available. Cannot sign out.');
      return Promise.reject(new Error('Supabase client not available'));
    }
    
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user,
    loading,
    signInWithGitHub,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
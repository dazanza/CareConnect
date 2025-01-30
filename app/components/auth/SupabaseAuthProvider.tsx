'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/hooks/useSupabase'
import { User } from '@supabase/supabase-js'
import { showToast } from '@/app/lib/toast'

interface SupabaseAuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
})

export function useAuth() {
  return useContext(SupabaseAuthContext)
}

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authChangeInProgress, setAuthChangeInProgress] = useState(false)

  // Handle auth state changes
  const handleAuthStateChange = useCallback(async (event: string, session: any) => {
    console.log('Auth state changed:', event, session?.user?.id)
    
    if (authChangeInProgress) return
    setAuthChangeInProgress(true)
    
    try {
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null)
        await router.push('/dashboard')
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        await router.push('/')
      } else if (event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)
      }
    } finally {
      setAuthChangeInProgress(false)
    }
  }, [router, authChangeInProgress])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError
        
        if (mounted) {
          setUser(session?.user ?? null)
          setIsLoading(false)
        }

        // Set up real-time subscription
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange)

        return () => {
          mounted = false
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          showToast.error('Error initializing authentication')
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [supabase, handleAuthStateChange])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
      // Let the auth state change handler manage the user state and navigation
    } catch (error) {
      console.error('Error signing in:', error)
      showToast.error('Invalid email or password')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      // Let the auth state change handler manage the user state and navigation
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SupabaseAuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </SupabaseAuthContext.Provider>
  )
} 
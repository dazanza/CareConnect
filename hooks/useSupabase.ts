import { useEffect, useState } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function useSupabase() {
  const [supabase] = useState<SupabaseClient>(() => createClient(supabaseUrl, supabaseAnonKey))

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Handle sign in event
      } else if (event === 'SIGNED_OUT') {
        // Handle sign out event
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return { supabase }
}
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { Database } from '@/types/supabase'
import { useAuth } from '@clerk/nextjs'

export function useSupabase() {
  const { getToken } = useAuth()
  const [supabase] = useState(() => createClientComponentClient<Database>())

  useEffect(() => {
    const updateSupabaseAuth = async () => {
      try {
        const token = await getToken({ template: 'supabase' })
        if (!token) return

        // Set auth header directly
        supabase.rest.headers = {
          ...supabase.rest.headers,
          Authorization: `Bearer ${token}`
        }
      } catch (error) {
        console.error('Error in updateSupabaseAuth:', error)
      }
    }

    updateSupabaseAuth()
  }, [getToken, supabase])

  return { supabase }
}
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { Database } from '@/types/supabase'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'

export function useSupabase() {
  const { session } = useAuth()
  const [supabase] = useState(() => createClientComponentClient<Database>())

  return { supabase, session }
}
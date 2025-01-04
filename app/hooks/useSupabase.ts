'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { Database } from '@/types/supabase'

export function useSupabase() {
  const [supabase] = useState(() => createClientComponentClient<Database>())
  return { supabase }
}
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'

export function useSupabase() {
  const supabase = createClientComponentClient()
  return { supabase }
}
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function useSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient<Database>({
      cookieOptions: {
        name: 'sb-session',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      }
    })
  }
  return { supabase: supabaseInstance }
}
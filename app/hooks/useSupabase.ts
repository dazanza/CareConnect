import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState, useRef } from 'react';

let supabaseInstance: SupabaseClient | null = null;

export function useSupabase() {
  const { getToken } = useAuth();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const initializingRef = useRef(false);

  useEffect(() => {
    if (supabaseInstance) {
      setSupabase(supabaseInstance);
      return;
    }

    if (initializingRef.current) return;

    initializingRef.current = true;

    const initSupabase = async () => {
      const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            fetch: async (url, options = {}) => {
              const clerkToken = await getToken({ template: 'supabase' });
              
              const headers = new Headers(options?.headers);
              headers.set('Authorization', `Bearer ${clerkToken}`);
              
              return fetch(url, {
                ...options,
                headers,
              });
            },
          },
        }
      );

      supabaseInstance = supabaseClient;
      setSupabase(supabaseClient);
      initializingRef.current = false;
    };

    initSupabase();
  }, [getToken]);

  return { supabase };
}
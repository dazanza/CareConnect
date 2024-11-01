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
              try {
                const clerkToken = await getToken({ template: 'supabase' });
                if (!clerkToken) throw new Error('No auth token available');

                const headers = new Headers(options?.headers || {});
                headers.set('Authorization', `Bearer ${clerkToken}`);

                return fetch(url, {
                  ...options,
                  headers,
                });
              } catch (error) {
                console.error('Error in Supabase fetch:', error);
                // Try to refresh the token
                const newToken = await getToken({ template: 'supabase', skipCache: true });
                if (!newToken) throw new Error('Failed to refresh token');

                const headers = new Headers(options?.headers || {});
                headers.set('Authorization', `Bearer ${newToken}`);

                return fetch(url, {
                  ...options,
                  headers,
                });
              }
            },
          },
          auth: {
            autoRefreshToken: true,
            persistSession: true,
          },
        }
      );

      console.log('Supabase client initialized');

      // Set up auth state change listener
      supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'TOKEN_REFRESHED') {
          console.log('Supabase token refreshed');
        }
      });

      supabaseInstance = supabaseClient;
      setSupabase(supabaseClient);
      initializingRef.current = false;
    };

    initSupabase();
  }, [getToken]);

  return { supabase };
}
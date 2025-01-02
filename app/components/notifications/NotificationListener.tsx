'use client'

import { useEffect } from 'react'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useSupabase } from '@/app/hooks/useSupabase'
import { toast } from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'

export function NotificationListener() {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!supabase || !user?.id) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as any
          toast(notification.message, {
            icon: notification.type === 'success' ? '✅' : '⚠️',
          })
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user?.id, queryClient])

  return null
}

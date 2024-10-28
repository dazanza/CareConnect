'use client'

import { useEffect } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'
import { Notification } from '@/types/notifications'

export function NotificationListener() {
  const { supabase } = useSupabase()
  const { userId } = useAuth()

  useEffect(() => {
    if (!supabase || !userId) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = payload.new as Notification
          toast(notification.message, {
            icon: getNotificationIcon(notification.type)
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  return null
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'appointment':
      return '📅'
    case 'todo':
      return '✅'
    case 'prescription':
      return '💊'
    case 'share':
      return '🔗'
    case 'family':
      return '👨‍👩‍👧‍👦'
    default:
      return '📢'
  }
}

'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useAuth } from '@clerk/nextjs'
import { Notification, getUnreadNotifications, markNotificationAsRead } from '@/lib/notifications'
import { format } from 'date-fns'

export function NotificationsPopover() {
  const { supabase } = useSupabase()
  const { userId } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (userId && isOpen) {
      fetchNotifications()
    }
  }, [userId, isOpen])

  async function fetchNotifications() {
    if (!supabase || !userId) return
    const data = await getUnreadNotifications(supabase, userId)
    setNotifications(data)
  }

  async function handleMarkAsRead(notificationId: string) {
    if (!supabase) return
    await markNotificationAsRead(supabase, notificationId)
    await fetchNotifications()
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4">
          <h3 className="font-semibold">Notifications</h3>
          <div className="mt-2 space-y-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500">No new notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

import { SupabaseClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'
import { Notification, NotificationCreate } from '@/types/notifications'

export type { Notification } from '@/types/notifications'

export async function createNotification(
  supabase: SupabaseClient,
  notification: NotificationCreate
) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([{
      user_id: notification.userId,
      type: notification.type,
      message: notification.message,
      data: notification.data,
      read: false
    }])
    .select()
    .single()

  if (error) throw error
  return data as Notification
}

export async function markNotificationAsRead(
  supabase: SupabaseClient,
  notificationId: string
) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)

  if (error) throw error
}

export async function getUnreadNotifications(
  supabase: SupabaseClient,
  userId: string
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function deleteNotification(
  supabase: SupabaseClient,
  notificationId: string
) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) throw error
}

export async function clearAllNotifications(
  supabase: SupabaseClient,
  userId: string
) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) throw error
}

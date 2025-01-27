export interface Notification {
  id: string
  user_id: string
  type: 'appointment' | 'todo' | 'prescription' | 'share' | 'family' | 'share_received' | 'share_claimed'
  message: string
  read: boolean
  created_at: string
  data?: Record<string, any>
}

export interface NotificationCreate {
  userId: string
  type: Notification['type']
  message: string
  data?: Record<string, any>
}

export interface ShareNotificationData {
  patientId: number
  shareId: string
  accessLevel: string
  sharedBy?: string
  claimedBy?: string
}

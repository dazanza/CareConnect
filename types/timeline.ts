export interface TimelineEvent {
  id: number
  patientId: number
  type: 'appointment' | 'medication' | 'procedure' | 'diagnosis' | 'note'
  title: string
  description?: string
  date: string
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
  createdBy: {
    id: number
    name: string
    role: string
  }
} 
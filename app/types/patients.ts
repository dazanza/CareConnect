export interface Patient {
  id: number
  name: string
  date_of_birth: string
  gender?: string
  contact_number?: string
  address?: string
  medical_history?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface PatientShare {
  id: string
  patient_id: number
  shared_with_user_id: string
  access_level: 'read' | 'write' | 'admin'
  shared_by_user_id: string
  created_at: string
  expires_at?: string
  shared_with?: {
    email: string
    first_name?: string
    last_name?: string
  }
}

export interface PendingShare {
  id: string
  patient_id: number
  email: string
  access_level: string
  shared_by_user_id: string
  created_at: string
  expires_at?: string
  claimed_at?: string
  claimed_by_user_id?: string
} 
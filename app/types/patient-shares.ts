export interface PatientShare {
  id: string
  patient_id: number
  shared_by_user_id: string
  shared_with_user_id: string
  access_level: 'read' | 'write' | 'admin'
  created_at: string
  expires_at?: string
  shared_by: {
    email: string
  }
  shared_with: {
    email: string
  }
}

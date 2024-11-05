export interface Todo {
  id: number
  text: string
  completed: boolean
  created_at: string
  user_id: string
  patient_id?: number | null
  appointment_id?: number | null
  due_date?: string | null
  patients?: {
    id: number
    name: string
  }
  patientName?: string
}

export interface PatientOption {
  id: number
  name: string
} 
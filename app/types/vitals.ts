export interface Vitals {
  id: number
  patient_id: number
  date_time: string
  blood_pressure: string
  heart_rate: number
  temperature: number
  respiratory_rate: number
  oxygen_saturation: number
  notes?: string
  user_id: string
  created_at: string
  updated_at: string
} 
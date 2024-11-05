export type MedicationForm = 'tablet' | 'capsule' | 'liquid' | 'injection' | 'topical' | 'inhaler' | 'patch'

export interface Medication {
  id: number
  name: string
  generic_name?: string
  strength: string
  form: MedicationForm
  manufacturer?: string
  description?: string
  warnings?: string
  side_effects?: string
  interactions?: string
  created_at: string
  updated_at: string
  user_id: string
  patient_id?: number
  prescription_id?: number
} 
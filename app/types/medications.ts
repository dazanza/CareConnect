// Types for medication management that match database schema
export type MedicationStatus = 'active' | 'discontinued' | 'completed'

export interface Doctor {
  id: number
  first_name: string
  last_name: string
  specialization: string
  contact_number?: string
  email?: string
  address?: string
}

export interface Medication {
  id: number
  name: string
  dosage: string
  frequency: string
  start_date: Date
  end_date: Date | null
  instructions: string | null
  status: MedicationStatus
  reason_for_discontinuation: string | null
  side_effects: string | null
  adherence_rate: number | null
  doctor_id: number | null
  patient_id: number | null
  user_id: string
  created_at: Date
  prescription_id: number | null
  doctor?: Doctor
}

export interface MedicationFormData {
  name: string
  dosage: string
  frequency: string
  start_date: string
  end_date?: string | null
  instructions?: string
  doctor_id?: number
  side_effects?: string
}

// Props interface for the MedicationManager component
export interface MedicationManagerProps {
  patientId: number
  doctors: Doctor[]
  initialMedications?: Medication[]
  canEdit?: boolean
} 
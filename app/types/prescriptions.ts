export interface Prescription {
  id: number
  patient_id: number
  medication_id: number
  dosage: string
  frequency: string
  duration?: string
  refills: number
  status: 'active' | 'completed' | 'discontinued'
  prescribed_by: number
  start_date: string
  end_date?: string
  notes?: string
  created_at: string
  doctor?: {
    id: number
    first_name: string
    last_name: string
  }
  medication_details?: Medication
} 
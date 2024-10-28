export interface MedicalHistoryEntry {
  id: string
  patient_id: number // Changed from string to number to match DB schema
  date: string // Changed from Date to string to match DB format
  description: string
  type: 'visit' | 'procedure' | 'diagnosis'
  doctor_id: number // Changed from string to number to match DB schema
  created_at: string
  updated_at: string
}

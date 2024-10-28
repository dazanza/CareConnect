export interface TimelineEvent {
  id: string
  patient_id: number
  user_id: string
  type: 'appointment' | 'prescription' | 'vitals' | 'lab_result' | 'note'
  date: string
  title: string
  description: string | null
  metadata: Record<string, any> | null
  created_by: string
  created_at: string
  appointment_id?: number
  prescription_id?: number
  vitals_id?: number
  lab_result_id?: number
  appointments?: {
    id: number
    type: string
    location: string
    doctor_id: number
  } | null
  prescriptions?: {
    id: number
    medication: string
    dosage: string
    frequency: string
  } | null
  vitals?: {
    id: number
    blood_pressure: string
    heart_rate: number
    temperature: number
    oxygen_saturation: number
  } | null
  lab_results?: {
    id: number
    test_name: string
    result_value: string
    unit: string
    status: 'normal' | 'abnormal' | 'critical'
  } | null
}

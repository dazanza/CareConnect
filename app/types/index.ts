export * from './todos'
export * from './patients'
export * from './medications'
export * from './prescriptions'
export * from './shares'

// Prescriptions
export interface PrescriptionFormProps {
  isOpen: boolean
  onClose: () => void
  patientId: number
  medications: Medication[]
  doctors: Doctor[]
  onSuccess?: () => void
}

export interface PrescriptionFormData {
  medication_id: number
  dosage: string
  frequency: string
  duration?: string
  refills: number
  prescribed_by: number
  start_date: string
  end_date?: string
  notes?: string
}

export interface PrescriptionListProps {
  patientId: number
  medications: Medication[]
  doctors: Doctor[]
  initialPrescriptions?: Prescription[]
}

// Timeline Events
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
}

// Doctors
export interface Doctor {
  id: number
  first_name: string
  last_name: string
  specialization: string
  contact_number?: string
  email?: string
  address?: string
  user_id: string
  assistant?: string
  created_at: string
}

// Vitals
export interface Vitals {
  id: string
  patient_id: string
  blood_pressure: string
  heart_rate: number
  temperature: number
  oxygen_level: number
  date: string
  created_at: string
  updated_at: string
}

export interface VitalsInput {
  patient_id: string
  blood_pressure: string
  heart_rate: number
  temperature: number
  oxygen_level: number
}

// Lab Results
export interface LabResult {
  id: string
  test_name: string
  test_type: string
  result_value: string
  reference_range: string
  unit: string
  date: string
  notes: string
  status: 'normal' | 'abnormal' | 'critical'
  doctor_id: string
  patient_id: string
  doctor: {
    id: string
    name: string
  }
}

// Documents
export interface MedicalDocument {
  id: string
  patient_id: string
  name: string
  type: string
  size: number
  url: string
  category: 'lab_result' | 'prescription' | 'imaging' | 'other'
  uploaded_at: string
  updated_at: string
}

export interface DocumentInput {
  patient_id: string
  name: string
  type: string
  size: number
  url: string
  category: MedicalDocument['category']
}

// Appointments
export interface Appointment {
  id: number
  patient_id: number
  doctor_id: number
  date: string
  type: string
  location: string
  notes?: string
  status: 'scheduled' | 'cancelled' | 'completed'
  patients?: {
    id: number
    name: string
  }
  doctors?: {
    id: number
    first_name: string
    last_name: string
  }
}
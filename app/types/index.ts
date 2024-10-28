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

export interface Document {
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
  category: Document['category']
}

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

export interface MedicalEvent {
  id: string
  date: string
  type: 'appointment' | 'prescription' | 'diagnosis' | 'test'
  title: string
  description: string
  doctor: {
    id: string
    name: string
  }
}

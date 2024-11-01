export interface DatabaseDoctor {
  id: string
  first_name: string
  last_name: string
  specialization: string
  contact_number: string
  email: string
}

export interface PatientDoctorResponse {
  id: string
  doctor_id: DatabaseDoctor
}

export interface MedicalDocument {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploaded_at: string
  category: 'lab_result' | 'prescription' | 'imaging' | 'other'
}

export interface DatabaseLabResult {
  id: string
  test_name: string
  test_type: string
  result_value: string
  reference_range: string
  unit: string
  date: string
  notes: string
  status: 'normal' | 'abnormal' | 'critical'
  doctor_id: {
    id: string
    first_name: string
    last_name: string
  }
} 

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

export interface PatientDoctorResponse {
  id: string
  doctor_id: {
    id: string
    first_name: string
    last_name: string
    specialization: string
    contact_number: string
    email: string
  }
}

// Base interfaces
export interface Doctor {
  id: string
  name: string
}

export interface PatientDoctor {
  id: string
  name: string
  specialty: string
  phone: string
  email: string
  primary: boolean
}

export interface PatientDoctorResponse {
  id: string
  doctor_id: {
    id: string
    first_name: string
    last_name: string
    specialization: string
    contact_number: string
    email: string
  }
}

// Medical Records
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

// Clinical Data
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

export interface Allergy {
  id: string
  patient_id: string
  allergen: string
  reaction: string
  severity: 'mild' | 'moderate' | 'severe'
  notes: string
  date_identified: string
  status: 'active' | 'inactive'
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  start_date: string
  end_date: string | null
  instructions: string
  status: 'active' | 'discontinued' | 'completed'
  reason_for_discontinuation?: string
  side_effects?: string
  adherence_rate?: number
  doctor_id: string
  patient_id: string
  doctor: {
    id: string
    name: string
  }
}

export interface Immunization {
  id: string
  vaccine_name: string
  vaccine_type: string
  dose_number: number
  date_administered: string
  next_due_date: string | null
  administered_by: string
  batch_number: string
  manufacturer: string
  location: string
  notes: string
  status: 'completed' | 'scheduled' | 'overdue'
  side_effects?: string
  patient_id: string
  doctor_id: string
  doctor: {
    id: string
    name: string
  }
}

// Appointments and Tasks
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

// Vitals and Measurements
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

// Billing and Administrative
export interface Bill {
  id: string
  date: string
  amount: number
  description: string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  insurance_claim_id?: string
  payment_method?: string
  payment_date?: string
  patient_id: string
  service_id: string
  service: {
    name: string
    code: string
  }
}

// Timeline and Events
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

// Input Types
export interface DocumentInput {
  patient_id: string
  name: string
  type: string
  size: number
  url: string
  category: MedicalDocument['category']
}

// Add missing Prescription interface
export interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: number
  start_date: string
  end_date: string
  next_dose: string
  instructions: string
  doctor_id: string
  patient_id: string
  status: 'active' | 'completed' | 'cancelled'
  doctor: {
    id: string
    name: string
  }
}

// Add Patient interface
export interface Patient {
  id: string
  name: string
  date_of_birth: string
  gender?: string
  contact_number?: string
  address?: string
  medical_history?: string
  user_id: string
}


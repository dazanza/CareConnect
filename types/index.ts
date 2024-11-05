export interface Patient {
  id: number;
  name: string;
  date_of_birth: string;
  gender: string;
  contact_number: string;
  address: string;
  medical_history: string;
  user_id: string;
}

export interface Doctor {
  id: number;
  created_at: string;
  last_name: string;
  first_name: string;
  specialization: string;
  contact_number: string;
  email?: string;
  address: string;
  user_id: string; // Ensure this is string, not UUID
  assistant?: string;
}

export interface Appointment {
  id: number;
  date: string;
  type: string;
  location: string;
  patient_id: number;
  doctor_id: number;
  status: 'scheduled' | 'cancelled' | 'completed';
  patients?: {
    id: number;
    name: string;
  };
  doctors?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}


export interface Vital {
  id: number;
  patient_id: number;
  date_time: string;
  blood_pressure: string;
  heart_rate: number;
  temperature: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  notes: string;
  user_id: string;
}

export interface PatientDetails extends Patient {
  // Add any additional fields specific to the patient details view
}

export interface PatientDoctor {
  id: number;
  patient_id: number;
  doctor_id: number;
  user_id: string;
  created_at: string;
}

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  appointment_id: number | null;
  patient_id: number | null;
  event_id: number | null;
  log_id: number | null;
  user_id: string;
  doctor?: string;
  event?: string;
  patients?: {
    id: number;
    name: string;
  };
  patientName?: string;
}

export interface Prescription {
  id: number
  patient_id: number
  medication_id: number
  medication: string // Keep for backward compatibility
  dosage: string
  frequency: string
  duration?: string
  refills: number
  status: 'active' | 'completed' | 'discontinued'
  prescribed_by: number
  start_date: string
  end_date?: string
  next_dose?: string // Keep for backward compatibility
  notes?: string
  created_at: string
  doctor?: {
    id: number
    first_name: string
    last_name: string
  }
  medication_details?: Medication
}

// Add new Medication interface
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
}

// Add type for medication forms
export type MedicationForm = 'tablet' | 'capsule' | 'liquid' | 'injection' | 'topical' | 'inhaler' | 'patch'

// Add form data interfaces
export interface MedicationFormData {
  name: string
  generic_name?: string
  strength: string
  form: MedicationForm
  manufacturer?: string
  description?: string
  warnings?: string
  side_effects?: string
  interactions?: string
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
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

export interface Prescription {
  id: number;
  medication: string;
  next_dose: string;
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
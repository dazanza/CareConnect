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
  name: string;
  image_url?: string;
  specialty: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  date: string;
  type: string;
  location: string;
  notes: string;
  user_id: string;
}

export interface Prescription {
  id: number;
  patient_id: number;
  medication: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string;
  next_dose: string;
  notes: string;
  user_id: string;
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
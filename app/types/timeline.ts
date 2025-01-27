/**
 * Timeline Event Interface
 * 
 * Represents a medical event in the patient's timeline.
 * Events can be of different types (appointment, prescription, etc.)
 * and contain type-specific metadata.
 */
export interface TimelineEvent {
  /** Unique identifier for the event */
  id: string
  
  /** ID of the patient this event belongs to */
  patient_id: number
  
  /** Type of medical event */
  type: 'appointment' | 'prescription' | 'vitals' | 'lab_result' | 'note'
  
  /** Date when the event occurred */
  date: string
  
  /** Short description or title of the event */
  title: string
  
  /** Optional detailed description */
  description: string | null
  
  /** Additional event-specific data stored as key-value pairs */
  metadata: Record<string, any> | null
  
  /** Timestamp when the event was created */
  created_at: string
  
  /** Patient information - available when events are fetched with joins */
  patients?: {
    id: number
    first_name: string
    last_name: string
  }
  
  /** Appointment-specific data */
  appointments?: {
    id: number
    type: string
    location: string
    doctor_id: number
  }
  
  /** Prescription-specific data */
  prescriptions?: {
    id: number
    medication: string
    dosage: string
    frequency: string
  }
  
  /** Vital signs data */
  vitals?: {
    id: number
    blood_pressure: string
    heart_rate: number
    temperature: number
    oxygen_saturation: number
  }
  
  /** Lab result data */
  lab_results?: {
    id: number
    test_name: string
    result_value: string
    unit: string
    /** Status indicating if the result is within normal range */
    status: 'normal' | 'abnormal' | 'critical'
  }
}

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: number
          name: string
          date_of_birth: string | null
          gender: string | null
          contact_number: string | null
          address: string | null
          medical_history: string | null
          user_id: string | null
        }
        Insert: {
          name: string
          date_of_birth?: string
          gender?: string
          contact_number?: string
          address?: string
          medical_history?: string
          user_id?: string
        }
        Update: {
          name?: string
          date_of_birth?: string
          gender?: string
          contact_number?: string
          address?: string
          medical_history?: string
          user_id?: string
        }
      }
      doctors: {
        Row: {
          id: number
          created_at: string
          last_name: string
          first_name: string
          specialization: string
          contact_number: string | null
          email: string | null
          address: string | null
          user_id: string | null
          assistant: string | null
        }
      }
      appointments: {
        Row: {
          id: number
          patient_id: number
          doctor_id: number
          date: string
          type: string | null
          location: string | null
          notes: string | null
          user_id: string | null
        }
      }
      prescriptions: {
        Row: {
          id: number
          patient_id: number | null
          medication: string
          dosage: string | null
          frequency: string | null
          start_date: string | null
          end_date: string | null
          next_dose: string | null
          notes: string | null
          user_id: string | null
        }
      }
      todos: {
        Row: {
          id: number
          text: string
          completed: boolean | null
          created_at: string | null
          updated_at: string | null
          due_date: string | null
          appointment_id: number | null
          patient_id: number | null
          event_id: number | null
          log_id: number | null
          user_id: string | null
        }
      }
      vitals: {
        Row: {
          id: number
          patient_id: number | null
          date_time: string
          blood_pressure: string | null
          heart_rate: number | null
          temperature: number | null
          mood: string | null
          oxygen_saturation: number | null
          notes: string | null
          user_id: string | null
          blood_sugar: number | null
        }
      }
    }
  }
} 
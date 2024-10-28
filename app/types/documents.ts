export interface Document {
  id: string
  patient_id: number
  user_id: string
  name: string
  type: string
  size: number
  url: string
  category: 'lab_result' | 'prescription' | 'imaging' | 'other'
  uploaded_at: string
  updated_at: string
}

export interface DocumentUpload {
  file: File
  category: Document['category']
  patientId: number
}

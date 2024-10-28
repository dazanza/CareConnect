import { SupabaseClient } from '@supabase/supabase-js'

export interface Document {
  id: string
  name: string
  type: string
  size: number
  url: string
  category: 'lab_result' | 'prescription' | 'imaging' | 'other'
  uploaded_at: string
  updated_at: string
}

export async function uploadDocument(
  supabase: SupabaseClient,
  file: File,
  patientId: string,
  category: string
): Promise<Document> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${patientId}/${fileName}`

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  // Create document record
  const { data, error: insertError } = await supabase
    .from('documents')
    .insert([{
      patient_id: patientId,
      name: file.name,
      type: file.type,
      size: file.size,
      url: filePath,
      category
    }])
    .select()
    .single()

  if (insertError) throw insertError
  return data
}

export async function deleteDocument(
  supabase: SupabaseClient,
  document: Document
) {
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([document.url])

  if (storageError) throw storageError

  // Delete record from database
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', document.id)

  if (dbError) throw dbError
}

export async function getDocuments(
  supabase: SupabaseClient,
  patientId: string
): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('patient_id', patientId)
    .order('uploaded_at', { ascending: false })

  if (error) throw error
  return data
}

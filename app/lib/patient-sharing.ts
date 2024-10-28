import { SupabaseClient } from '@supabase/supabase-js'
import { createNotification } from './notifications'

export type AccessLevel = 'read' | 'write' | 'admin'

interface SharePatientParams {
  patientId: number
  sharedByUserId: string
  sharedWithUserId: string
  accessLevel: AccessLevel
  expiresAt?: Date
}

export async function sharePatient(
  supabase: SupabaseClient,
  params: SharePatientParams
) {
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('name')
    .eq('id', params.patientId)
    .single()

  if (patientError) throw patientError

  const { data: share, error: shareError } = await supabase
    .from('patient_shares')
    .insert({
      patient_id: params.patientId,
      shared_by_user_id: params.sharedByUserId,
      shared_with_user_id: params.sharedWithUserId,
      access_level: params.accessLevel,
      expires_at: params.expiresAt?.toISOString()
    })
    .select()
    .single()

  if (shareError) throw shareError

  // Create notification for the user receiving the share
  await createNotification(supabase, {
    userId: params.sharedWithUserId,
    type: 'todo',
    message: `You have been given ${params.accessLevel} access to patient ${patient.name}`,
    data: {
      patientId: params.patientId,
      shareId: share.id,
      accessLevel: params.accessLevel
    }
  })

  return share
}

export async function removePatientShare(
  supabase: SupabaseClient,
  shareId: string
) {
  const { error } = await supabase
    .from('patient_shares')
    .delete()
    .eq('id', shareId)

  if (error) throw error
}

export async function getPatientShares(
  supabase: SupabaseClient,
  patientId: number
) {
  const { data, error } = await supabase
    .from('patient_shares')
    .select(`
      *,
      shared_by:shared_by_user_id(email),
      shared_with:shared_with_user_id(email)
    `)
    .eq('patient_id', patientId)

  if (error) throw error
  return data
}

export async function getSharedPatients(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from('patient_shares')
    .select(`
      *,
      patient:patient_id(*),
      shared_by:shared_by_user_id(email)
    `)
    .eq('shared_with_user_id', userId)

  if (error) throw error
  return data
}

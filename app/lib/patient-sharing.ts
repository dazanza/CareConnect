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
      id,
      patient_id,
      shared_by_user_id,
      shared_with_user_id,
      access_level,
      expires_at,
      created_at
    `)
    .eq('patient_id', patientId)

  if (error) throw error

  // Get the user emails in a separate query
  if (data && data.length > 0) {
    const sharedByIds = data.map(share => share.shared_by_user_id)
    const sharedWithIds = data.map(share => share.shared_with_user_id)
    const uniqueUserIds = Array.from(new Set([...sharedByIds, ...sharedWithIds]))

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .in('id', uniqueUserIds)

    if (userError) throw userError

    // Map user data to shares
    return data.map(share => ({
      ...share,
      shared_by: userData.find(u => u.id === share.shared_by_user_id),
      shared_with: userData.find(u => u.id === share.shared_with_user_id)
    }))
  }

  return data
}

export async function getSharedPatients(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from('patient_shares')
    .select(`
      id,
      patient_id,
      shared_by_user_id,
      shared_with_user_id,
      access_level,
      expires_at,
      created_at,
      patient:patients(*)
    `)
    .eq('shared_with_user_id', userId)

  if (error) throw error

  // Get the shared by user emails in a separate query
  if (data && data.length > 0) {
    const sharedByIds = data.map(share => share.shared_by_user_id)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .in('id', sharedByIds)

    if (userError) throw userError

    // Map user data to shares
    return data.map(share => ({
      ...share,
      shared_by: userData.find(u => u.id === share.shared_by_user_id)
    }))
  }

  return data
}

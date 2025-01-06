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

interface PatientShare {
  id: string
  patient_id: string
  shared_by_user_id: string
  shared_with_user_id: string
  access_level: string
  expires_at: string | null
  created_at: string
  shared_with: {
    email: string
    first_name?: string
    last_name?: string
  }
}

export async function sharePatient(
  supabase: SupabaseClient,
  params: SharePatientParams
): Promise<any> {
  try {
    if (!supabase) {
      throw new Error('Supabase client is not initialized')
    }

    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('first_name, last_name')
      .eq('id', params.patientId)
      .single()

    if (patientError) {
      throw new Error(`Failed to find patient: ${patientError.message}`)
    }

    if (!patient) {
      throw new Error('Patient not found')
    }

    // Check if share already exists
    const { data: existingShare, error: existingShareError } = await supabase
      .from('patient_shares')
      .select('id')
      .eq('patient_id', params.patientId)
      .eq('shared_with_user_id', params.sharedWithUserId)
      .single()

    if (existingShareError && existingShareError.code !== 'PGRST116') {
      throw new Error(`Failed to check existing share: ${existingShareError.message}`)
    }

    if (existingShare) {
      throw new Error('Patient is already shared with this user')
    }

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

    if (shareError) {
      throw new Error(`Failed to share patient: ${shareError.message}`)
    }

    if (!share) {
      throw new Error('Failed to create share record')
    }

    try {
      await createNotification(supabase, {
        userId: params.sharedWithUserId,
        type: 'todo',
        message: `You have been given ${params.accessLevel} access to patient ${patient.first_name} ${patient.last_name}`,
        data: {
          patientId: params.patientId,
          shareId: share.id,
          accessLevel: params.accessLevel
        }
      })
    } catch (error) {
      console.error('Failed to create notification:', error)
      // Don't throw here as the share was successful
    }

    return share
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('An unexpected error occurred while sharing the patient')
    }
  }
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
): Promise<PatientShare[]> {
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
    const sharedWithIds = data.map(share => share.shared_with_user_id)
    const uniqueUserIds = Array.from(new Set(sharedWithIds))

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .in('id', uniqueUserIds)

    if (userError) throw userError

    // Map user data to shares
    return data.map(share => ({
      ...share,
      shared_with: userData.find(u => u.id === share.shared_with_user_id) || {
        email: 'Unknown',
        first_name: undefined,
        last_name: undefined
      }
    }))
  }

  return []
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

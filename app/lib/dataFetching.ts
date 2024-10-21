import { Appointment } from '@/types'
import { SupabaseClient } from '@supabase/supabase-js'

export async function fetchAppointments(supabase: SupabaseClient, userId: string, options: { patientId?: string; doctorId?: string; limit?: number; upcoming?: boolean; allPatients?: boolean } = {}) {
  console.log('fetchAppointments called for user:', userId, 'with options:', options)
  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients (id, name),
      doctors (id, first_name, last_name)
    `)
    .eq('user_id', userId)
    .order('date', { ascending: true })

  if (options.patientId && !options.allPatients) {
    query = query.eq('patient_id', options.patientId)
  }

  if (options.doctorId) {
    query = query.eq('doctor_id', options.doctorId)
  }

  if (options.upcoming) {
    query = query.gte('date', new Date().toISOString())
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error in fetchAppointments:', error)
    throw error
  }

  console.log('fetchAppointments data:', data)
  return data
}
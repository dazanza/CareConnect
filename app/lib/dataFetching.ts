import { Appointment } from '@/types'
import { SupabaseClient } from '@supabase/supabase-js'

export async function fetchAppointments(supabase: SupabaseClient, options: {
  doctorId?: string;
  patientId?: string;
  limit?: number;
  upcoming?: boolean;
} = {}) {
  if (!supabase) return []

  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients!inner(id, name),
      doctors!inner(id, first_name, last_name)
    `)
    .order('date', { ascending: true })

  if (options.doctorId) {
    query = query.eq('doctor_id', options.doctorId)
  }

  if (options.patientId) {
    query = query.eq('patient_id', options.patientId)
  }

  if (options.upcoming) {
    query = query.gte('date', new Date().toISOString())
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching appointments:', error)
    return []
  }

  return data as Appointment[]
}
import { Appointment } from '@/types'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { unstable_cache } from 'next/cache'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'

export async function fetchAppointments(
  supabase: SupabaseClient,
  userId: string,
  options: {
    limit?: number
    upcoming?: boolean
    allPatients?: boolean
    patientId?: string
    doctorId?: string
  } = {}
) {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients:patient_id (
        id,
        name
      ),
      doctors:doctor_id (
        id,
        first_name,
        last_name
      )
    `)
    .eq('user_id', userId)

  if (options.upcoming) {
    query = query.gte('date', new Date().toISOString())
  }

  if (options.patientId) {
    query = query.eq('patient_id', options.patientId)
  }

  if (options.doctorId) {
    query = query.eq('doctor_id', options.doctorId)
  }

  query = query.order('date', { ascending: true })

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// Implement caching for frequently accessed data
export async function getCachedAppointments(supabase: SupabaseClient, userId: string, options = {}) {
  return unstable_cache(
    async () => fetchAppointments(supabase, userId, options),
    ['appointments', userId, JSON.stringify(options)],
    { revalidate: 60 } // Revalidate every minute
  )()
}

// Create a centralized patient fetching function
export async function fetchPatients(
  supabase: SupabaseClient,
  userId: string,
  options: {
    limit?: number
    searchTerm?: string
  } = {}
) {
  try {
    console.log('Starting fetchPatients...')
    
    let query = supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
    
    if (options.searchTerm) {
      query = query.ilike('name', `%${options.searchTerm}%`)
    }
    
    const { data, error } = await query
      .order('name')
      .limit(options.limit || 10)

    if (error) {
      console.error('Error fetching patients:', error)
      throw error
    }

    console.log('Query successful, got data:', data)
    return data
  } catch (error) {
    console.error('Error in fetchPatients:', error)
    throw error
  }
}

export async function fetchDoctors(
  supabase: SupabaseClient<Database>,
  options: {
    limit?: number
    searchTerm?: string
    userId?: string
  } = {}
) {
  try {
    console.log('Starting fetchDoctors...')
    
    // First, check if we can access the doctors table at all
    const { count, error: countError } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', options.userId)

    if (countError) {
      console.error('Error checking doctors table:', countError)
      throw countError
    }

    console.log('Total doctors in table:', count)

    let query = supabase
      .from('doctors')
      .select('*')
      .eq('user_id', options.userId)
    
    if (options.searchTerm) {
      query = query.or(
        `first_name.ilike.%${options.searchTerm}%,` +
        `last_name.ilike.%${options.searchTerm}%,` +
        `specialization.ilike.%${options.searchTerm}%`
      )
    }
    
    const { data, error } = await query
      .order('last_name')
      .limit(options.limit || 10)

    if (error) {
      console.error('Error fetching doctors:', error)
      throw error
    }

    console.log('Query successful, got data:', data)
    return data
  } catch (error) {
    console.error('Error in fetchDoctors:', error)
    throw error
  }
}

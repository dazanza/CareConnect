import { Appointment } from '@/types'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { unstable_cache } from 'next/cache'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

export async function fetchAppointments(
  supabase: SupabaseClient,
  options: {
    searchTerm?: string
    limit?: number
    userId: string
    upcoming?: boolean
  }
) {
  try {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:patients (
          id,
          name
        ),
        doctor:doctors (
          id,
          first_name,
          last_name
        )
      `)
      .eq('user_id', options.userId)

    if (options.upcoming) {
      query = query.gte('date', new Date().toISOString())
    }

    if (options.searchTerm) {
      query = query
        .ilike('patient.name', `%${options.searchTerm}%`)
        .or(`doctor.first_name.ilike.%${options.searchTerm}%`)
        .or(`doctor.last_name.ilike.%${options.searchTerm}%`)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query.order('date')

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching appointments:', error)
    toast.error('Failed to load appointments')
    throw error
  }
}

// Implement caching for frequently accessed data
export async function getCachedAppointments(
  supabase: SupabaseClient,
  userId: string,
  options: {
    searchTerm?: string
    limit?: number
    upcoming?: boolean
  } = {}
) {
  return unstable_cache(
    async () => fetchAppointments(supabase, { ...options, userId }),
    ['appointments', userId, JSON.stringify(options)],
    { revalidate: 60 } // Revalidate every minute
  )()
}

// Create a centralized patient fetching function
export async function fetchPatients(
  supabase: SupabaseClient,
  options: {
    searchTerm?: string
    limit?: number
    userId: string
  }
) {
  try {
    let query = supabase
      .from('patients')
      .select('*')
      .eq('user_id', options.userId)

    if (options.searchTerm) {
      query = query.ilike('name', `%${options.searchTerm}%`)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query.order('name')

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching patients:', error)
    toast.error('Failed to load patients')
    throw error
  }
}

export async function fetchDoctors(
  supabase: SupabaseClient,
  options: {
    searchTerm?: string
    limit?: number
    userId: string
  }
) {
  try {
    let query = supabase
      .from('doctors')
      .select('*')
      .eq('user_id', options.userId)

    if (options.searchTerm) {
      query = query
        .ilike('first_name', `%${options.searchTerm}%`)
        .or(`last_name.ilike.%${options.searchTerm}%`)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query.order('last_name')

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching doctors:', error)
    toast.error('Failed to load doctors')
    throw error
  }
}

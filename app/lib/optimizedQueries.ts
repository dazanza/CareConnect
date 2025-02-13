import { SupabaseClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'

interface DashboardData {
  stats: {
    patient_count: number
    appointment_count: number
    active_medication_count: number
    active_share_count: number
  }
  upcomingAppointments: Array<{
    id: number
    date: string
    type: string
    notes?: string
    patient: {
      id: number
      first_name: string
      last_name: string
    }
    doctor: {
      id: number
      first_name: string
      last_name: string
    }
  }>
  recentPatients: Array<{
    id: number
    first_name: string
    last_name: string
    date_of_birth: string
  }>
}

interface TimelineEvent {
  event_type: 'medication' | 'appointment'
  event_id: number
  patient_id: number
  title: string
  event_date: string
  status?: string
  description?: string
}

interface PatientAnalytics {
  patient_id: number
  total_medications: number
  active_medications: number
  total_appointments: number
  upcoming_appointments: number
  total_shares: number
  last_appointment?: string
  next_appointment?: string
}

interface MedicationAdherence {
  medication_id: number
  patient_id: number
  name: string
  status: string
  start_date: string
  end_date?: string
  frequency: string
  expected_doses: number
  taken_doses: number
}

interface PatientSearchResult {
  patient_id: number
  first_name: string
  last_name: string
  date_of_birth: string
  medications: string[]
  dosages: string[]
  appointment_types: string[]
  appointment_notes: string[]
}

/**
 * Fetches optimized dashboard data using materialized views and consolidated queries
 * @param supabase - Supabase client instance
 * @param userId - Current user's ID
 * @returns Dashboard data including stats, appointments, and patients
 */
export async function fetchDashboardData(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardData> {
  try {
    // Get user stats from materialized view
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (statsError) throw statsError

    // Get upcoming appointments with patient and doctor info in a single query
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        type,
        notes,
        patient:patients!inner(
          id,
          first_name,
          last_name
        ),
        doctor:doctors!inner(
          id,
          first_name,
          last_name
        )
      `)
      .eq('user_id', userId)
      .gte('date', new Date().toISOString())
      .order('date')
      .limit(5)
      .returns<DashboardData['upcomingAppointments']>()

    if (appointmentsError) throw appointmentsError

    // Get recent patients
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, first_name, last_name, date_of_birth')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (patientsError) throw patientsError

    return {
      stats: {
        patient_count: stats.patient_count || 0,
        appointment_count: stats.appointment_count || 0,
        active_medication_count: stats.active_medication_count || 0,
        active_share_count: stats.active_share_count || 0
      },
      upcomingAppointments: appointments || [],
      recentPatients: patients || []
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    toast.error('Failed to load dashboard data')
    throw error
  }
}

/**
 * Fetches patient data with optimized queries for medications and appointments
 * @param supabase - Supabase client instance
 * @param patientId - Patient ID
 * @returns Patient data with related information
 */
export async function fetchPatientDetails(
  supabase: SupabaseClient,
  patientId: number
) {
  try {
    const [
      { data: patient, error: patientError },
      { data: medications, error: medicationsError },
      { data: appointments, error: appointmentsError }
    ] = await Promise.all([
      // Get patient details
      supabase
        .from('patients')
        .select(`
          *,
          doctors:patient_doctors(doctor:doctors(*))
        `)
        .eq('id', patientId)
        .single(),

      // Get active medications
      supabase
        .from('medications')
        .select(`
          *,
          doctor:doctors(*)
        `)
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .order('created_at', { ascending: false }),

      // Get upcoming appointments
      supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctors(*)
        `)
        .eq('patient_id', patientId)
        .gte('date', new Date().toISOString())
        .order('date')
    ])

    if (patientError) throw patientError
    if (medicationsError) throw medicationsError
    if (appointmentsError) throw appointmentsError

    return {
      patient,
      medications,
      appointments
    }
  } catch (error) {
    console.error('Error fetching patient details:', error)
    toast.error('Failed to load patient details')
    throw error
  }
}

/**
 * Fetches medication data with optimized queries for related information
 * @param supabase - Supabase client instance
 * @param medicationId - Medication ID
 * @returns Medication data with related information
 */
export async function fetchMedicationDetails(
  supabase: SupabaseClient,
  medicationId: number
) {
  try {
    const { data, error } = await supabase
      .from('medications')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*),
        prescription:prescriptions(*)
      `)
      .eq('id', medicationId)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching medication details:', error)
    toast.error('Failed to load medication details')
    throw error
  }
}

/**
 * Fetches patient timeline events using the optimized materialized view
 * @param supabase - Supabase client instance
 * @param patientId - Patient ID
 * @param options - Query options for pagination and filtering
 * @returns Timeline events sorted by date
 */
export async function fetchPatientTimeline(
  supabase: SupabaseClient,
  patientId: number,
  options: {
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  } = {}
): Promise<TimelineEvent[]> {
  try {
    let query = supabase
      .from('patient_timeline')
      .select('*')
      .eq('patient_id', patientId)
      .order('event_date', { ascending: false })

    if (options.startDate) {
      query = query.gte('event_date', options.startDate.toISOString())
    }
    if (options.endDate) {
      query = query.lte('event_date', options.endDate.toISOString())
    }
    if (options.limit) {
      query = query.limit(options.limit)
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching patient timeline:', error)
    toast.error('Failed to load patient timeline')
    throw error
  }
}

/**
 * Fetches patient analytics using the optimized materialized view
 * @param supabase - Supabase client instance
 * @param patientId - Patient ID
 * @returns Patient analytics data
 */
export async function fetchPatientAnalytics(
  supabase: SupabaseClient,
  patientId: number
): Promise<PatientAnalytics> {
  try {
    const { data, error } = await supabase
      .from('patient_analytics')
      .select('*')
      .eq('patient_id', patientId)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching patient analytics:', error)
    toast.error('Failed to load patient analytics')
    throw error
  }
}

/**
 * Fetches medication adherence data using the optimized materialized view
 * @param supabase - Supabase client instance
 * @param patientId - Patient ID
 * @returns Medication adherence data
 */
export async function fetchMedicationAdherence(
  supabase: SupabaseClient,
  patientId: number
): Promise<MedicationAdherence[]> {
  try {
    const { data, error } = await supabase
      .from('medication_adherence')
      .select('*')
      .eq('patient_id', patientId)
      .order('start_date', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching medication adherence:', error)
    toast.error('Failed to load medication adherence data')
    throw error
  }
}

/**
 * Searches patients using optimized full-text search
 * @param supabase - Supabase client instance
 * @param query - Search query string
 * @param options - Search options
 * @returns Matching patient records
 */
export async function searchPatients(
  supabase: SupabaseClient,
  query: string,
  options: {
    limit?: number
    offset?: number
    searchMedications?: boolean
    searchAppointments?: boolean
  } = {}
): Promise<PatientSearchResult[]> {
  try {
    let rpcQuery = supabase
      .from('patient_search')
      .select('*')

    if (query.trim()) {
      // Use full-text search if query has multiple words
      if (query.includes(' ')) {
        rpcQuery = rpcQuery.textSearch('search_vector', query)
      } else {
        // Use trigram similarity for single word queries
        rpcQuery = rpcQuery.ilike('first_name', `%${query}%`)
          .or(`last_name.ilike.%${query}%`)
      }
    }

    if (options.searchMedications) {
      rpcQuery = rpcQuery.or(`medications.cs.{${query}}`)
    }

    if (options.searchAppointments) {
      rpcQuery = rpcQuery.or(`appointment_types.cs.{${query}}`)
        .or(`appointment_notes.cs.{${query}}`)
    }

    if (options.limit) {
      rpcQuery = rpcQuery.limit(options.limit)
    }

    if (options.offset) {
      rpcQuery = rpcQuery.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      )
    }

    const { data, error } = await rpcQuery

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error searching patients:', error)
    toast.error('Failed to search patients')
    throw error
  }
} 
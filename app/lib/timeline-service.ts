import { SupabaseClient } from '@supabase/supabase-js'
import { TimelineEvent } from '@/types/timeline'

export async function createTimelineEvent(
  supabase: SupabaseClient,
  event: Omit<TimelineEvent, 'id' | 'created_at'>
) {
  const { data, error } = await supabase
    .from('timeline_events')
    .insert([event])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getPatientTimeline(
  supabase: SupabaseClient,
  patientId: number,
  options: {
    types?: string[]
    startDate?: Date
    endDate?: Date
    limit?: number
  } = {}
) {
  let query = supabase
    .from('timeline_events')
    .select(`
      *,
      appointments(*),
      prescriptions(*),
      vitals(*),
      lab_results(*)
    `)
    .eq('patient_id', patientId)
    .order('date', { ascending: false })

  if (options.types?.length) {
    query = query.in('type', options.types)
  }

  if (options.startDate) {
    query = query.gte('date', options.startDate.toISOString())
  }

  if (options.endDate) {
    query = query.lte('date', options.endDate.toISOString())
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data as TimelineEvent[]
}

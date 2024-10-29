import { SupabaseClient } from '@supabase/supabase-js'
import { convertLocalToUTC } from './dateUtils'

export async function rescheduleAppointment(
  supabase: SupabaseClient, 
  appointmentId: number | string, 
  newDate: Date
) {
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*, patients(name), doctors(last_name)')
    .eq('id', appointmentId)
    .single()

  if (fetchError) throw fetchError

  const utcDate = convertLocalToUTC(newDate)
  const { error: updateError } = await supabase
    .from('appointments')
    .update({ date: utcDate.toISOString() })
    .eq('id', appointmentId)

  if (updateError) throw updateError
}

export async function cancelAppointment(
  supabase: SupabaseClient, 
  appointmentId: number | string
) {
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId)

  if (error) throw error
}

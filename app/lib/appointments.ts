import { Appointment } from '@/types'
import { SupabaseClient } from '@supabase/supabase-js'

export async function rescheduleAppointment(supabase: SupabaseClient, appointmentId: number | string, newDate: string, newTime: string) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ date: `${newDate}T${newTime}` })
      .eq('id', appointmentId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error rescheduling appointment:', error)
    throw error
  }
}

export async function cancelAppointment(supabase: SupabaseClient, appointmentId: number | string) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error cancelling appointment:', error)
    throw error
  }
}
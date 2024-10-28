import { SupabaseClient } from '@supabase/supabase-js'
import { createNotification } from './notifications'

export async function rescheduleAppointment(
  supabase: SupabaseClient, 
  appointmentId: number, 
  newDate: Date
) {
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*, patients(name), doctors(last_name)')
    .eq('id', appointmentId)
    .single()

  if (fetchError) throw fetchError

  const { error: updateError } = await supabase
    .from('appointments')
    .update({ date: newDate.toISOString() })
    .eq('id', appointmentId)

  if (updateError) throw updateError

  // Create notification
  await createNotification(supabase, {
    userId: appointment.user_id,
    type: 'appointment',
    message: `Appointment with Dr. ${appointment.doctors.last_name} for ${appointment.patients.name} rescheduled to ${newDate.toLocaleDateString()}`,
    data: { 
      appointmentId,
      newDate: newDate.toISOString(),
      patientId: appointment.patient_id,
      doctorId: appointment.doctor_id
    }
  })
}

export async function cancelAppointment(
  supabase: SupabaseClient, 
  appointmentId: number
) {
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*, patients(name), doctors(last_name)')
    .eq('id', appointmentId)
    .single()

  if (fetchError) throw fetchError

  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId)

  if (updateError) throw updateError

  // Create notification
  await createNotification(supabase, {
    userId: appointment.user_id,
    type: 'appointment',
    message: `Appointment with Dr. ${appointment.doctors.last_name} for ${appointment.patients.name} has been cancelled`,
    data: { 
      appointmentId,
      patientId: appointment.patient_id,
      doctorId: appointment.doctor_id
    }
  })
}

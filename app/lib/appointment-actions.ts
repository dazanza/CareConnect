import { SupabaseClient } from '@supabase/supabase-js'
import { convertLocalToUTC } from './dateUtils'
import { findConflictingAppointments, formatValidationErrors } from './appointment-validation'

export interface RescheduleResult {
  success: boolean;
  message?: string;
  appointment?: any;
}

export async function rescheduleAppointment(
  supabase: SupabaseClient, 
  appointmentId: number | string, 
  newDate: Date
): Promise<RescheduleResult> {
  try {
    // Fetch current appointment details
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        *,
        patients (id, first_name, last_name),
        doctors (id, first_name, last_name)
      `)
      .eq('id', appointmentId)
      .single()

    if (fetchError) throw fetchError
    if (!appointment) throw new Error('Appointment not found')

    // Check for scheduling conflicts
    const validation = await findConflictingAppointments(supabase, {
      doctorId: appointment.doctor_id,
      patientId: appointment.patient_id,
      proposedDate: newDate,
      excludeAppointmentId: Number(appointmentId)
    })

    if (!validation.isValid) {
      return {
        success: false,
        message: formatValidationErrors(validation.conflicts)
      }
    }

    // Proceed with rescheduling if no conflicts
    const utcDate = convertLocalToUTC(newDate)
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ date: utcDate })
      .eq('id', appointmentId)

    if (updateError) throw updateError

    return {
      success: true,
      appointment
    }
  } catch (error) {
    console.error('Error rescheduling appointment:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred while rescheduling'
    }
  }
}

export async function cancelAppointment(
  supabase: SupabaseClient, 
  appointmentId: number | string
) {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId)

    if (error) throw error
    
    return {
      success: true
    }
  } catch (error) {
    console.error('Error cancelling appointment:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred while cancelling'
    }
  }
}

// New function for creating appointments with validation
export async function createAppointment(
  supabase: SupabaseClient,
  {
    patientId,
    doctorId,
    date,
    type,
    location,
    notes
  }: {
    patientId: number;
    doctorId: number;
    date: Date;
    type: string;
    location: string;
    notes?: string;
  }
) {
  try {
    // Check for scheduling conflicts
    const validation = await findConflictingAppointments(supabase, {
      doctorId,
      patientId,
      proposedDate: date
    })

    if (!validation.isValid) {
      return {
        success: false,
        message: formatValidationErrors(validation.conflicts)
      }
    }

    // Proceed with creating appointment if no conflicts
    const utcDate = convertLocalToUTC(date)
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        date: utcDate,
        type,
        location,
        notes,
        status: 'scheduled'
      })
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      appointment: data
    }
  } catch (error) {
    console.error('Error creating appointment:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred while creating appointment'
    }
  }
}

import { SupabaseClient } from '@supabase/supabase-js'
import { Prescription } from '@/app/components/prescriptions/PrescriptionCard'

export async function fetchPrescriptions(supabase: SupabaseClient, options?: {
  patientId?: number
  doctorId?: number
  status?: string
  startDate?: string
  endDate?: string
  prescriptionId?: number
}) {
  let query = supabase
    .from('prescriptions')
    .select(`
      id,
      medication,
      dosage,
      frequency,
      start_date,
      end_date,
      duration,
      refills,
      status,
      notes,
      patient:patients!patient_id (
        id,
        first_name,
        last_name,
        nickname
      ),
      doctor:doctors!prescribed_by (
        id,
        first_name,
        last_name
      )
    `)

  if (options?.prescriptionId) {
    query = query.eq('id', options.prescriptionId)
  }

  if (options?.patientId) {
    query = query.eq('patient_id', options.patientId)
  }

  if (options?.doctorId) {
    query = query.eq('prescribed_by', options.doctorId)
  }

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.startDate) {
    query = query.gte('start_date', options.startDate)
  }

  if (options?.endDate) {
    query = query.lte('end_date', options.endDate)
  }

  const { data: prescriptionsData, error } = await query.order('start_date', { ascending: false })

  if (error) {
    throw error
  }

  return prescriptionsData.map(prescription => ({
    ...prescription,
    patient: {
      id: prescription.patient.id,
      name: `${prescription.patient.first_name} ${prescription.patient.last_name}`,
      nickname: prescription.patient.nickname
    },
    doctor: {
      id: prescription.doctor.id,
      name: `${prescription.doctor.first_name} ${prescription.doctor.last_name}`
    }
  })) as Prescription[]
}

export async function fetchPrescriptionHistory(supabase: SupabaseClient, prescriptionId: number) {
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('prescription_id', prescriptionId)
    .order('date', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function createPrescription(
  supabase: SupabaseClient, 
  prescription: Omit<Prescription, 'id' | 'patient' | 'doctor'> & {
    patient_id: number
    prescribed_by: number
  }
) {
  const { data: newPrescription, error: prescriptionError } = await supabase
    .from('prescriptions')
    .insert([prescription])
    .select()
    .single()

  if (prescriptionError) {
    throw prescriptionError
  }

  // Create timeline event for new prescription
  const { error: eventError } = await supabase
    .from('timeline_events')
    .insert([{
      patient_id: prescription.patient_id,
      prescription_id: newPrescription.id,
      type: 'created',
      title: `Prescription created: ${prescription.medication}`,
      description: `${prescription.dosage} ${prescription.frequency}`,
      date: new Date().toISOString(),
      metadata: {
        new_value: {
          medication: prescription.medication,
          dosage: prescription.dosage,
          frequency: prescription.frequency
        }
      }
    }])

  if (eventError) {
    throw eventError
  }

  return newPrescription
}

export async function updatePrescription(
  supabase: SupabaseClient, 
  id: number, 
  updates: Partial<Prescription>,
  reason?: string
) {
  // Fetch current prescription data
  const { data: currentPrescription, error: fetchError } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw fetchError
  }

  // Update prescription
  const { data: updatedPrescription, error: updateError } = await supabase
    .from('prescriptions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    throw updateError
  }

  // Create timeline event for the update
  const { error: eventError } = await supabase
    .from('timeline_events')
    .insert([{
      patient_id: currentPrescription.patient_id,
      prescription_id: id,
      type: updates.status === 'discontinued' ? 'discontinued' : 'updated',
      title: `Prescription ${updates.status === 'discontinued' ? 'discontinued' : 'updated'}: ${currentPrescription.medication}`,
      description: reason,
      date: new Date().toISOString(),
      metadata: {
        old_value: currentPrescription,
        new_value: updates,
        reason
      }
    }])

  if (eventError) {
    throw eventError
  }

  return updatedPrescription
}

export async function refillPrescription(
  supabase: SupabaseClient, 
  id: number,
  refillCount: number
) {
  // Fetch current prescription
  const { data: prescription, error: fetchError } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw fetchError
  }

  // Update refill count
  const { data: updatedPrescription, error: updateError } = await supabase
    .from('prescriptions')
    .update({ refills: refillCount })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    throw updateError
  }

  // Create timeline event for refill
  const { error: eventError } = await supabase
    .from('timeline_events')
    .insert([{
      patient_id: prescription.patient_id,
      prescription_id: id,
      type: 'refilled',
      title: `Prescription refilled: ${prescription.medication}`,
      description: `Refills remaining: ${refillCount}`,
      date: new Date().toISOString(),
      metadata: {
        old_value: { refills: prescription.refills },
        new_value: { refills: refillCount }
      }
    }])

  if (eventError) {
    throw eventError
  }

  return updatedPrescription
}

export async function deletePrescription(supabase: SupabaseClient, id: number, reason?: string) {
  // Fetch prescription before deletion
  const { data: prescription, error: fetchError } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw fetchError
  }

  // Create timeline event for deletion
  const { error: eventError } = await supabase
    .from('timeline_events')
    .insert([{
      patient_id: prescription.patient_id,
      prescription_id: id,
      type: 'discontinued',
      title: `Prescription discontinued: ${prescription.medication}`,
      description: reason,
      date: new Date().toISOString(),
      metadata: {
        old_value: prescription,
        reason
      }
    }])

  if (eventError) {
    throw eventError
  }

  // Delete the prescription
  const { error: deleteError } = await supabase
    .from('prescriptions')
    .delete()
    .eq('id', id)

  if (deleteError) {
    throw deleteError
  }
} 
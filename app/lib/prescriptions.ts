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
  // Build query params
  const params = new URLSearchParams()
  if (options?.patientId) params.set('patientId', options.patientId.toString())
  if (options?.status) params.set('status', options.status)
  if (options?.startDate) params.set('startDate', options.startDate)

  // Fetch from API route
  const response = await fetch(`/api/prescriptions?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch prescriptions')
  }

  const data = await response.json()
  return data as Prescription[]
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
  // Fetch current prescription data
  const { data: prescription, error: fetchError } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw fetchError
  }

  // Update prescription status to discontinued
  const { data: updatedPrescription, error: updateError } = await supabase
    .from('prescriptions')
    .update({ status: 'discontinued' })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    throw updateError
  }

  // Create timeline event for discontinuation
  const { error: eventError } = await supabase
    .from('timeline_events')
    .insert([{
      patient_id: prescription.patient_id,
      prescription_id: id,
      type: 'discontinued',
      title: `Prescription discontinued: ${prescription.medication}`,
      description: reason || 'No reason provided',
      date: new Date().toISOString(),
      metadata: {
        old_value: prescription,
        reason
      }
    }])

  if (eventError) {
    throw eventError
  }

  return updatedPrescription
} 
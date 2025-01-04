import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

interface Doctor {
  id: number
  first_name: string
  last_name: string
  specialization: string
  contact_number: string | null
  email: string | null
}

interface PatientDoctorResponse {
  id: number
  doctor: Doctor
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { patientId, doctorId } = await request.json()

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error(`Failed to get user: ${userError.message}`)
    if (!userData.user?.id) throw new Error('User not authenticated')

    // First verify that the patient belongs to the user
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .eq('user_id', userData.user.id.toString())
      .single()

    if (patientError || !patientData) {
      throw new Error('Patient not found or access denied')
    }

    // Then verify that the doctor belongs to the user
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .select('id')
      .eq('id', doctorId)
      .eq('user_id', userData.user.id.toString())
      .single()

    if (doctorError || !doctorData) {
      throw new Error('Doctor not found or access denied')
    }

    const { data, error } = await supabase
      .from('patient_doctors')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        user_id: userData.user.id.toString()
      })
      .select()

    if (error) throw new Error(`Failed to insert patient-doctor relationship: ${error.message}`)

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error in POST /api/patient-doctors:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patientId')

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error(`Failed to get user: ${userError.message}`)
    if (!userData.user?.id) throw new Error('User not authenticated')
    if (!patientId) throw new Error('Patient ID is required')

    // First verify that the patient belongs to the user
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .eq('user_id', userData.user.id.toString())
      .single()

    if (patientError || !patientData) {
      throw new Error('Patient not found or access denied')
    }

    const { data, error } = await supabase
      .from('patient_doctors')
      .select(`
        id,
        doctor:doctors (
          id,
          first_name,
          last_name,
          specialization,
          contact_number,
          email
        )
      `)
      .eq('patient_id', patientId)
      .eq('user_id', userData.user.id.toString())

    if (error) throw new Error(`Failed to fetch patient's doctors: ${error.message}`)

    const patientDoctors = data as unknown as PatientDoctorResponse[]
    return NextResponse.json(patientDoctors.map(item => ({
      id: item.doctor.id,
      name: `${item.doctor.first_name} ${item.doctor.last_name}`,
      specialization: item.doctor.specialization || '',
      contact_number: item.doctor.contact_number || '',
      email: item.doctor.email || ''
    })))
  } catch (error) {
    console.error('Error in GET /api/patient-doctors:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAuth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { patientId, doctorId } = await request.json()

  try {
    const { userId } = getAuth(request)
    if (!userId) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('patient_doctors')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        user_id: userId
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
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patientId')

  try {
    const { userId } = getAuth(request)
    if (!userId) throw new Error('Not authenticated')

    if (!patientId) throw new Error('Patient ID is required')

    const { data, error } = await supabase
      .from('patient_doctors')
      .select('doctors(*)')
      .eq('patient_id', patientId)
      .eq('user_id', userId)

    if (error) throw new Error(`Failed to fetch patient's doctors: ${error.message}`)

    return NextResponse.json(data.map(item => item.doctors))
  } catch (error) {
    console.error('Error in GET /api/patient-doctors:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
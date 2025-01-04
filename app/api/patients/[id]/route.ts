import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { id } = params

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error(`Failed to get user: ${userError.message}`)
    if (!userData.user?.id) throw new Error('User not authenticated')

    // Check if the user has direct access to the patient
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .eq('user_id', userData.user.id.toString())
      .single()

    if (error) {
      // If no direct access, check for shared access
      const { data: sharedData, error: sharedError } = await supabase
        .from('patient_shares')
        .select('*')
        .eq('patient_id', id)
        .eq('shared_with_user_id', userData.user.id.toString())
        .single()

      if (sharedError) {
        throw new Error('Patient not found or access denied')
      }

      // If shared access exists, get the patient data
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single()

      if (patientError) {
        throw new Error('Failed to fetch patient data')
      }

      return NextResponse.json(patientData)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/patients/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { id } = params
  const updates = await request.json()

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error(`Failed to get user: ${userError.message}`)
    if (!userData.user?.id) throw new Error('User not authenticated')

    // First verify that the patient belongs to the user
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', id)
      .eq('user_id', userData.user.id.toString())
      .single()

    if (patientError || !patientData) {
      // Check if user has write access through sharing
      const { data: sharedData, error: sharedError } = await supabase
        .from('patient_shares')
        .select('*')
        .eq('patient_id', id)
        .eq('shared_with_user_id', userData.user.id.toString())
        .in('access_level', ['write', 'admin'])
        .single()

      if (sharedError) {
        throw new Error('Patient not found or access denied')
      }
    }

    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update patient: ${error.message}`)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PATCH /api/patients/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { id } = params

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error(`Failed to get user: ${userError.message}`)
    if (!userData.user?.id) throw new Error('User not authenticated')

    // First verify that the patient belongs to the user
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', id)
      .eq('user_id', userData.user.id.toString())
      .single()

    if (patientError || !patientData) {
      // Check if user has admin access through sharing
      const { data: sharedData, error: sharedError } = await supabase
        .from('patient_shares')
        .select('*')
        .eq('patient_id', id)
        .eq('shared_with_user_id', userData.user.id.toString())
        .eq('access_level', 'admin')
        .single()

      if (sharedError) {
        throw new Error('Patient not found or access denied')
      }
    }

    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete patient: ${error.message}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/patients/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
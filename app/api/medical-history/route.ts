import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patientId')
  
  if (!patientId) {
    return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient<Database>({ cookies })

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error(`Failed to get user: ${userError.message}`)
    if (!userData.user?.id) throw new Error('User not authenticated')

    // First verify that the user has access to the patient
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .eq('user_id', userData.user.id.toString())
      .single()

    if (patientError) {
      // Check if user has access through sharing
      const { data: sharedData, error: sharedError } = await supabase
        .from('patient_shares')
        .select('*')
        .eq('patient_id', patientId)
        .eq('shared_with_user_id', userData.user.id.toString())
        .single()

      if (sharedError) {
        throw new Error('Patient not found or access denied')
      }
    }

    const { data, error } = await supabase
      .from('medical_history')
      .select(`
        *,
        doctor:doctors(
          id,
          first_name,
          last_name
        )
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching medical history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medical history' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error(`Failed to get user: ${userError.message}`)
    if (!userData.user?.id) throw new Error('User not authenticated')

    const body = await request.json()

    // Validate required fields
    if (!body.patient_id || !body.type || !body.title || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // First verify that the user has access to the patient
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', body.patient_id)
      .eq('user_id', userData.user.id.toString())
      .single()

    if (patientError) {
      // Check if user has write access through sharing
      const { data: sharedData, error: sharedError } = await supabase
        .from('patient_shares')
        .select('*')
        .eq('patient_id', body.patient_id)
        .eq('shared_with_user_id', userData.user.id.toString())
        .in('access_level', ['write', 'admin'])
        .single()

      if (sharedError) {
        throw new Error('Patient not found or access denied')
      }
    }

    // If doctor_id is provided, verify that the doctor belongs to the user
    if (body.doctor_id) {
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('id', body.doctor_id)
        .eq('user_id', userData.user.id.toString())
        .single()

      if (doctorError) {
        throw new Error('Doctor not found or access denied')
      }
    }

    const { data, error } = await supabase
      .from('medical_history')
      .insert({
        ...body,
        user_id: userData.user.id.toString()
      })
      .select(`
        *,
        doctor:doctors(
          id,
          first_name,
          last_name
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating medical history entry:', error)
    return NextResponse.json(
      { error: 'Failed to create medical history entry' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error(`Failed to get user: ${userError.message}`)
    if (!userData.user?.id) throw new Error('User not authenticated')

    const { id, ...updates } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Medical history entry ID is required' },
        { status: 400 }
      )
    }

    // First verify that the entry belongs to the user
    const { data: entryData, error: entryError } = await supabase
      .from('medical_history')
      .select('patient_id')
      .eq('id', id)
      .eq('user_id', userData.user.id.toString())
      .single()

    if (entryError) {
      // If not found, check if user has write access through sharing
      const { data: historyData, error: historyError } = await supabase
        .from('medical_history')
        .select('patient_id')
        .eq('id', id)
        .single()

      if (historyError) {
        throw new Error('Medical history entry not found')
      }

      const { data: sharedData, error: sharedError } = await supabase
        .from('patient_shares')
        .select('*')
        .eq('patient_id', historyData.patient_id)
        .eq('shared_with_user_id', userData.user.id.toString())
        .in('access_level', ['write', 'admin'])
        .single()

      if (sharedError) {
        throw new Error('Access denied')
      }
    }

    // If doctor_id is being updated, verify that the doctor belongs to the user
    if (updates.doctor_id) {
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('id', updates.doctor_id)
        .eq('user_id', userData.user.id.toString())
        .single()

      if (doctorError) {
        throw new Error('Doctor not found or access denied')
      }
    }

    const { data, error } = await supabase
      .from('medical_history')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        doctor:doctors(
          id,
          first_name,
          last_name
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating medical history entry:', error)
    return NextResponse.json(
      { error: 'Failed to update medical history entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'Medical history entry ID is required' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient<Database>({ cookies })

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error(`Failed to get user: ${userError.message}`)
    if (!userData.user?.id) throw new Error('User not authenticated')

    // First verify that the entry belongs to the user
    const { data: entryData, error: entryError } = await supabase
      .from('medical_history')
      .select('patient_id')
      .eq('id', id)
      .eq('user_id', userData.user.id.toString())
      .single()

    if (entryError) {
      // If not found, check if user has admin access through sharing
      const { data: historyData, error: historyError } = await supabase
        .from('medical_history')
        .select('patient_id')
        .eq('id', id)
        .single()

      if (historyError) {
        throw new Error('Medical history entry not found')
      }

      const { data: sharedData, error: sharedError } = await supabase
        .from('patient_shares')
        .select('*')
        .eq('patient_id', historyData.patient_id)
        .eq('shared_with_user_id', userData.user.id.toString())
        .eq('access_level', 'admin')
        .single()

      if (sharedError) {
        throw new Error('Access denied')
      }
    }

    const { error } = await supabase
      .from('medical_history')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting medical history entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete medical history entry' },
      { status: 500 }
    )
  }
}

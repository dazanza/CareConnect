import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw new Error(`Failed to get user: ${userError.message}`)
    if (!userData.user?.id) throw new Error('User not authenticated')

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Get a single patient
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select(`
          *,
          medical_history:medical_history(
            id,
            type,
            title,
            description,
            date,
            doctor:doctors(
              id,
              first_name,
              last_name
            )
          )
        `)
        .eq('id', id)
        .eq('user_id', userData.user.id.toString())
        .single()

      if (patientError) {
        // Check if user has access through sharing
        const { data: sharedData, error: sharedError } = await supabase
          .from('patient_shares')
          .select('*')
          .eq('patient_id', id)
          .eq('shared_with_user_id', userData.user.id.toString())
          .single()

        if (sharedError) {
          throw new Error('Patient not found or access denied')
        }

        // If shared, get the patient data
        const { data: sharedPatientData, error: sharedPatientError } = await supabase
          .from('patients')
          .select(`
            *,
            medical_history:medical_history(
              id,
              type,
              title,
              description,
              date,
              doctor:doctors(
                id,
                first_name,
                last_name
              )
            )
          `)
          .eq('id', id)
          .single()

        if (sharedPatientError) {
          throw new Error('Failed to fetch shared patient data')
        }

        return NextResponse.json({
          ...sharedPatientData,
          shared: true,
          access_level: sharedData.access_level
        })
      }

      return NextResponse.json(patientData)
    } else {
      // Get all patients
      const { data: ownedData, error: ownedError } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userData.user.id.toString())
        .order('name')

      if (ownedError) throw ownedError

      // Get shared patients
      const { data: sharedData, error: sharedError } = await supabase
        .from('patient_shares')
        .select(`
          access_level,
          patient:patients(*)
        `)
        .eq('shared_with_user_id', userData.user.id.toString())

      if (sharedError) throw sharedError

      // Combine owned and shared patients
      const sharedPatients = sharedData.map(share => ({
        ...share.patient,
        shared: true,
        access_level: share.access_level
      }))

      return NextResponse.json([...ownedData, ...sharedPatients])
    }
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
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
    if (!body.name || !body.date_of_birth) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('patients')
      .insert({
        ...body,
        user_id: userData.user.id.toString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json(
      { error: 'Failed to create patient' },
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
        { error: 'Patient ID is required' },
        { status: 400 }
      )
    }

    // First verify that the patient belongs to the user
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', id)
      .eq('user_id', userData.user.id.toString())
      .single()

    if (patientError) {
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

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating patient:', error)
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient<Database>({ cookies })

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

    if (patientError) {
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

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting patient:', error)
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    )
  }
}


import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patientId')
  
  if (!patientId) {
    return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        doctor:doctors(id, name)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prescriptions' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const json = await request.json()
    const {
      medication,
      dosage,
      frequency,
      start_date,
      end_date,
      duration,
      refills,
      status,
      notes,
      patient_id,
      doctor_id,
    } = json

    // Create the prescription
    const { data: prescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .insert({
        medication,
        dosage,
        frequency,
        start_date,
        end_date,
        duration,
        refills,
        status,
        notes,
        patient_id,
        prescribed_by: doctor_id,
        user_id: session.user.id,
      })
      .select()
      .single()

    if (prescriptionError) {
      console.error('Error creating prescription:', prescriptionError)
      return new NextResponse('Error creating prescription', { status: 500 })
    }

    // Create a timeline event for the new prescription
    const { error: timelineError } = await supabase
      .from('timeline_events')
      .insert({
        patient_id,
        user_id: session.user.id,
        type: 'prescription_created',
        date: new Date().toISOString(),
        title: `New prescription added: ${medication}`,
        description: `Prescribed ${medication} (${dosage}, ${frequency})`,
        metadata: {
          prescription_id: prescription.id,
          medication,
          dosage,
          frequency,
        },
        created_by: session.user.id,
      })

    if (timelineError) {
      console.error('Error creating timeline event:', timelineError)
      // Don't fail the request if timeline event creation fails
    }

    return NextResponse.json(prescription)
  } catch (error) {
    console.error('Error in POST /api/prescriptions:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { id, status } = await request.json()
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .update({ status })
      .eq('id', id)
      .select('*, doctor:doctors(id, name)')
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating prescription:', error)
    return NextResponse.json(
      { error: 'Failed to update prescription' },
      { status: 500 }
    )
  }
}

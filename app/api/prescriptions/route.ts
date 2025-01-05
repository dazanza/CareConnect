import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')

    let query = supabase
      .from('prescriptions')
      .select(`
        *,
        patient:patients(id, first_name, last_name, nickname),
        doctor:doctors(id, first_name, last_name)
      `)
      .eq('user_id', session.user.id)

    if (patientId) {
      query = query.eq('patient_id', patientId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (startDate) {
      query = query.gte('start_date', startDate)
    }

    const { data: prescriptions, error } = await query

    if (error) {
      console.error('Error fetching prescriptions:', error)
      return new NextResponse('Failed to fetch prescriptions', { status: 500 })
    }

    // Transform the data to match the frontend expectations
    const transformedPrescriptions = prescriptions.map((prescription: any) => ({
      id: prescription.id,
      medication: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      start_date: prescription.start_date,
      end_date: prescription.end_date,
      refills: prescription.refills,
      status: prescription.status,
      notes: prescription.notes,
      patient: {
        id: prescription.patient.id,
        name: `${prescription.patient.first_name} ${prescription.patient.last_name}`,
        nickname: prescription.patient.nickname
      },
      doctor: {
        id: prescription.doctor.id,
        name: `${prescription.doctor.first_name} ${prescription.doctor.last_name}`
      }
    }))

    return NextResponse.json(transformedPrescriptions)
  } catch (error) {
    console.error('Error in prescription fetch:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
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
      medications,
      patient_id,
      prescribed_by,
      start_date,
      end_date,
      appointment_id,
      log_id,
      notes,
      status = 'active'
    } = json

    // Create the prescription group
    const { data: prescriptionGroup, error: groupError } = await supabase
      .from('prescription_groups')
      .insert([{
        user_id: session.user.id,
        patient_id,
        prescribed_by,
        start_date,
        end_date,
        appointment_id,
        log_id,
        notes,
        status
      }])
      .select()
      .single()

    if (groupError) {
      console.error('Error creating prescription group:', groupError)
      return new NextResponse('Failed to create prescription group', { status: 500 })
    }

    // Create individual prescriptions for each medication
    const prescriptionPromises = medications.map(async (medication: any) => {
      const { data: prescription, error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert([{
          group_id: prescriptionGroup.id,
          user_id: session.user.id,
          patient_id,
          prescribed_by,
          medication: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
          duration: medication.duration,
          refills: medication.refills,
          notes: medication.notes,
          status
        }])
        .select()
        .single()

      if (prescriptionError) {
        throw prescriptionError
      }

      // Create timeline event for each prescription
      const { error: eventError } = await supabase
        .from('timeline_events')
        .insert([{
          patient_id,
          prescription_id: prescription.id,
          type: 'created',
          title: `Prescription created: ${medication.name}`,
          description: `${medication.dosage}, ${medication.frequency}`,
          date: new Date().toISOString(),
          metadata: {
            prescription: {
              ...prescription,
              group_id: prescriptionGroup.id
            }
          }
        }])

      if (eventError) {
        throw eventError
      }

      return prescription
    })

    try {
      const prescriptions = await Promise.all(prescriptionPromises)
      return NextResponse.json({ 
        group: prescriptionGroup,
        prescriptions 
      })
    } catch (error) {
      console.error('Error creating prescriptions:', error)
      return new NextResponse('Failed to create prescriptions', { status: 500 })
    }
  } catch (error) {
    console.error('Error in prescription creation:', error)
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

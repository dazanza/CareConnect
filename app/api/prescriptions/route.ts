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

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.patient_id || !body.doctor_id || !body.medication || 
        !body.dosage || !body.frequency || !body.duration || 
        !body.start_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .insert(body)
      .select('*, doctor:doctors(id, name)')
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating prescription:', error)
    return NextResponse.json(
      { error: 'Failed to create prescription' },
      { status: 500 }
    )
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

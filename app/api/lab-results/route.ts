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
      .from('lab_results')
      .select(`
        *,
        doctor:doctors(id, name)
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching lab results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lab results' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.patient_id || !body.doctor_id || !body.test_name || 
        !body.test_type || !body.result_value || !body.reference_range || 
        !body.unit || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate status
    if (body.status && !['normal', 'abnormal', 'critical'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('lab_results')
      .insert(body)
      .select('*, doctor:doctors(id, name)')
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating lab result:', error)
    return NextResponse.json(
      { error: 'Failed to create lab result' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'Lab result ID is required' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { error } = await supabase
      .from('lab_results')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lab result:', error)
    return NextResponse.json(
      { error: 'Failed to delete lab result' },
      { status: 500 }
    )
  }
}
